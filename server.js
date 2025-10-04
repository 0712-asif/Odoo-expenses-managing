const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed!'));
    }
  }
});

// In-memory database (replace with real database in production)
let users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@democompany.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'Admin',
    company: { 
      id: 1,
      name: 'Demo Company Inc.',
      currency_code: 'USD'
    }
  },
  {
    id: 2,
    name: 'Manager Smith',
    email: 'manager@democompany.com',
    password: bcrypt.hashSync('manager123', 10),
    role: 'Manager',
    company: { 
      id: 1,
      name: 'Demo Company Inc.',
      currency_code: 'USD'
    }
  },
  {
    id: 3,
    name: 'John Employee',
    email: 'employee@democompany.com',
    password: bcrypt.hashSync('employee123', 10),
    role: 'Employee',
    company: { 
      id: 1,
      name: 'Demo Company Inc.',
      currency_code: 'USD'
    }
  },
  {
    id: 4,
    name: 'Akash',
    email: 'emailakash117@gmail.com',
    password: bcrypt.hashSync('12345678', 10),
    role: 'Admin',
    company: { 
      id: 1,
      name: 'Your Company',
      currency_code: 'USD'
    }
  }
];

let expenses = [
  {
    id: 1,
    title: 'Business Lunch with Client',
    description: 'Lunch meeting with potential client to discuss project requirements',
    amount: 85.50,
    currency: 'USD',
    category: 'Meals',
    expense_date: '2025-01-15',
    status: 'Approved',
    user_id: 3,
    submitter_name: 'John Employee',
    expense_reference: 'EXP-001',
    receipt_url: null,
    created_at: '2025-01-15T10:30:00Z',
    approved_by: 'Manager Smith',
    approved_at: '2025-01-16T09:15:00Z'
  },
  {
    id: 2,
    title: 'Office Supplies - Stationery',
    description: 'Purchased pens, notebooks, and other office supplies',
    amount: 45.25,
    currency: 'USD',
    category: 'Office Supplies',
    expense_date: '2025-01-14',
    status: 'Approved',
    user_id: 3,
    submitter_name: 'John Employee',
    expense_reference: 'EXP-002',
    receipt_url: null,
    created_at: '2025-01-14T16:20:00Z',
    approved_by: 'Manager Smith',
    approved_at: '2025-01-15T11:30:00Z'
  }
];

let nextExpenseId = 3;
let nextUserId = 5;

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Expense Management Backend is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  console.log('Login attempt:', req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = users.find(u => u.email === email);

  if (!user) {
    console.log('User not found:', email);
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isValidPassword = bcrypt.compareSync(password, user.password);

  if (!isValidPassword) {
    console.log('Invalid password for user:', email);
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );

  const userResponse = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    company: user.company
  };

  console.log('Login successful for user:', user.email);

  res.json({
    user: userResponse,
    token: token,
    message: 'Login successful'
  });
});

app.post('/api/auth/register', (req, res) => {
  console.log('Register attempt:', req.body);

  const { firstName, lastName, email, password, companyName } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    id: nextUserId++,
    name: `${firstName} ${lastName}`,
    email: email,
    password: hashedPassword,
    role: 'Admin', // First user is admin
    company: {
      id: 1,
      name: companyName || 'Your Company',
      currency_code: 'USD'
    }
  };

  users.push(newUser);

  const token = jwt.sign(
    { 
      id: newUser.id, 
      email: newUser.email, 
      role: newUser.role 
    }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );

  const userResponse = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    company: newUser.company
  };

  console.log('Registration successful for user:', newUser.email);

  res.status(201).json({
    user: userResponse,
    token: token,
    message: 'Registration successful'
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userResponse = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    company: user.company
  };

  res.json({ user: userResponse });
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

app.post('/api/auth/refresh', authenticateToken, (req, res) => {
  const token = jwt.sign(
    { 
      id: req.user.id, 
      email: req.user.email, 
      role: req.user.role 
    }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );

  res.json({ token: token });
});

// Dashboard endpoints
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const userExpenses = expenses.filter(e => e.user_id === req.user.id);

  const totalExpenses = userExpenses.length;
  const approvedAmount = userExpenses
    .filter(e => e.status === 'Approved')
    .reduce((sum, e) => sum + e.amount, 0);
  const pendingCount = userExpenses.filter(e => e.status === 'Under Review' || e.status === 'Submitted').length;
  const rejectedCount = userExpenses.filter(e => e.status === 'Rejected').length;

  const recentExpenses = userExpenses
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)
    .map(e => ({
      id: e.id,
      title: e.title,
      amount: e.amount,
      status: e.status,
      date: e.expense_date,
      submittedBy: e.submitter_name
    }));

  res.json({
    totalExpenses,
    approvedAmount,
    pendingCount,
    rejectedCount,
    recentExpenses
  });
});

// Expense endpoints
app.get('/api/expenses', authenticateToken, (req, res) => {
  let userExpenses;

  if (req.user.role === 'Admin') {
    userExpenses = expenses;
  } else if (req.user.role === 'Manager') {
    // Manager can see all expenses (for approval)
    userExpenses = expenses;
  } else {
    // Employee can only see their own expenses
    userExpenses = expenses.filter(e => e.user_id === req.user.id);
  }

  res.json({
    expenses: userExpenses.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      amount: e.amount,
      currency: e.currency,
      category: e.category,
      expense_date: e.expense_date,
      status: e.status,
      expense_reference: e.expense_reference,
      receipt_url: e.receipt_url,
      created_at: e.created_at,
      submitter_name: e.submitter_name
    }))
  });
});

app.post('/api/expenses', authenticateToken, upload.single('receipt'), (req, res) => {
  const { title, description, amount, currency, category, expense_date } = req.body;

  if (!title || !amount || !category) {
    return res.status(400).json({ error: 'Title, amount, and category are required' });
  }

  const user = users.find(u => u.id === req.user.id);

  const newExpense = {
    id: nextExpenseId++,
    title,
    description: description || '',
    amount: parseFloat(amount),
    currency: currency || 'USD',
    category,
    expense_date: expense_date || new Date().toISOString().split('T')[0],
    status: 'Submitted',
    user_id: req.user.id,
    submitter_name: user.name,
    expense_reference: `EXP-${String(nextExpenseId - 1).padStart(3, '0')}`,
    receipt_url: req.file ? `/uploads/${req.file.filename}` : null,
    created_at: new Date().toISOString(),
    approved_by: null,
    approved_at: null
  };

  expenses.push(newExpense);

  console.log('New expense created:', newExpense);

  res.status(201).json({
    expense: newExpense,
    message: 'Expense created successfully'
  });
});

app.get('/api/expenses/:id', authenticateToken, (req, res) => {
  const expenseId = parseInt(req.params.id);
  const expense = expenses.find(e => e.id === expenseId);

  if (!expense) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  // Check permissions
  if (req.user.role === 'Employee' && expense.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json({ expense });
});

app.put('/api/expenses/:id', authenticateToken, upload.single('receipt'), (req, res) => {
  const expenseId = parseInt(req.params.id);
  const expense = expenses.find(e => e.id === expenseId);

  if (!expense) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  // Check permissions
  if (req.user.role === 'Employee' && expense.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Can only edit draft or submitted expenses
  if (!['Draft', 'Submitted'].includes(expense.status)) {
    return res.status(400).json({ error: 'Cannot edit expense in current status' });
  }

  const { title, description, amount, currency, category, expense_date } = req.body;

  if (title) expense.title = title;
  if (description !== undefined) expense.description = description;
  if (amount) expense.amount = parseFloat(amount);
  if (currency) expense.currency = currency;
  if (category) expense.category = category;
  if (expense_date) expense.expense_date = expense_date;

  if (req.file) {
    expense.receipt_url = `/uploads/${req.file.filename}`;
  }

  res.json({
    expense,
    message: 'Expense updated successfully'
  });
});

app.delete('/api/expenses/:id', authenticateToken, (req, res) => {
  const expenseId = parseInt(req.params.id);
  const expenseIndex = expenses.findIndex(e => e.id === expenseId);

  if (expenseIndex === -1) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  const expense = expenses[expenseIndex];

  // Check permissions
  if (req.user.role === 'Employee' && expense.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Can only delete draft expenses
  if (expense.status !== 'Draft') {
    return res.status(400).json({ error: 'Can only delete draft expenses' });
  }

  expenses.splice(expenseIndex, 1);

  res.json({ message: 'Expense deleted successfully' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum 10MB allowed.' });
    }
  }

  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/auth/me',
      'GET /api/dashboard/stats',
      'GET /api/expenses',
      'POST /api/expenses'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`ðŸš€ Expense Management Backend Server running on port ${PORT}`);
  console.log(`ðŸ“ API Base URL: http://localhost:${PORT}/api`);
  console.log(`ðŸ” Health Check: http://localhost:${PORT}/api/health`);
  console.log(`ðŸ‘¥ Sample Users:`);
  console.log(`   Admin: admin@democompany.com / admin123`);
  console.log(`   Manager: manager@democompany.com / manager123`);
  console.log(`   Employee: employee@democompany.com / employee123`);
  console.log(`   Custom: emailakash117@gmail.com / 12345678`);
});
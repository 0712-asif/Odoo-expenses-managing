const jwt = require('jsonwebtoken');
const { User, Company } = require('../models');
const { currencyService } = require('../utils/currencyService');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

const authController = {
  async register(req, res) {
    try {
      const { name, email, password, companyName, country } = req.body;

      // Validate input
      if (!name || !email || !password || !companyName || !country) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required: name, email, password, companyName, country'
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Password strength validation
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Get currency info for country
      let currencyInfo;
      try {
        currencyInfo = await currencyService.getCurrencyByCountry(country);
      } catch (error) {
        console.warn('Currency service failed, using USD default:', error.message);
        currencyInfo = { code: 'USD', name: 'US Dollar', symbol: '$' };
      }

      // Create company first
      const company = await Company.create({
        name: companyName.trim(),
        country: country.trim(),
        currency_code: currencyInfo.code,
        currency_name: currencyInfo.name,
        currency_symbol: currencyInfo.symbol,
        expense_policy: {
          max_expense_amount: 10000,
          require_receipt_over: 25,
          auto_approve_under: 0,
          allowed_categories: ['Travel', 'Meals', 'Office Supplies', 'Equipment', 'Software', 'Other'],
          approval_required_over: 100
        },
        approval_settings: {
          default_manager_approval: true,
          parallel_approvals: false,
          auto_escalation_days: 7,
          reminder_frequency_days: 2
        }
      });

      // Create admin user
      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: 'Admin',
        company_id: company.id,
        department: 'Administration',
        designation: 'System Administrator',
        date_joined: new Date()
      });

      // Update company admin
      await company.update({ admin_id: user.id });

      // Update user's last login
      await user.updateLastLogin();

      // Generate token
      const token = generateToken(user);

      // Return user data without password
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employee_code: user.employee_code,
        company: {
          id: company.id,
          name: company.name,
          country: company.country,
          currency_code: company.currency_code,
          currency_name: company.currency_name,
          currency_symbol: company.currency_symbol
        }
      };

      res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome to your expense management system.',
        user: userData,
        token
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed due to server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find user with company info and manager
      const user = await User.findOne({
        where: { 
          email: email.toLowerCase().trim(),
          is_active: true 
        },
        include: [{
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'country', 'currency_code', 'currency_name', 'currency_symbol']
        }, {
          model: User,
          as: 'manager',
          attributes: ['id', 'name', 'email', 'role']
        }]
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Update last login
      await user.updateLastLogin();

      // Generate token
      const token = generateToken(user);

      // Return user data
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employee_code: user.employee_code,
        phone: user.phone,
        designation: user.designation,
        company: user.company,
        manager: user.manager,
        last_login: user.last_login
      };

      res.json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        user: userData,
        token
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed due to server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async getMe(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        include: [{
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'country', 'currency_code', 'currency_name', 'currency_symbol', 'expense_policy']
        }, {
          model: User,
          as: 'manager',
          attributes: ['id', 'name', 'email', 'role']
        }],
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({ 
        success: true,
        user 
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user information',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async createEmployee(req, res) {
    try {
      // Only Admin can create employees
      if (req.user.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only administrators can create employees.'
        });
      }

      const { 
        name, 
        email, 
        password, 
        role, 
        department, 
        manager_id, 
        employee_code,
        phone,
        designation 
      } = req.body;

      // Validate required fields
      if (!name || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, password, and role are required'
        });
      }

      // Validate role
      if (!['Employee', 'Manager'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role must be either Employee or Manager'
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Check if email already exists
      const existingUser = await User.findOne({ 
        where: { email: email.toLowerCase().trim() } 
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Validate manager if provided
      let manager = null;
      if (manager_id) {
        manager = await User.findOne({
          where: { 
            id: manager_id, 
            company_id: req.user.company_id,
            role: ['Manager', 'Admin'],
            is_active: true
          },
          attributes: ['id', 'name', 'email', 'role']
        });
        if (!manager) {
          return res.status(400).json({
            success: false,
            message: 'Invalid manager selected. Manager must be an active user with Manager or Admin role.'
          });
        }
      }

      // Create user
      const newUser = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role,
        company_id: req.user.company_id,
        manager_id,
        department: department?.trim(),
        employee_code: employee_code?.trim(),
        phone: phone?.trim(),
        designation: designation?.trim(),
        date_joined: new Date()
      });

      // Return user data without password
      const userData = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        employee_code: newUser.employee_code,
        phone: newUser.phone,
        designation: newUser.designation,
        date_joined: newUser.date_joined,
        manager: manager
      };

      res.status(201).json({
        success: true,
        message: `${role} created successfully`,
        user: userData
      });

    } catch (error) {
      console.error('Create employee error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create employee',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async updateUserRole(req, res) {
    try {
      // Only Admin can update roles
      if (req.user.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only administrators can update user roles.'
        });
      }

      const { userId } = req.params;
      const { role, manager_id, department, designation } = req.body;

      // Find user
      const user = await User.findOne({
        where: { 
          id: userId, 
          company_id: req.user.company_id 
        },
        include: [{
          model: User,
          as: 'manager',
          attributes: ['id', 'name', 'email', 'role']
        }]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Cannot change admin role of current user
      if (user.role === 'Admin' && user.id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot change your own admin role'
        });
      }

      // Validate new role
      if (role && !['Employee', 'Manager', 'Admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be Employee, Manager, or Admin'
        });
      }

      // Validate manager if provided
      let manager = null;
      if (manager_id !== undefined) {
        if (manager_id) {
          manager = await User.findOne({
            where: { 
              id: manager_id, 
              company_id: req.user.company_id,
              role: ['Manager', 'Admin'],
              is_active: true
            },
            attributes: ['id', 'name', 'email', 'role']
          });
          if (!manager) {
            return res.status(400).json({
              success: false,
              message: 'Invalid manager selected'
            });
          }
        }
      }

      // Update user
      const updateData = {};
      if (role) updateData.role = role;
      if (manager_id !== undefined) updateData.manager_id = manager_id;
      if (department !== undefined) updateData.department = department?.trim();
      if (designation !== undefined) updateData.designation = designation?.trim();

      await user.update(updateData);

      res.json({
        success: true,
        message: 'User updated successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          designation: user.designation,
          manager_id: user.manager_id,
          manager: manager
        }
      });

    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async getCompanyUsers(req, res) {
    try {
      // Only Admin and Manager can view all users
      if (!['Admin', 'Manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }

      const { role, department, is_active } = req.query;

      const whereClause = { 
        company_id: req.user.company_id
      };

      // Apply filters
      if (role) whereClause.role = role;
      if (department) whereClause.department = department;
      if (is_active !== undefined) whereClause.is_active = is_active === 'true';

      const users = await User.findAll({
        where: whereClause,
        include: [{
          model: User,
          as: 'manager',
          attributes: ['id', 'name', 'email', 'role']
        }],
        attributes: { exclude: ['password'] },
        order: [['role', 'ASC'], ['name', 'ASC']]
      });

      res.json({ 
        success: true,
        users,
        total: users.length
      });

    } catch (error) {
      console.error('Get company users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async updateProfile(req, res) {
    try {
      const { name, phone, designation, notification_preferences } = req.body;

      const user = await User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update allowed fields
      const updateData = {};
      if (name) updateData.name = name.trim();
      if (phone !== undefined) updateData.phone = phone?.trim();
      if (designation !== undefined) updateData.designation = designation?.trim();
      if (notification_preferences) updateData.notification_preferences = notification_preferences;

      await user.update(updateData);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          designation: user.designation,
          notification_preferences: user.notification_preferences
        }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = authController;
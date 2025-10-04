import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Visibility,
  Edit,
  Delete,
  Receipt,
  Refresh,
  GetApp
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import apiClient from '../services/apiClient';

const ExpenseList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [error, setError] = useState('');

  const statuses = ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Cancelled'];
  const categories = ['Travel', 'Meals', 'Office Supplies', 'Equipment', 'Software', 'Marketing', 'Training', 'Entertainment', 'Other'];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiClient.get('/expenses');

      if (response.data) {
        setExpenses(response.data.expenses || response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      setError('Failed to load expenses. Please try again.');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expense) => {
    if (window.confirm(`Are you sure you want to delete "${expense.title}"?`)) {
      try {
        await apiClient.delete(`/expenses/${expense.id}`);
        setExpenses(prev => prev.filter(e => e.id !== expense.id));
        showSuccess('Expense deleted successfully');
      } catch (error) {
        console.error('Failed to delete expense:', error);
        showError('Failed to delete expense. Please try again.');
      }
    }
  };

  const handleViewExpense = (expense) => {
    navigate(`/expenses/${expense.id}`);
  };

  const handleEditExpense = (expense) => {
    navigate(`/expenses/edit/${expense.id}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'default',
      'Submitted': 'info',
      'Under Review': 'warning',
      'Approved': 'success',
      'Rejected': 'error',
      'Cancelled': 'default'
    };
    return colors[status] || 'default';
  };

  const formatCurrency = (amount, currency = 'USD') => {
    const currencySymbols = { USD: '$', EUR: 'â‚¬', GBP: 'Â£', INR: 'â‚¹', JPY: 'Â¥' };
    return `${currencySymbols[currency] || '$'}${Number(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Filter expenses based on search and filters
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = !searchTerm || 
      expense.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.expense_reference?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filterStatus || expense.status === filterStatus;
    const matchesCategory = !filterCategory || expense.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate stats for filtered expenses
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const approvedAmount = filteredExpenses
    .filter(e => e.status === 'Approved')
    .reduce((sum, expense) => sum + (expense.amount || 0), 0);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '60vh'
        }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading expenses...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} />
            My Expenses
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Track and manage your submitted expenses
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchExpenses}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/expenses/new')}
          >
            Submit New Expense
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchExpenses}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {filteredExpenses.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Expenses
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                {formatCurrency(totalAmount)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Amount
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                {formatCurrency(approvedAmount)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Approved Amount
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                {filteredExpenses.filter(e => ['Submitted', 'Under Review'].includes(e.status)).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Pending Approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status Filter"
              >
                <MenuItem value="">All Statuses</MenuItem>
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category Filter</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Category Filter"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<GetApp />}
              onClick={() => showSuccess('Export feature will be available soon!')}
            >
              Export
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Expenses Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Reference</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredExpenses.map((expense) => (
              <TableRow key={expense.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {expense.expense_reference || `EXP-${expense.id}`}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {expense.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {expense.description && expense.description.length > 50 
                        ? expense.description.substring(0, 50) + '...' 
                        : expense.description}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Chip 
                    label={expense.category || 'Other'} 
                    variant="outlined" 
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatCurrency(expense.amount, expense.currency)}
                  </Typography>
                </TableCell>

                <TableCell>
                  {formatDate(expense.expense_date || expense.created_at)}
                </TableCell>

                <TableCell>
                  <Chip 
                    label={expense.status || 'Draft'} 
                    color={getStatusColor(expense.status)} 
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewExpense(expense)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>

                    {expense.status === 'Draft' && (
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditExpense(expense)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    )}

                    {expense.status === 'Draft' && (
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteExpense(expense)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredExpenses.length === 0 && !loading && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Receipt sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {expenses.length === 0 ? 'No expenses found' : 'No matching expenses'}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {expenses.length === 0 
                ? 'Submit your first expense to get started' 
                : 'Try adjusting your search filters'}
            </Typography>
            {expenses.length === 0 && (
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => navigate('/expenses/new')}
              >
                Submit Your First Expense
              </Button>
            )}
          </Box>
        )}
      </TableContainer>
    </Container>
  );
};

export default ExpenseList;
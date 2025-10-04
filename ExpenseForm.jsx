import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Add,
  AttachFile,
  Receipt,
  Save,
  Cancel,
  AttachMoney,
  DateRange,
  Category,
  ArrowBack,
  CloudUpload
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import apiClient from '../services/apiClient';

const ExpenseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [expenseData, setExpenseData] = useState({
    title: '',
    description: '',
    amount: '',
    currency: user?.company?.currency_code || 'USD',
    category: '',
    expense_date: new Date().toISOString().split('T')[0],
    receipt: null
  });

  const categories = [
    'Travel',
    'Meals', 
    'Office Supplies',
    'Equipment',
    'Software',
    'Marketing',
    'Training',
    'Entertainment',
    'Other'
  ];

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: 'â‚¬', name: 'Euro' },
    { code: 'GBP', symbol: 'Â£', name: 'British Pound' },
    { code: 'INR', symbol: 'â‚¹', name: 'Indian Rupee' },
    { code: 'JPY', symbol: 'Â¥', name: 'Japanese Yen' }
  ];

  useEffect(() => {
    if (isEditMode) {
      fetchExpense();
    }
  }, [id, isEditMode]);

  const fetchExpense = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/expenses/${id}`);

      if (response.data) {
        const expense = response.data.expense || response.data;
        setExpenseData({
          title: expense.title || '',
          description: expense.description || '',
          amount: expense.amount?.toString() || '',
          currency: expense.currency || 'USD',
          category: expense.category || '',
          expense_date: expense.expense_date ? expense.expense_date.split('T')[0] : new Date().toISOString().split('T')[0],
          receipt: null // File will be handled separately
        });
      }
    } catch (error) {
      console.error('Failed to fetch expense:', error);
      showError('Failed to load expense data. Please try again.');
      navigate('/expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPEG, PNG, and PDF files are allowed');
        return;
      }

      setExpenseData(prev => ({
        ...prev,
        receipt: file
      }));

      if (error) setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!expenseData.title || !expenseData.amount || !expenseData.category) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(expenseData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('title', expenseData.title);
      formData.append('description', expenseData.description);
      formData.append('amount', expenseData.amount);
      formData.append('currency', expenseData.currency);
      formData.append('category', expenseData.category);
      formData.append('expense_date', expenseData.expense_date);

      if (expenseData.receipt) {
        formData.append('receipt', expenseData.receipt);
      }

      let response;
      if (isEditMode) {
        response = await apiClient.put(`/expenses/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        showSuccess('Expense updated successfully!');
      } else {
        response = await apiClient.post('/expenses', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        showSuccess('Expense submitted successfully!');
      }

      navigate('/expenses');
    } catch (error) {
      console.error('Failed to submit expense:', error);

      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError(`Failed to ${isEditMode ? 'update' : 'submit'} expense. Please try again.`);
      }

      showError(`Failed to ${isEditMode ? 'update' : 'submit'} expense`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/expenses');
  };

  const selectedCurrency = currencies.find(c => c.code === expenseData.currency) || currencies[0];

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '60vh'
        }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading expense data...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/expenses')}
        >
          Back to Expenses
        </Button>

        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {isEditMode ? <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} /> : <Add sx={{ mr: 1, verticalAlign: 'middle' }} />}
            {isEditMode ? 'Edit Expense' : 'Submit New Expense'}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {isEditMode ? 'Update your expense details' : 'Fill in the details below to submit your expense for approval'}
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Expense Details
                  </Typography>

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Expense Title *"
                        name="title"
                        value={expenseData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Business lunch with client"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={expenseData.description}
                        onChange={handleInputChange}
                        multiline
                        rows={3}
                        placeholder="Detailed description of the expense..."
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Financial Information */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Financial Details
                  </Typography>

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Amount *"
                        name="amount"
                        type="number"
                        value={expenseData.amount}
                        onChange={handleInputChange}
                        required
                        inputProps={{ step: '0.01', min: '0' }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoney />
                              {selectedCurrency.symbol}
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Currency</InputLabel>
                        <Select
                          name="currency"
                          value={expenseData.currency}
                          onChange={handleInputChange}
                          label="Currency"
                        >
                          {currencies.map((currency) => (
                            <MenuItem key={currency.code} value={currency.code}>
                              {currency.symbol} {currency.code} - {currency.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Category *</InputLabel>
                        <Select
                          name="category"
                          value={expenseData.category}
                          onChange={handleInputChange}
                          label="Category *"
                        >
                          {categories.map((category) => (
                            <MenuItem key={category} value={category}>
                              {category}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Expense Date *"
                        name="expense_date"
                        type="date"
                        value={expenseData.expense_date}
                        onChange={handleInputChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DateRange />
                            </InputAdornment>
                          ),
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Receipt Upload */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Receipt Attachment
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUpload />}
                      sx={{ mr: 2 }}
                    >
                      {expenseData.receipt ? 'Change Receipt' : 'Upload Receipt'}
                      <input
                        type="file"
                        hidden
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                      />
                    </Button>

                    {expenseData.receipt && (
                      <Chip
                        icon={<AttachFile />}
                        label={expenseData.receipt.name}
                        onDelete={() => setExpenseData(prev => ({ ...prev, receipt: null }))}
                        color="primary"
                        variant="outlined"
                      />
                    )}

                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Supported formats: JPEG, PNG, PDF (Max 10MB)
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Summary */}
            <Grid item xs={12}>
              <Card sx={{ backgroundColor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Expense Summary
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Title:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {expenseData.title || 'Not specified'}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Amount:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedCurrency.symbol}{expenseData.amount || '0.00'} {expenseData.currency}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Category:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {expenseData.category || 'Not selected'}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Date:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {expenseData.expense_date}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}

          <Divider sx={{ my: 4 }} />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isSubmitting}
              startIcon={<Cancel />}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={<Save />}
              sx={{ minWidth: 140 }}
            >
              {isSubmitting 
                ? (isEditMode ? 'Updating...' : 'Submitting...') 
                : (isEditMode ? 'Update Expense' : 'Submit Expense')}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ExpenseForm;
import { apiHelpers, handleApiResponse, createQueryParams } from './api';

class ExpenseService {
  async createExpense(expenseData) {
    try {
      const response = await apiHelpers.post('/expenses', expenseData);
      return handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async getExpenses(filters = {}) {
    try {
      const response = await apiHelpers.get('/expenses', filters);
      return handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async getMyExpenses(filters = {}) {
    try {
      const response = await apiHelpers.get('/expenses/my-expenses', filters);
      return handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async getExpenseById(id) {
    try {
      const response = await apiHelpers.get(`/expenses/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async updateExpense(id, updateData) {
    try {
      const response = await apiHelpers.put(`/expenses/${id}`, updateData);
      return handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async deleteExpense(id) {
    try {
      const response = await apiHelpers.delete(`/expenses/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async getPendingApprovals(filters = {}) {
    try {
      const response = await apiHelpers.get('/expenses/pending-approvals', filters);
      return handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async approveExpense(expenseId, comments = '') {
    try {
      const response = await apiHelpers.put(`/expenses/${expenseId}/approve`, { comments });
      return handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async rejectExpense(expenseId, comments = '') {
    try {
      const response = await apiHelpers.put(`/expenses/${expenseId}/reject`, { comments });
      return handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async bulkApprove(expenseIds, comments = '') {
    try {
      const response = await apiHelpers.post('/expenses/bulk-approve', {
        expense_ids: expenseIds,
        comments
      });
      return handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async bulkReject(expenseIds, comments = '') {
    try {
      const response = await apiHelpers.post('/expenses/bulk-reject', {
        expense_ids: expenseIds,
        comments
      });
      return handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async getAnalyticsSummary(dateRange = {}) {
    try {
      const response = await apiHelpers.get('/expenses/analytics/summary', dateRange);
      return handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async getExpenseTrends(filters = {}) {
    try {
      const response = await apiHelpers.get('/expenses/analytics/trends', filters);
      return handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async uploadReceipt(file, onUploadProgress = null) {
    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const response = await apiHelpers.upload('/upload/receipt', formData, onUploadProgress);
      return handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  }

  // Utility methods
  formatCurrency(amount, currencyCode = 'USD', locale = 'en-US') {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      return `${currencyCode} ${amount.toFixed(2)}`;
    }
  }

  getStatusColor(status) {
    const statusColors = {
      'Draft': 'default',
      'Submitted': 'info',
      'Under Review': 'warning',
      'Partially Approved': 'warning',
      'Approved': 'success',
      'Rejected': 'error',
      'Cancelled': 'default'
    };
    return statusColors[status] || 'default';
  }

  getStatusIcon(status) {
    const statusIcons = {
      'Draft': 'ðŸ“',
      'Submitted': 'ðŸ“¤',
      'Under Review': 'â³',
      'Partially Approved': 'âš ï¸',
      'Approved': 'âœ…',
      'Rejected': 'âŒ',
      'Cancelled': 'ðŸš«'
    };
    return statusIcons[status] || 'ðŸ“„';
  }

  getCategoryIcon(category) {
    const categoryIcons = {
      'Travel': 'âœˆï¸',
      'Meals': 'ðŸ½ï¸',
      'Office Supplies': 'ðŸ“Ž',
      'Equipment': 'ðŸ’»',
      'Software': 'ðŸ’¿',
      'Marketing': 'ðŸ“¢',
      'Training': 'ðŸ“š',
      'Entertainment': 'ðŸŽ­',
      'Other': 'ðŸ“‹'
    };
    return categoryIcons[category] || 'ðŸ“„';
  }

  validateExpenseData(data) {
    const errors = {};

    if (!data.title || data.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    }

    if (!data.amount || parseFloat(data.amount) <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }

    if (!data.category) {
      errors.category = 'Category is required';
    }

    if (!data.expense_date) {
      errors.expense_date = 'Expense date is required';
    } else if (new Date(data.expense_date) > new Date()) {
      errors.expense_date = 'Expense date cannot be in the future';
    }

    if (!data.currency) {
      errors.currency = 'Currency is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export const expenseService = new ExpenseService();
export default expenseService;
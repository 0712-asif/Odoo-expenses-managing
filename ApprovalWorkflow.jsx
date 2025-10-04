import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Alert,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Schedule,
  AttachMoney,
  Person,
  Receipt,
  Comment,
  Visibility,
  ThumbUp,
  ThumbDown,
  Timer
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const ApprovalWorkflow = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [approvedExpenses, setApprovedExpenses] = useState([]);
  const [rejectedExpenses, setRejectedExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchApprovalData();
  }, []);

  const fetchApprovalData = async () => {
    try {
      setLoading(true);

      // Simulate API call with demo data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const demoPendingExpenses = [
        {
          id: 2,
          title: 'Office Supplies - Stationery',
          description: 'Purchased notebooks, pens, and sticky notes for the team',
          amount: 45.25,
          currency: 'USD',
          category: 'Office Supplies',
          expense_date: '2025-01-18',
          status: 'Under Review',
          submitted_by: 'Jane Smith',
          submitted_date: '2025-01-18T14:15:00Z',
          expense_reference: 'EXP202501002',
          receipt_filename: 'receipt_supplies.jpg',
          submitter: {
            name: 'Jane Smith',
            email: 'jane@democompany.com',
            role: 'Employee',
            department: 'Marketing'
          },
          approval_history: [
            {
              step: 1,
              approver: 'Manager Smith',
              status: 'Pending',
              date: null,
              comments: null
            }
          ]
        },
        {
          id: 3,
          title: 'Software License - Adobe Creative Suite',
          description: 'Annual subscription for design team productivity',
          amount: 599.99,
          currency: 'USD',
          category: 'Software',
          expense_date: '2025-01-20',
          status: 'Under Review',
          submitted_by: 'Mike Johnson',
          submitted_date: '2025-01-20T09:45:00Z',
          expense_reference: 'EXP202501003',
          receipt_filename: null,
          submitter: {
            name: 'Mike Johnson',
            email: 'mike@democompany.com',
            role: 'Employee',
            department: 'Design'
          },
          approval_history: [
            {
              step: 1,
              approver: 'Manager Smith',
              status: 'Pending',
              date: null,
              comments: null
            }
          ]
        },
        {
          id: 4,
          title: 'Travel - Flight to Conference',
          description: 'Round trip flight to attend industry conference in San Francisco',
          amount: 750.00,
          currency: 'USD',
          category: 'Travel',
          expense_date: '2025-01-22',
          status: 'Under Review',
          submitted_by: 'Sarah Williams',
          submitted_date: '2025-01-22T16:20:00Z',
          expense_reference: 'EXP202501004',
          receipt_filename: 'flight_receipt.pdf',
          submitter: {
            name: 'Sarah Williams',
            email: 'sarah@democompany.com',
            role: 'Employee',
            department: 'Sales'
          },
          approval_history: [
            {
              step: 1,
              approver: 'Manager Smith',
              status: 'Pending',
              date: null,
              comments: null
            }
          ]
        }
      ];

      const demoApprovedExpenses = [
        {
          id: 1,
          title: 'Business Lunch with Client',
          description: 'Lunch meeting with potential client to discuss new project requirements',
          amount: 85.50,
          currency: 'USD',
          category: 'Meals',
          expense_date: '2025-01-15',
          status: 'Approved',
          submitted_by: 'John Doe',
          submitted_date: '2025-01-15T10:30:00Z',
          expense_reference: 'EXP202501001',
          receipt_filename: 'receipt_lunch.pdf',
          submitter: {
            name: 'John Doe',
            email: 'john@democompany.com',
            role: 'Employee',
            department: 'Sales'
          },
          approval_history: [
            {
              step: 1,
              approver: 'Manager Smith',
              status: 'Approved',
              date: '2025-01-15T15:30:00Z',
              comments: 'Approved for business development purposes.'
            }
          ]
        }
      ];

      const demoRejectedExpenses = [
        {
          id: 5,
          title: 'Training Course - React Advanced',
          description: 'Online course for advanced React development skills',
          amount: 299.00,
          currency: 'USD',
          category: 'Training',
          expense_date: '2025-01-25',
          status: 'Rejected',
          submitted_by: 'Tom Davis',
          submitted_date: '2025-01-25T11:10:00Z',
          expense_reference: 'EXP202501005',
          receipt_filename: 'course_receipt.png',
          submitter: {
            name: 'Tom Davis',
            email: 'tom@democompany.com',
            role: 'Employee',
            department: 'Development'
          },
          approval_history: [
            {
              step: 1,
              approver: 'Manager Smith',
              status: 'Rejected',
              date: '2025-01-25T16:45:00Z',
              comments: 'Training budget for this quarter has been exhausted. Please resubmit in Q2.'
            }
          ]
        }
      ];

      setPendingExpenses(demoPendingExpenses);
      setApprovedExpenses(demoApprovedExpenses);
      setRejectedExpenses(demoRejectedExpenses);
    } catch (error) {
      showError('Failed to fetch approval data');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (expense, action) => {
    setSelectedExpense(expense);
    setActionType(action);
    setActionDialogOpen(true);
    setComments('');
  };

  const handleSubmitAction = async () => {
    if (!selectedExpense || !actionType) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedExpense = {
        ...selectedExpense,
        status: actionType === 'approve' ? 'Approved' : 'Rejected',
        approval_history: [
          {
            step: 1,
            approver: user?.name,
            status: actionType === 'approve' ? 'Approved' : 'Rejected',
            date: new Date().toISOString(),
            comments: comments || (actionType === 'approve' ? 'Approved' : 'Rejected')
          }
        ]
      };

      // Update state
      setPendingExpenses(prev => prev.filter(e => e.id !== selectedExpense.id));

      if (actionType === 'approve') {
        setApprovedExpenses(prev => [updatedExpense, ...prev]);
        showSuccess(`Expense ${selectedExpense.expense_reference} approved successfully!`);
      } else {
        setRejectedExpenses(prev => [updatedExpense, ...prev]);
        showSuccess(`Expense ${selectedExpense.expense_reference} rejected.`);
      }

      setActionDialogOpen(false);
      setSelectedExpense(null);
    } catch (error) {
      showError('Failed to process expense');
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    const currencySymbols = { USD: '$', EUR: 'â‚¬', GBP: 'Â£', INR: 'â‚¹', JPY: 'Â¥' };
    return `${currencySymbols[currency] || '$'}${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    const colors = {
      'Under Review': 'warning',
      'Approved': 'success',
      'Rejected': 'error',
      'Pending': 'info'
    };
    return colors[status] || 'default';
  };

  const ExpenseTable = ({ expenses, showActions = false }) => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Reference</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Submitter</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
            {showActions && <TableCell>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id} hover>
              <TableCell>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {expense.expense_reference}
                </Typography>
              </TableCell>

              <TableCell>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {expense.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {expense.category}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                    {expense.submitter.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {expense.submitter.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {expense.submitter.department}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>

              <TableCell>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatCurrency(expense.amount, expense.currency)}
                </Typography>
              </TableCell>

              <TableCell>
                {formatDate(expense.expense_date)}
              </TableCell>

              <TableCell>
                <Chip 
                  label={expense.status} 
                  color={getStatusColor(expense.status)} 
                  size="small"
                />
              </TableCell>

              {showActions && (
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckCircle />}
                      onClick={() => handleAction(expense, 'approve')}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<Cancel />}
                      onClick={() => handleAction(expense, 'reject')}
                    >
                      Reject
                    </Button>
                  </Box>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {expenses.length === 0 && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No expenses found
          </Typography>
        </Box>
      )}
    </TableContainer>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading approval data...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
          Expense Approvals
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Review and manage expense approvals for your team
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Badge badgeContent={pendingExpenses.length} color="warning">
                <Timer sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              </Badge>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                {pendingExpenses.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Pending Approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                {approvedExpenses.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Approved Today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Cancel sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                {rejectedExpenses.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Rejected Today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                ${(approvedExpenses.reduce((sum, e) => sum + e.amount, 0)).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Approved Amount
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different expense categories */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab 
            label={
              <Badge badgeContent={pendingExpenses.length} color="warning">
                <span>Pending Approval</span>
              </Badge>
            }
          />
          <Tab 
            label={
              <Badge badgeContent={approvedExpenses.length} color="success">
                <span>Approved</span>
              </Badge>
            }
          />
          <Tab 
            label={
              <Badge badgeContent={rejectedExpenses.length} color="error">
                <span>Rejected</span>
              </Badge>
            }
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Expenses Requiring Your Approval
          </Typography>
          {pendingExpenses.length > 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              You have {pendingExpenses.length} expense(s) waiting for your approval.
            </Alert>
          ) : (
            <Alert severity="success" sx={{ mb: 2 }}>
              All caught up! No expenses require your approval at the moment.
            </Alert>
          )}
          <ExpenseTable expenses={pendingExpenses} showActions={true} />
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Recently Approved Expenses
          </Typography>
          <ExpenseTable expenses={approvedExpenses} />
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Recently Rejected Expenses
          </Typography>
          <ExpenseTable expenses={rejectedExpenses} />
        </Box>
      )}

      {/* Action Dialog */}
      <Dialog 
        open={actionDialogOpen} 
        onClose={() => setActionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedExpense && (
          <>
            <DialogTitle>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {actionType === 'approve' ? 'Approve' : 'Reject'} Expense
              </Typography>
            </DialogTitle>

            <DialogContent>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Reference</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                        {selectedExpense.expense_reference}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Amount</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {formatCurrency(selectedExpense.amount, selectedExpense.currency)}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Title</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedExpense.title}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                      <Typography variant="body2">
                        {selectedExpense.description}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Submitted By</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                          {selectedExpense.submitter.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">
                          {selectedExpense.submitter.name} ({selectedExpense.submitter.department})
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Category</Typography>
                      <Chip 
                        label={selectedExpense.category} 
                        variant="outlined" 
                        size="small" 
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <TextField
                fullWidth
                label={`${actionType === 'approve' ? 'Approval' : 'Rejection'} Comments`}
                multiline
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={`Add your ${actionType === 'approve' ? 'approval' : 'rejection'} comments here...`}
                InputProps={{
                  startAdornment: <Comment sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setActionDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="contained"
                color={actionType === 'approve' ? 'success' : 'error'}
                startIcon={actionType === 'approve' ? <ThumbUp /> : <ThumbDown />}
                onClick={handleSubmitAction}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'} Expense
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default ApprovalWorkflow;
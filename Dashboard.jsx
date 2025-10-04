import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  Receipt,
  CheckCircle,
  HourglassEmpty,
  Add,
  Dashboard as DashboardIcon,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

const Dashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalExpenses: 0,
    approvedAmount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    recentExpenses: []
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch dashboard data from backend
      const response = await apiClient.get('/dashboard/stats');

      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');

      // Set empty state for better UX
      setDashboardData({
        totalExpenses: 0,
        approvedAmount: 0,
        pendingCount: 0,
        rejectedCount: 0,
        recentExpenses: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '60vh'
        }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Welcome back, {user?.name}!
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {user?.role} at {user?.company?.name || 'Your Company'}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
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
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Receipt color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="textSecondary">
                  Total Expenses
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {dashboardData.totalExpenses}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" color="textSecondary">
                  Approved Amount
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                ${dashboardData.approvedAmount?.toLocaleString() || '0.00'}
              </Typography>
              <Typography variant="body2" color="success.main">
                Total approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <HourglassEmpty color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" color="textSecondary">
                  Pending
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {dashboardData.pendingCount || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Awaiting approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" color="textSecondary">
                  Approved
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {(dashboardData.totalExpenses || 0) - (dashboardData.pendingCount || 0) - (dashboardData.rejectedCount || 0)}
              </Typography>
              <Typography variant="body2" color="success.main">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions and Recent Expenses */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Recent Expenses
            </Typography>

            {dashboardData.recentExpenses && dashboardData.recentExpenses.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                {dashboardData.recentExpenses.map((expense) => (
                  <Box
                    key={expense.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': {
                        borderBottom: 'none'
                      }
                    }}
                  >
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {expense.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {expense.submittedBy} â€¢ {new Date(expense.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        ${expense.amount?.toFixed(2)}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1,
                          backgroundColor: expense.status === 'Approved' ? 'success.light' : 
                                         expense.status === 'Pending' ? 'warning.light' : 'error.light',
                          color: 'white'
                        }}
                      >
                        {expense.status}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Receipt sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No recent expenses
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Start by submitting your first expense
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Quick Actions
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/expenses/new')}
                fullWidth
              >
                Submit New Expense
              </Button>

              <Button
                variant="outlined"
                onClick={() => navigate('/expenses')}
                fullWidth
              >
                View All Expenses
              </Button>

              {(user?.role === 'Admin' || user?.role === 'Manager') && (
                <Button
                  variant="outlined"
                  onClick={() => navigate('/approvals')}
                  fullWidth
                >
                  Pending Approvals ({dashboardData.pendingCount || 0})
                </Button>
              )}

              {user?.role === 'Admin' && (
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin')}
                  fullWidth
                >
                  Admin Panel
                </Button>
              )}
            </Box>

            {/* Welcome message for new users */}
            {dashboardData.totalExpenses === 0 && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: 'info.50', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'info.main' }}>
                  Welcome to Expense Management!
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                  Get started by submitting your first expense using the button above.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
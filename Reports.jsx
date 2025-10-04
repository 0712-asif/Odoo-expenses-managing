import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  BarChart,
  Assessment,
  GetApp,
  DateRange,
  FilterList,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Receipt,
  Person,
  Category
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Reports = () => {
  const { user } = useAuth();
  const { showSuccess } = useNotification();

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('this_month');
  const [reportType, setReportType] = useState('overview');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const [reportData, setReportData] = useState({
    overview: {
      totalExpenses: 48,
      totalAmount: 12450.75,
      approvedAmount: 10850.50,
      pendingAmount: 1600.25,
      averageExpense: 259.39,
      topCategory: 'Travel'
    },
    monthlyTrend: [
      { month: 'Oct', amount: 8420.30, count: 32 },
      { month: 'Nov', amount: 9650.75, count: 38 },
      { month: 'Dec', amount: 11230.50, count: 42 },
      { month: 'Jan', amount: 12450.75, count: 48 }
    ],
    categoryBreakdown: [
      { category: 'Travel', amount: 4820.75, percentage: 38.7, count: 15 },
      { category: 'Meals', amount: 2340.50, percentage: 18.8, count: 12 },
      { category: 'Software', amount: 1899.99, percentage: 15.3, count: 6 },
      { category: 'Office Supplies', amount: 1450.25, percentage: 11.6, count: 8 },
      { category: 'Training', amount: 1299.00, percentage: 10.4, count: 4 },
      { category: 'Other', amount: 640.26, percentage: 5.2, count: 3 }
    ],
    departmentBreakdown: [
      { department: 'Sales', amount: 4520.30, percentage: 36.3, count: 18 },
      { department: 'Marketing', amount: 3240.75, percentage: 26.0, count: 14 },
      { department: 'Operations', amount: 2890.50, percentage: 23.2, count: 10 },
      { department: 'Development', amount: 1799.20, percentage: 14.5, count: 6 }
    ],
    topExpenses: [
      {
        id: 1,
        title: 'Conference Registration - Tech Summit 2025',
        amount: 1299.00,
        submitter: 'Sarah Williams',
        department: 'Sales',
        category: 'Training',
        date: '2025-01-20',
        status: 'Approved'
      },
      {
        id: 2,
        title: 'Flight to Client Meeting - Los Angeles',
        amount: 850.50,
        submitter: 'Mike Johnson',
        department: 'Sales',
        category: 'Travel',
        date: '2025-01-18',
        status: 'Approved'
      },
      {
        id: 3,
        title: 'Software License - Adobe Creative Suite',
        amount: 599.99,
        submitter: 'Design Team',
        department: 'Marketing',
        category: 'Software',
        date: '2025-01-15',
        status: 'Under Review'
      },
      {
        id: 4,
        title: 'Team Building Dinner',
        amount: 485.75,
        submitter: 'Manager Smith',
        department: 'Operations',
        category: 'Meals',
        date: '2025-01-12',
        status: 'Approved'
      },
      {
        id: 5,
        title: 'Office Equipment - Standing Desks',
        amount: 420.00,
        submitter: 'HR Department',
        department: 'Operations',
        category: 'Office Supplies',
        date: '2025-01-10',
        status: 'Approved'
      }
    ]
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange, reportType, selectedDepartment]);

  const fetchReportData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Approved': 'success',
      'Under Review': 'warning',
      'Rejected': 'error',
      'Pending': 'info'
    };
    return colors[status] || 'default';
  };

  const handleExport = (type) => {
    showSuccess(`${type} export will be ready shortly!`);
  };

  const departments = ['All Departments', 'Sales', 'Marketing', 'Operations', 'Development', 'Administration'];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress />
        </Box>
        <Typography>Loading reports...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
          Reports & Analytics
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Comprehensive expense analytics and insights
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                label="Date Range"
                startAdornment={<DateRange sx={{ mr: 1, color: 'action.active' }} />}
              >
                <MenuItem value="this_week">This Week</MenuItem>
                <MenuItem value="this_month">This Month</MenuItem>
                <MenuItem value="last_month">Last Month</MenuItem>
                <MenuItem value="this_quarter">This Quarter</MenuItem>
                <MenuItem value="this_year">This Year</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                label="Report Type"
                startAdornment={<BarChart sx={{ mr: 1, color: 'action.active' }} />}
              >
                <MenuItem value="overview">Overview</MenuItem>
                <MenuItem value="detailed">Detailed Analysis</MenuItem>
                <MenuItem value="comparison">Period Comparison</MenuItem>
                <MenuItem value="trends">Trend Analysis</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                label="Department"
                startAdornment={<FilterList sx={{ mr: 1, color: 'action.active' }} />}
              >
                <MenuItem value="all">All Departments</MenuItem>
                {departments.slice(1).map((dept) => (
                  <MenuItem key={dept} value={dept.toLowerCase()}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              startIcon={<GetApp />}
              onClick={() => handleExport('PDF')}
              fullWidth
            >
              Export Report
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Receipt sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {reportData.overview.totalExpenses}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Expenses
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                <Typography variant="caption" color="success.main">
                  +12% vs last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                {formatCurrency(reportData.overview.totalAmount)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Amount
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                <Typography variant="caption" color="success.main">
                  +8% vs last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'info.main' }}>
                {formatCurrency(reportData.overview.averageExpense)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Average Expense
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <TrendingDown sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
                <Typography variant="caption" color="error.main">
                  -3% vs last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Category sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                {reportData.overview.topCategory}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Top Category
              </Typography>
              <Typography variant="caption" color="textSecondary">
                38.7% of total expenses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Monthly Trend */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                ðŸ“ˆ Monthly Expense Trend
              </Typography>

              <Box sx={{ mt: 3 }}>
                {reportData.monthlyTrend.map((month, index) => (
                  <Box key={month.month} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {month.month} 2025
                      </Typography>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {formatCurrency(month.amount)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {month.count} expenses
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(month.amount / Math.max(...reportData.monthlyTrend.map(m => m.amount))) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                      color={index === reportData.monthlyTrend.length - 1 ? 'primary' : 'secondary'}
                    />
                  </Box>
                ))}
              </Box>

              <Alert severity="info" sx={{ mt: 3 }}>
                Current month shows a {((reportData.monthlyTrend[3].amount - reportData.monthlyTrend[2].amount) / reportData.monthlyTrend[2].amount * 100).toFixed(1)}% increase compared to last month.
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Breakdown */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                ðŸ·ï¸ Category Breakdown
              </Typography>

              <Box sx={{ mt: 3 }}>
                {reportData.categoryBreakdown.map((category) => (
                  <Box key={category.category} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {category.category}
                      </Typography>
                      <Typography variant="body2" color="primary.main">
                        {category.percentage}%
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" color="textSecondary">
                        {category.count} expenses
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {formatCurrency(category.amount)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={category.percentage}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                ðŸ¢ Department Breakdown
              </Typography>

              <Box sx={{ mt: 3 }}>
                {reportData.departmentBreakdown.map((dept) => (
                  <Box key={dept.department} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {dept.department}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(dept.amount)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" color="textSecondary">
                        {dept.count} expenses
                      </Typography>
                      <Typography variant="caption" color="primary.main">
                        {dept.percentage}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={dept.percentage}
                      sx={{ height: 6, borderRadius: 3 }}
                      color="secondary"
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Expenses */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  ðŸ’° Highest Expenses
                </Typography>
                <Button
                  size="small"
                  onClick={() => handleExport('Expenses')}
                  startIcon={<GetApp />}
                >
                  Export
                </Button>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Expense</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.topExpenses.map((expense) => (
                      <TableRow key={expense.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                              {expense.title.length > 30 
                                ? expense.title.substring(0, 30) + '...' 
                                : expense.title}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {expense.submitter} â€¢ {expense.category}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatCurrency(expense.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={expense.status}
                            size="small"
                            color={getStatusColor(expense.status)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Export Options */}
      <Paper sx={{ p: 3, mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          ðŸ“Š Export Options
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Download detailed reports in various formats
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            onClick={() => handleExport('PDF')}
            startIcon={<GetApp />}
          >
            Export PDF
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => handleExport('Excel')}
            startIcon={<GetApp />}
          >
            Export Excel
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => handleExport('CSV')}
            startIcon={<GetApp />}
          >
            Export CSV
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Reports;
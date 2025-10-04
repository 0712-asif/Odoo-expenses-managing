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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import {
  AdminPanelSettings,
  People,
  AttachMoney,
  TrendingUp,
  Add,
  Edit,
  Delete,
  Visibility,
  Settings,
  Group,
  Receipt,
  Business,
  Security
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const AdminPanel = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();

  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  // Dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'Employee',
    department: '',
    is_active: true
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Demo stats
      setStats({
        totalUsers: 15,
        activeUsers: 12,
        totalExpenses: 48,
        totalAmount: 12450.75,
        pendingApprovals: 7,
        approvedToday: 5,
        rejectedToday: 1
      });

      // Demo users
      setUsers([
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@democompany.com',
          role: 'Admin',
          department: 'Administration',
          is_active: true,
          last_login: '2025-01-25T10:30:00Z',
          created_at: '2024-12-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'Manager Smith',
          email: 'manager@democompany.com',
          role: 'Manager',
          department: 'Operations',
          is_active: true,
          last_login: '2025-01-24T15:45:00Z',
          created_at: '2024-12-05T00:00:00Z'
        },
        {
          id: 3,
          name: 'John Doe',
          email: 'employee@democompany.com',
          role: 'Employee',
          department: 'Sales',
          is_active: true,
          last_login: '2025-01-25T09:20:00Z',
          created_at: '2024-12-10T00:00:00Z'
        },
        {
          id: 4,
          name: 'Jane Smith',
          email: 'jane@democompany.com',
          role: 'Employee',
          department: 'Marketing',
          is_active: true,
          last_login: '2025-01-24T16:30:00Z',
          created_at: '2024-12-15T00:00:00Z'
        },
        {
          id: 5,
          name: 'Mike Johnson',
          email: 'mike@democompany.com',
          role: 'Employee',
          department: 'Design',
          is_active: false,
          last_login: '2025-01-20T12:15:00Z',
          created_at: '2025-01-01T00:00:00Z'
        }
      ]);

      // Demo companies
      setCompanies([
        {
          id: 1,
          name: 'Demo Company Inc.',
          country: 'United States',
          currency_code: 'USD',
          total_users: 15,
          total_expenses: 48,
          is_active: true
        }
      ]);

    } catch (error) {
      showError('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      is_active: user.is_active
    });
    setUserDialogOpen(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setUserFormData({
      name: '',
      email: '',
      role: 'Employee',
      department: '',
      is_active: true
    });
    setUserDialogOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (selectedUser) {
        // Update user
        setUsers(prev => prev.map(u => 
          u.id === selectedUser.id 
            ? { ...u, ...userFormData }
            : u
        ));
        showSuccess('User updated successfully!');
      } else {
        // Add new user
        const newUser = {
          id: Date.now(),
          ...userFormData,
          last_login: null,
          created_at: new Date().toISOString()
        };
        setUsers(prev => [newUser, ...prev]);
        showSuccess('User created successfully!');
      }

      setUserDialogOpen(false);
    } catch (error) {
      showError('Failed to save user');
    }
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`Are you sure you want to delete "${user.name}"?`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      showSuccess('User deleted successfully');
    }
  };

  const handleToggleUserStatus = (user) => {
    setUsers(prev => prev.map(u => 
      u.id === user.id 
        ? { ...u, is_active: !u.is_active }
        : u
    ));
    showSuccess(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString() : 'Never';
  };

  const getRoleColor = (role) => {
    const colors = {
      'Admin': 'error',
      'Manager': 'warning',
      'Employee': 'primary'
    };
    return colors[role] || 'default';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading admin panel...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          <AdminPanelSettings sx={{ mr: 1, verticalAlign: 'middle' }} />
          Admin Panel
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage users, expenses, and system settings
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {stats.totalUsers}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Users
              </Typography>
              <Typography variant="caption" color="success.main">
                {stats.activeUsers} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Receipt sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'info.main' }}>
                {stats.totalExpenses}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Expenses
              </Typography>
              <Typography variant="caption" color="warning.main">
                {stats.pendingApprovals} pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                ${stats.totalAmount?.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Amount
              </Typography>
              <Typography variant="caption" color="success.main">
                ${stats.approvedToday * 100} today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                {stats.approvedToday}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Approved Today
              </Typography>
              <Typography variant="caption" color="error.main">
                {stats.rejectedToday} rejected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Admin Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab 
            icon={<People />} 
            label="User Management"
          />
          <Tab 
            icon={<Business />} 
            label="Company Settings"
          />
          <Tab 
            icon={<Settings />} 
            label="System Settings"
          />
          <Tab 
            icon={<Security />} 
            label="Security & Roles"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Box>
          {/* User Management */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              User Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddUser}
            >
              Add New User
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {user.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            ID: {user.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {user.email}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip 
                        label={user.role} 
                        color={getRoleColor(user.role)} 
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      {user.department}
                    </TableCell>

                    <TableCell>
                      <Chip 
                        label={user.is_active ? 'Active' : 'Inactive'} 
                        color={user.is_active ? 'success' : 'default'} 
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {formatDateTime(user.last_login)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color={user.is_active ? 'warning' : 'success'}
                          onClick={() => handleToggleUserStatus(user)}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        {user.role !== 'Admin' && (
                          <Button
                            size="small"
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => handleDeleteUser(user)}
                          >
                            Delete
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          {/* Company Settings */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Company Settings
          </Typography>

          <Grid container spacing={3}>
            {companies.map((company) => (
              <Grid item xs={12} key={company.id}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">Company Name</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {company.name}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">Country</Typography>
                        <Typography variant="body1">
                          {company.country}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">Currency</Typography>
                        <Typography variant="body1">
                          {company.currency_code}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">Total Users</Typography>
                        <Typography variant="body1">
                          {company.total_users}
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => showSuccess('Company settings edit coming soon!')}
                        >
                          Edit Company Settings
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          {/* System Settings */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            System Settings
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Expense Policy
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Maximum Expense Amount"
                        defaultValue="10000"
                        InputProps={{ startAdornment: '$' }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Receipt Required Over"
                        defaultValue="25"
                        InputProps={{ startAdornment: '$' }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Auto-approve manager expenses under $100"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Approval Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Require manager approval"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Auto-escalation after (days)"
                        type="number"
                        defaultValue="7"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Send reminder notifications"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                Changes to system settings will affect all users and expenses going forward.
              </Alert>
            </Grid>
          </Grid>
        </Box>
      )}

      {tabValue === 3 && (
        <Box>
          {/* Security & Roles */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Security & Roles
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Role Permissions
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>Admin</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Full system access, user management, system settings
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>Manager</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Approve expenses, view team reports, manage direct reports
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>Employee</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Submit expenses, view own reports, update profile
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Security Settings
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Require strong passwords"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Enable two-factor authentication"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Session timeout (minutes)"
                        type="number"
                        defaultValue="60"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* User Dialog */}
      <Dialog 
        open={userDialogOpen} 
        onClose={() => setUserDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={userFormData.name}
                onChange={(e) => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, role: e.target.value }))}
                  label="Role"
                >
                  <MenuItem value="Employee">Employee</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={userFormData.department}
                onChange={(e) => setUserFormData(prev => ({ ...prev, department: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={userFormData.is_active}
                    onChange={(e) => setUserFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                }
                label="Active User"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveUser}>
            {selectedUser ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;
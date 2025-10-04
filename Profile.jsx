import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Avatar,
  Divider,
  Alert,
  Tab,
  Tabs,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  Camera,
  Email,
  Phone,
  Business,
  LocationOn,
  CalendarToday,
  Security,
  Notifications,
  History,
  Receipt,
  TrendingUp,
  AttachMoney
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1-555-0103',
    department: user?.role === 'Admin' ? 'Administration' : user?.role === 'Manager' ? 'Operations' : 'Sales',
    designation: user?.role === 'Admin' ? 'System Administrator' : user?.role === 'Manager' ? 'Operations Manager' : 'Sales Executive',
    address: '123 Main St, Anytown, USA'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    expenseUpdates: true,
    approvalRequests: true,
    systemUpdates: false,
    marketingEmails: false
  });

  const [activityHistory] = useState([
    {
      id: 1,
      type: 'expense_submitted',
      description: 'Submitted expense: Business Lunch with Client',
      amount: 85.50,
      date: '2025-01-15T10:30:00Z'
    },
    {
      id: 2,
      type: 'expense_approved',
      description: 'Expense approved: Office Supplies',
      amount: 45.25,
      date: '2025-01-14T16:20:00Z'
    },
    {
      id: 3,
      type: 'profile_updated',
      description: 'Updated profile information',
      date: '2025-01-12T09:15:00Z'
    },
    {
      id: 4,
      type: 'expense_submitted',
      description: 'Submitted expense: Software License',
      amount: 299.99,
      date: '2025-01-10T14:45:00Z'
    }
  ]);

  const handleSaveProfile = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update user context
      updateUser({
        ...user,
        name: profileData.name,
        email: profileData.email
      });

      setEditMode(false);
      showSuccess('Profile updated successfully!');
    } catch (error) {
      showError('Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      showSuccess('Password changed successfully!');
    } catch (error) {
      showError('Failed to change password');
    }
  };

  const handleNotificationChange = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'expense_submitted':
        return <Receipt color="primary" />;
      case 'expense_approved':
        return <TrendingUp color="success" />;
      case 'profile_updated':
        return <Person color="info" />;
      default:
        return <History color="action" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'expense_submitted':
        return 'primary';
      case 'expense_approved':
        return 'success';
      case 'profile_updated':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
          My Profile
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage your account settings and preferences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Overview Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    fontSize: '3rem',
                    bgcolor: 'primary.main'
                  }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    minWidth: 'auto',
                    borderRadius: '50%',
                    p: 1
                  }}
                  onClick={() => showSuccess('Photo upload coming soon!')}
                >
                  <Camera fontSize="small" />
                </Button>
              </Box>

              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                {user?.name}
              </Typography>

              <Chip 
                label={user?.role} 
                color={user?.role === 'Admin' ? 'error' : user?.role === 'Manager' ? 'warning' : 'primary'}
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" color="textSecondary" gutterBottom>
                {profileData.designation}
              </Typography>

              <Typography variant="body2" color="textSecondary" gutterBottom>
                {user?.company?.name}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ textAlign: 'left' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email sx={{ mr: 1, color: 'action.active' }} fontSize="small" />
                  <Typography variant="body2">{user?.email}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Phone sx={{ mr: 1, color: 'action.active' }} fontSize="small" />
                  <Typography variant="body2">{profileData.phone}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Business sx={{ mr: 1, color: 'action.active' }} fontSize="small" />
                  <Typography variant="body2">{profileData.department}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday sx={{ mr: 1, color: 'action.active' }} fontSize="small" />
                  <Typography variant="body2">Joined Dec 2024</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              variant="fullWidth"
            >
              <Tab icon={<Person />} label="Personal Info" />
              <Tab icon={<Security />} label="Security" />
              <Tab icon={<Notifications />} label="Notifications" />
              <Tab icon={<History />} label="Activity" />
            </Tabs>
          </Paper>

          {/* Personal Info Tab */}
          {tabValue === 0 && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Personal Information
                  </Typography>
                  {!editMode ? (
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => setEditMode(true)}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={() => setEditMode(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSaveProfile}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  )}
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!editMode}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!editMode}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!editMode}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      value={profileData.department}
                      disabled
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Designation"
                      value={profileData.designation}
                      onChange={(e) => setProfileData(prev => ({ ...prev, designation: e.target.value }))}
                      disabled={!editMode}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Role"
                      value={user?.role}
                      disabled
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={profileData.address}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                      disabled={!editMode}
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>

                {editMode && (
                  <Alert severity="info" sx={{ mt: 3 }}>
                    Some fields like department and role can only be changed by administrators.
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {tabValue === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Security Settings
                </Typography>

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 500 }}>
                  Change Password
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Current Password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="password"
                      label="New Password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Confirm New Password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={handleChangePassword}
                      disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    >
                      Change Password
                    </Button>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                  Two-Factor Authentication
                </Typography>

                <Alert severity="info" sx={{ mb: 2 }}>
                  Two-factor authentication adds an extra layer of security to your account.
                </Alert>

                <Button 
                  variant="outlined" 
                  onClick={() => showSuccess('Two-factor authentication setup coming soon!')}
                >
                  Enable Two-Factor Authentication
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {tabValue === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Notification Preferences
                </Typography>

                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email Notifications"
                      secondary="Receive notifications via email"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onChange={() => handleNotificationChange('emailNotifications')}
                        />
                      }
                      label=""
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <Receipt />
                    </ListItemIcon>
                    <ListItemText
                      primary="Expense Updates"
                      secondary="Get notified about expense status changes"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.expenseUpdates}
                          onChange={() => handleNotificationChange('expenseUpdates')}
                        />
                      }
                      label=""
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <TrendingUp />
                    </ListItemIcon>
                    <ListItemText
                      primary="Approval Requests"
                      secondary="Notifications for expenses requiring approval"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.approvalRequests}
                          onChange={() => handleNotificationChange('approvalRequests')}
                        />
                      }
                      label=""
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <Security />
                    </ListItemIcon>
                    <ListItemText
                      primary="System Updates"
                      secondary="Important system and security updates"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.systemUpdates}
                          onChange={() => handleNotificationChange('systemUpdates')}
                        />
                      }
                      label=""
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <AttachMoney />
                    </ListItemIcon>
                    <ListItemText
                      primary="Marketing Emails"
                      secondary="Product updates and promotional content"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.marketingEmails}
                          onChange={() => handleNotificationChange('marketingEmails')}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          )}

          {/* Activity Tab */}
          {tabValue === 3 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Recent Activity
                </Typography>

                <List>
                  {activityHistory.map((activity) => (
                    <ListItem key={activity.id} divider>
                      <ListItemIcon>
                        {getActivityIcon(activity.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {activity.description}
                            {activity.amount && (
                              <Chip
                                label={`$${activity.amount.toFixed(2)}`}
                                size="small"
                                color={getActivityColor(activity.type)}
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                        secondary={formatDateTime(activity.date)}
                      />
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button 
                    variant="outlined"
                    onClick={() => showSuccess('Full activity history coming soon!')}
                  >
                    View Full History
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
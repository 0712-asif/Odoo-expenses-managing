import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Dashboard,
  Receipt,
  ExitToApp,
  AccountCircle,
  Settings,
  AdminPanelSettings,
  Assessment,
  CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    handleMenuClose();
  };

  const isMenuOpen = Boolean(anchorEl);

  // Don't show navbar on login/signup/terms/privacy pages
  const hideNavbarRoutes = ['/login', '/signup', '/terms', '/privacy'];
  if (!isAuthenticated || hideNavbarRoutes.includes(location.pathname)) {
    return null;
  }

  // Show loading navbar while checking auth
  if (loading) {
    return (
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Expense Management System
          </Typography>
          <CircularProgress size={24} color="inherit" />
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 0, 
              fontWeight: 600, 
              cursor: 'pointer',
              mr: 4
            }}
            onClick={() => navigate('/dashboard')}
          >
            Expense Management System
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              color="inherit"
              startIcon={<Dashboard />}
              onClick={() => navigate('/dashboard')}
              sx={location.pathname === '/dashboard' ? { backgroundColor: 'rgba(255,255,255,0.15)' } : {}}
            >
              Dashboard
            </Button>

            <Button
              color="inherit"
              startIcon={<Receipt />}
              onClick={() => navigate('/expenses')}
              sx={location.pathname.startsWith('/expenses') ? { backgroundColor: 'rgba(255,255,255,0.15)' } : {}}
            >
              Expenses
            </Button>

            {(user?.role === 'Admin' || user?.role === 'Manager') && (
              <Button
                color="inherit"
                startIcon={<CheckCircle />}
                onClick={() => navigate('/approvals')}
                sx={location.pathname === '/approvals' ? { backgroundColor: 'rgba(255,255,255,0.15)' } : {}}
              >
                Approvals
              </Button>
            )}

            {(user?.role === 'Admin' || user?.role === 'Manager') && (
              <Button
                color="inherit"
                startIcon={<Assessment />}
                onClick={() => navigate('/reports')}
                sx={location.pathname === '/reports' ? { backgroundColor: 'rgba(255,255,255,0.15)' } : {}}
              >
                Reports
              </Button>
            )}

            {user?.role === 'Admin' && (
              <Button
                color="inherit"
                startIcon={<AdminPanelSettings />}
                onClick={() => navigate('/admin')}
                sx={location.pathname.startsWith('/admin') ? { backgroundColor: 'rgba(255,255,255,0.15)' } : {}}
              >
                Admin
              </Button>
            )}
          </Box>

          {/* User Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'right' }}>
              <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                {user?.role}
              </Typography>
            </Box>

            <IconButton
              size="large"
              edge="end"
              aria-label="account menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar 
                sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMenuOpen}
        onClose={handleMenuClose}
        sx={{ mt: 1 }}
      >
        <Box sx={{ px: 3, py: 2, minWidth: 200 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {user?.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {user?.email}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {user?.role} â€¢ {user?.company?.name || 'Company'}
          </Typography>
        </Box>

        <Divider />

        <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
          <AccountCircle sx={{ mr: 2 }} />
          My Profile
        </MenuItem>

        <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
          <Settings sx={{ mr: 2 }} />
          Settings
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ExitToApp sx={{ mr: 2 }} />
          Sign Out
        </MenuItem>
      </Menu>
    </>
  );
};

export default Navbar;
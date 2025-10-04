import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  PersonAdd
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Get redirect URL from location state
  const from = location.state?.from || '/dashboard';
  const message = location.state?.message;
  const newUserEmail = location.state?.newUserEmail;

  useEffect(() => {
    // Auto-fill email if user just registered
    if (newUserEmail) {
      setCredentials(prev => ({ ...prev, email: newUserEmail }));
    }
  }, [newUserEmail]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.email || !credentials.password) {
      setError('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await login(credentials);

      if (result.success) {
        showSuccess(`Welcome back, ${result.user.name}!`);
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Invalid email or password');
        showError(result.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = 'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 4
      }}>
        <Paper elevation={8} sx={{ p: 4, width: '100%', borderRadius: 3 }}>
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
              Expense Management System
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              Welcome Back!
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Sign in to your account
            </Typography>
          </Box>

          {message && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {message}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleInputChange}
              margin="normal"
              required
              autoComplete="email"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={handleInputChange}
              margin="normal"
              required
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              startIcon={<LoginIcon />}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="textSecondary">
              New to our platform?
            </Typography>
          </Divider>

          {/* Signup Link */}
          <Box textAlign="center">
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <Button 
                variant="contained" 
                color="secondary"
                fullWidth
                startIcon={<PersonAdd />}
              >
                Create New Account
              </Button>
            </Link>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Set up your expense management system in minutes
            </Typography>
          </Box>

          {/* Support Link */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary">
              Forgot your password? Contact your administrator for support
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
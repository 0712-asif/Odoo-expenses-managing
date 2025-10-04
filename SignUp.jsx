import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Email,
  Lock,
  Person,
  Business,
  Visibility,
  VisibilityOff,
  PersonAdd,
  CheckCircle,
  ArrowBack,
  ArrowForward,
  Phone,
  LocationOn,
  AttachMoney,
  Security,
  Language
} from '@mui/icons-material';
import { useNotification } from '../context/NotificationContext';

const SignUp = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const steps = ['Personal Info', 'Company Setup', 'Account Details', 'Verification'];

  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    designation: ''
  });

  const [companyData, setCompanyData] = useState({
    companyName: '',
    industry: '',
    country: 'United States',
    currency: 'USD',
    employeeCount: '',
    address: ''
  });

  const [accountData, setAccountData] = useState({
    password: '',
    confirmPassword: '',
    role: 'Admin', // First user is always admin
    agreeToTerms: false,
    subscribeToUpdates: false
  });

  const industries = [
    'Technology',
    'Finance',
    'Healthcare',
    'Manufacturing',
    'Retail',
    'Consulting',
    'Education',
    'Real Estate',
    'Marketing',
    'Other'
  ];

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: 'â‚¬', name: 'Euro' },
    { code: 'GBP', symbol: 'Â£', name: 'British Pound' },
    { code: 'INR', symbol: 'â‚¹', name: 'Indian Rupee' },
    { code: 'JPY', symbol: 'Â¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' }
  ];

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 
    'India', 'Japan', 'Australia', 'Singapore', 'Netherlands'
  ];

  const employeeCounts = [
    '1-10 employees',
    '11-50 employees', 
    '51-200 employees',
    '201-500 employees',
    '500+ employees'
  ];

  const handlePersonalDataChange = (e) => {
    const { name, value } = e.target;
    setPersonalData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleCompanyDataChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleAccountDataChange = (e) => {
    const { name, value, checked, type } = e.target;
    setAccountData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: // Personal Info
        if (!personalData.firstName || !personalData.lastName || !personalData.email) {
          setError('Please fill in all required personal information fields');
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(personalData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        break;

      case 1: // Company Setup
        if (!companyData.companyName || !companyData.industry || !companyData.employeeCount) {
          setError('Please fill in all required company information fields');
          return false;
        }
        break;

      case 2: // Account Details
        if (!accountData.password || !accountData.confirmPassword) {
          setError('Please enter and confirm your password');
          return false;
        }
        if (accountData.password !== accountData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (accountData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return false;
        }
        if (!accountData.agreeToTerms) {
          setError('Please accept the terms and conditions');
          return false;
        }
        break;

      default:
        return true;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep - 1)) return;

    setIsSubmitting(true);

    try {
      // Simulate API call for registration
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate successful registration
      const registrationData = {
        user: {
          name: `${personalData.firstName} ${personalData.lastName}`,
          email: personalData.email,
          role: accountData.role,
          designation: personalData.designation
        },
        company: {
          name: companyData.companyName,
          industry: companyData.industry,
          country: companyData.country,
          currency: companyData.currency
        }
      };

      showSuccess('Account created successfully! Welcome to Expense Management System!');

      // Redirect to login with success message
      navigate('/login', { 
        state: { 
          message: `Welcome ${personalData.firstName}! Your account has been created successfully. Please sign in to continue.`,
          newUserEmail: personalData.email
        } 
      });

    } catch (err) {
      setError('Registration failed. Please try again.');
      showError('Registration failed. Please check your information and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCurrency = currencies.find(c => c.code === companyData.currency) || currencies[0];

  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Personal Information
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              ðŸ‘¤ Tell us about yourself
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={personalData.firstName}
                  onChange={handlePersonalDataChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={personalData.lastName}
                  onChange={handlePersonalDataChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={personalData.email}
                  onChange={handlePersonalDataChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={personalData.phone}
                  onChange={handlePersonalDataChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Your Designation"
                  name="designation"
                  value={personalData.designation}
                  onChange={handlePersonalDataChange}
                  placeholder="e.g., CEO, Founder, Manager"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1: // Company Setup
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              ðŸ¢ Set up your company
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name"
                  name="companyName"
                  value={companyData.companyName}
                  onChange={handleCompanyDataChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Industry</InputLabel>
                  <Select
                    name="industry"
                    value={companyData.industry}
                    onChange={handleCompanyDataChange}
                    label="Industry"
                  >
                    {industries.map((industry) => (
                      <MenuItem key={industry} value={industry}>
                        {industry}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Company Size</InputLabel>
                  <Select
                    name="employeeCount"
                    value={companyData.employeeCount}
                    onChange={handleCompanyDataChange}
                    label="Company Size"
                  >
                    {employeeCounts.map((count) => (
                      <MenuItem key={count} value={count}>
                        {count}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    name="country"
                    value={companyData.country}
                    onChange={handleCompanyDataChange}
                    label="Country"
                    startAdornment={<LocationOn sx={{ mr: 1, color: 'action.active' }} />}
                  >
                    {countries.map((country) => (
                      <MenuItem key={country} value={country}>
                        {country}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Primary Currency</InputLabel>
                  <Select
                    name="currency"
                    value={companyData.currency}
                    onChange={handleCompanyDataChange}
                    label="Primary Currency"
                    startAdornment={<AttachMoney sx={{ mr: 1, color: 'action.active' }} />}
                  >
                    {currencies.map((currency) => (
                      <MenuItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code} - {currency.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Address"
                  name="address"
                  value={companyData.address}
                  onChange={handleCompanyDataChange}
                  multiline
                  rows={2}
                  placeholder="Full company address..."
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2: // Account Details
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              ðŸ” Secure your account
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={accountData.password}
                  onChange={handleAccountDataChange}
                  required
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
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={accountData.confirmPassword}
                  onChange={handleAccountDataChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                    As the first user, you will be assigned as:
                  </Typography>
                  <Chip 
                    icon={<Security />}
                    label="Administrator" 
                    color="error" 
                    variant="outlined"
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    You'll have full access to manage users, settings, and approvals.
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <label>
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={accountData.agreeToTerms}
                      onChange={handleAccountDataChange}
                      required
                      style={{ marginRight: 8 }}
                    />
                    <Typography variant="body2" component="span">
                      I agree to the{' '}
                      <Link to="/terms" style={{ color: '#1976d2' }}>
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link to="/privacy" style={{ color: '#1976d2' }}>
                        Privacy Policy
                      </Link>
                    </Typography>
                  </label>
                </Box>

                <Box sx={{ mt: 1 }}>
                  <label>
                    <input
                      type="checkbox"
                      name="subscribeToUpdates"
                      checked={accountData.subscribeToUpdates}
                      onChange={handleAccountDataChange}
                      style={{ marginRight: 8 }}
                    />
                    <Typography variant="body2" component="span">
                      Subscribe to product updates and tips
                    </Typography>
                  </label>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 3: // Verification
        return (
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              âœ… Ready to create your account
            </Typography>

            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Account Summary
              </Typography>

              <Grid container spacing={2} sx={{ textAlign: 'left' }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Name:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {personalData.firstName} {personalData.lastName}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Email:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {personalData.email}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Company:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {companyData.companyName}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Industry:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {companyData.industry}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Currency:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedCurrency.symbol} {companyData.currency}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Role:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Administrator
                  </Typography>
                </Grid>
              </Grid>
            </Card>

            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              By clicking "Create Account", your expense management system will be set up instantly.
            </Typography>

            <List sx={{ maxWidth: 400, mx: 'auto', textAlign: 'left' }}>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText primary="Company workspace created" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText primary="Admin account configured" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText primary="Ready to invite team members" />
              </ListItem>
            </List>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 4
      }}>
        <Paper elevation={8} sx={{ p: 4, width: '100%', borderRadius: 3 }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              ðŸ¢ Create Your Account
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Set up your expense management system in minutes
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step Content */}
          <Box sx={{ minHeight: 400 }}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
            {/* Back Button */}
            {activeStep > 0 && (
              <Button
                onClick={handleBack}
                startIcon={<ArrowBack />}
                disabled={isSubmitting}
              >
                Back
              </Button>
            )}

            {activeStep === 0 && (
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="outlined">
                  Already have an account? Sign In
                </Button>
              </Link>
            )}

            {/* Next/Submit Button */}
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                disabled={isSubmitting}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting}
                startIcon={<PersonAdd />}
                sx={{ minWidth: 160 }}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            )}
          </Box>

          {/* Already have account link */}
          {activeStep > 0 && (
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Already have an account?
              </Typography>
            </Divider>
          )}

          {activeStep > 0 && (
            <Box textAlign="center">
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="outlined" fullWidth>
                  Sign In Instead
                </Button>
              </Link>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default SignUp;
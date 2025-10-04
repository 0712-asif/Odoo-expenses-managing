import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Typography, Button } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Dashboard from './pages/Dashboard';
import ExpenseForm from './pages/ExpenseForm';
import ExpenseList from './pages/ExpenseList';
import ApprovalWorkflow from './pages/ApprovalWorkflow';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import Reports from './pages/Reports';

// Create theme with enhanced signup styling
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      50: '#e3f2fd',
      200: '#90caf9',
    },
    secondary: {
      main: '#dc004e',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          '& .MuiStepIcon-root.Mui-completed': {
            color: '#4caf50',
          },
          '& .MuiStepIcon-root.Mui-active': {
            color: '#1976d2',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
          <AuthProvider>
            <Router>
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />

                <Box 
                  component="main" 
                  sx={{ 
                    flexGrow: 1,
                    backgroundColor: 'background.default'
                  }}
                >
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/register" element={<Navigate to="/signup" replace />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />

                    {/* Protected Routes */}
                    <Route 
                      path="/" 
                      element={<Navigate to="/dashboard" replace />} 
                    />

                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Expense Management Routes */}
                    <Route 
                      path="/expenses" 
                      element={
                        <ProtectedRoute>
                          <ExpenseList />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/expenses/new" 
                      element={
                        <ProtectedRoute>
                          <ExpenseForm />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/expenses/edit/:id" 
                      element={
                        <ProtectedRoute>
                          <ExpenseForm />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Approval Routes */}
                    <Route 
                      path="/approvals" 
                      element={
                        <ProtectedRoute requiredRoles={['Admin', 'Manager']}>
                          <ApprovalWorkflow />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Reports Routes */}
                    <Route 
                      path="/reports" 
                      element={
                        <ProtectedRoute requiredRoles={['Admin', 'Manager']}>
                          <Reports />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Admin Routes */}
                    <Route 
                      path="/admin" 
                      element={
                        <ProtectedRoute requiredRoles={['Admin']}>
                          <AdminPanel />
                        </ProtectedRoute>
                      } 
                    />

                    {/* User Profile */}
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Settings Route */}
                    <Route 
                      path="/settings" 
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } 
                    />

                    {/* 404 Route */}
                    <Route 
                      path="*" 
                      element={
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '50vh',
                            textAlign: 'center',
                            p: 4
                          }}
                        >
                          <Typography variant="h1" sx={{ fontSize: '4rem', fontWeight: 600, color: 'primary.main' }}>
                            404
                          </Typography>
                          <Typography variant="h5" gutterBottom>
                            Page Not Found
                          </Typography>
                          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                            The page you're looking for doesn't exist.
                          </Typography>
                          <Button 
                            variant="contained" 
                            onClick={() => window.location.href = '/dashboard'}
                          >
                            Go to Dashboard
                          </Button>
                        </Box>
                      } 
                    />
                  </Routes>
                </Box>
              </Box>

              {/* Toast Notifications */}
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                toastStyle={{
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              />
            </Router>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
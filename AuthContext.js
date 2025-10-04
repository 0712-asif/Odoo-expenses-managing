import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useNotification } from './NotificationContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { showError, showSuccess } = useNotification();

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          // Try to parse stored user data
          const parsedUser = JSON.parse(userData);

          // Verify token is still valid with backend
          const currentUser = await authService.getCurrentUser();

          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear storage
            logout();
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          // Token expired or invalid, clear storage
          logout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);

      console.log('Attempting login with:', { email: credentials.email });

      // Call backend login API
      const response = await authService.login(credentials);

      console.log('Login response received:', response);

      if (response && response.user && response.token) {
        // Store auth data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        setUser(response.user);
        setIsAuthenticated(true);

        console.log('Login successful for user:', response.user.name);

        return { success: true, user: response.user };
      } else {
        console.error('Invalid login response format:', response);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);

      // Handle different error types
      let errorMessage = 'Login failed. Please try again.';

      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const data = error.response.data;

        console.error('Server error response:', { status, data });

        if (status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (status === 404) {
          errorMessage = 'Login service not found. Please check your backend configuration.';
        } else if (status === 429) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (data && data.message) {
          errorMessage = data.message;
        } else if (data && data.error) {
          errorMessage = data.error;
        }
      } else if (error.request) {
        // Network error
        console.error('Network error:', error.request);
        errorMessage = 'Network error. Please check your connection and backend server.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { 
        success: false, 
        message: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call backend logout API (optional)
      await authService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear local data regardless of API call result
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const refreshAuth = async () => {
    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
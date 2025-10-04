import apiClient from './apiClient';

class AuthService {
  async login(credentials) {
    try {
      console.log('AuthService: Making login request to backend...');

      const response = await apiClient.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });

      console.log('AuthService: Login response received:', response.data);

      return response.data;
    } catch (error) {
      console.error('AuthService: Login failed:', error);

      // Add specific error handling
      if (error.response) {
        console.error('AuthService: Server error response:', {
          status: error.response.status,
          data: error.response.data,
          url: error.config?.url
        });
      } else if (error.request) {
        console.error('AuthService: Network error - no response received');
        console.error('Request details:', error.request);
      }

      throw error;
    }
  }

  async register(userData) {
    try {
      console.log('AuthService: Making register request...');
      const response = await apiClient.post('/auth/register', userData);
      console.log('AuthService: Register response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('AuthService: Register failed:', error);
      throw error;
    }
  }

  async logout() {
    try {
      console.log('AuthService: Making logout request...');
      const response = await apiClient.post('/auth/logout');
      console.log('AuthService: Logout response received');
      return response.data;
    } catch (error) {
      console.error('AuthService: Logout API call failed:', error);
      // Don't throw error for logout - continue with local cleanup
      return null;
    }
  }

  async getCurrentUser() {
    try {
      console.log('AuthService: Getting current user...');
      const response = await apiClient.get('/auth/me');
      console.log('AuthService: Current user response:', response.data);
      return response.data.user || response.data;
    } catch (error) {
      console.error('AuthService: Get current user failed:', error);
      throw error;
    }
  }

  async refreshToken() {
    try {
      console.log('AuthService: Refreshing token...');
      const response = await apiClient.post('/auth/refresh');

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('AuthService: Token refreshed successfully');
      }

      return response.data;
    } catch (error) {
      console.error('AuthService: Token refresh failed:', error);
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await apiClient.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Utility methods
  getToken() {
    return localStorage.getItem('token');
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  hasRole(role) {
    const user = this.getUser();
    return user?.role === role;
  }

  hasAnyRole(roles) {
    const user = this.getUser();
    return roles.includes(user?.role);
  }
}

export const authService = new AuthService();
export default authService;
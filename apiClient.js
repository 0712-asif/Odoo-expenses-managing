import axios from 'axios';

// Get API base URL from environment or use default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 15000;

console.log('API Configuration:', {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  env: process.env.NODE_ENV
});

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and logging
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Enhanced logging
    console.log(`ðŸš€ API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
      data: config.data,
      headers: config.headers,
      timeout: config.timeout
    });

    return config;
  },
  (error) => {
    console.error('âŒ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(`âœ… API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
      headers: response.headers
    });

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Enhanced error logging
    console.error(`âŒ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code,
      request: error.request ? 'Request made but no response' : 'Request not sent',
      url: originalRequest?.url,
      baseURL: originalRequest?.baseURL
    });

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401 && !originalRequest._retry) {
        // Unauthorized - try to refresh token first
        originalRequest._retry = true;

        try {
          console.log('ðŸ”„ Attempting token refresh...');
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (refreshResponse.data.token) {
            localStorage.setItem('token', refreshResponse.data.token);
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
            console.log('âœ… Token refreshed, retrying original request...');
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          console.error('âŒ Token refresh failed:', refreshError);
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          // Only redirect if we're not already on the login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else if (status === 401) {
        // Still unauthorized after refresh attempt
        console.log('ðŸ” Authentication failed, redirecting to login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      // Return error with proper structure
      return Promise.reject(error);
    } else if (error.request) {
      // Network error - no response received
      console.error('ðŸŒ Network Error Details:', {
        message: error.message,
        code: error.code,
        timeout: error.config?.timeout,
        baseURL: error.config?.baseURL,
        url: error.config?.url
      });

      const networkError = new Error('Network error. Please check your connection and ensure the backend server is running.');
      networkError.type = 'network_error';
      networkError.originalError = error;

      return Promise.reject(networkError);
    } else {
      // Other error (request setup, etc.)
      console.error('âš ï¸ Request Setup Error:', error.message);
      return Promise.reject(error);
    }
  }
);

export default apiClient;
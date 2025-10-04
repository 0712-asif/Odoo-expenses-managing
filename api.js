import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_DEBUG === 'true') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_DEBUG === 'true') {
      console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    const { response, request, message } = error;

    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        message,
        url: request?.responseURL,
        status: response?.status,
        data: response?.data,
      });
    }

    // Handle different error scenarios
    if (response) {
      // Server responded with error status
      const { status, data } = response;

      switch (status) {
        case 400:
          // Bad request - validation errors
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => {
              toast.error(`${err.field}: ${err.message}`);
            });
          } else if (data.message) {
            toast.error(data.message);
          }
          break;

        case 401:
          // Unauthorized - token expired or invalid
          if (data.code === 'TOKEN_EXPIRED' || data.code === 'TOKEN_INVALID') {
            localStorage.removeItem('token');
            toast.error('Session expired. Please login again.');
            // Redirect to login page
            window.location.href = '/login';
          } else {
            toast.error(data.message || 'Unauthorized access');
          }
          break;

        case 403:
          // Forbidden - insufficient permissions
          toast.error(data.message || 'Access denied. Insufficient permissions.');
          break;

        case 404:
          // Not found
          toast.error(data.message || 'Resource not found');
          break;

        case 409:
          // Conflict - duplicate resource
          toast.error(data.message || 'Resource already exists');
          break;

        case 429:
          // Too many requests
          toast.error('Too many requests. Please try again later.');
          break;

        case 500:
          // Internal server error
          toast.error('Server error. Please try again later.');
          break;

        default:
          toast.error(data.message || 'An unexpected error occurred');
      }

      return Promise.reject(error);
    } else if (request) {
      // Request was made but no response received
      toast.error('Network error. Please check your connection.');
      return Promise.reject(new Error('Network error'));
    } else {
      // Request setup error
      toast.error('Request failed. Please try again.');
      return Promise.reject(error);
    }
  }
);

// Helper functions for different HTTP methods
const apiHelpers = {
  get: (url, params = {}) => {
    return api.get(url, { params });
  },

  post: (url, data = {}) => {
    return api.post(url, data);
  },

  put: (url, data = {}) => {
    return api.put(url, data);
  },

  patch: (url, data = {}) => {
    return api.patch(url, data);
  },

  delete: (url) => {
    return api.delete(url);
  },

  upload: (url, formData, onUploadProgress = null) => {
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
};

// Utility function to handle API responses
export const handleApiResponse = (response) => {
  if (response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.message || 'API request failed');
  }
};

// Utility function to create query parameters
export const createQueryParams = (params) => {
  const searchParams = new URLSearchParams();

  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item));
      } else {
        searchParams.append(key, value);
      }
    }
  });

  return searchParams.toString();
};

// Health check function
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'ERROR', message: error.message };
  }
};

export { api, apiHelpers };
export default api;
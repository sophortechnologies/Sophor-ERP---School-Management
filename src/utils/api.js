// src/utils/api.js
import axios from 'axios';
import { API_CONFIG } from '../config/swagger.config';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;
      
      console.error('❌ API Error Details:');
      console.error(`  - Message: ${error.message}`);
      console.error(`  - Code: ${error.code}`);
      console.error(`  - Response status: ${status}`);
      console.error(`  - Response data:`, data);
      console.error(`  - URL: ${error.config?.url}`);
      console.error(`  - Is Initializing: ${window.__APP_INITIALIZING__ || false}`);
      
      // Handle specific status codes
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (status === 403) {
        // Forbidden
        console.error('Access forbidden. Insufficient permissions.');
      } else if (status === 404) {
        // Not found
        console.error('Resource not found.');
      } else if (status >= 500) {
        // Server error
        console.error('Server error. Please try again later.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
export const handleApiError = (error, customMessage = 'API request failed') => {
  if (error.response) {
    const { status, data } = error.response;
    return {
      error: true,
      message: data?.message || customMessage,
      status,
      data
    };
  } else if (error.request) {
    return {
      error: true,
      message: 'No response received from server',
      status: 0
    };
  } else {
    return {
      error: true,
      message: error.message || customMessage,
      status: 0
    };
  }
};

// Helper function for making API calls with error handling
export const apiCall = async (method, url, data = null, config = {}) => {
  try {
    const response = await api({
      method,
      url,
      data,
      ...config
    });
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

// Export the axios instance as default
export default api;
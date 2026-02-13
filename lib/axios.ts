/**
 * Admin Axios Configuration with Interceptors
 * Handles global authentication errors and redirects
 */

import axios from 'axios';
import config from './config';

// Create axios instance with dynamic base URL and production optimizations
const axiosInstance = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.isDevelopment ? 10000 : 30000, // Increased timeout for production
  withCredentials: true,
  
  // Production optimizations
  ...(config.isProduction && {
    headers: {
      'Connection': 'keep-alive',
      'Keep-Alive': 'timeout=5, max=1000'
    }
  })
});

// Request interceptor to add auth headers and enhanced production handling
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Production-specific headers for better CORS handling
    if (process.env.NODE_ENV === 'production') {
      config.headers['Content-Type'] = 'application/json';
      config.headers['Accept'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
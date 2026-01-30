/**
 * Admin Axios Configuration with Interceptors
 * Handles global authentication errors and redirects
 */

import axios from 'axios';
import config from './config';

// Create axios instance with dynamic base URL
const axiosInstance = axios.create({
  baseURL: config.api.baseURL,
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor to add auth headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
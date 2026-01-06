/**
 * API Configuration for Admin Panel
 * Base URL and authentication utilities for admin Redux async thunks
 */

// API Base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Get admin authentication headers for API requests
 */
export const getAdminAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Get admin authentication token from localStorage
 */
export const getAdminToken = (): string | null => {
  return localStorage.getItem('adminToken');
};

/**
 * Set admin authentication token in localStorage
 */
export const setAdminToken = (token: string) => {
  localStorage.setItem('adminToken', token);
};

/**
 * Set admin user data in localStorage
 */
export const setAdminUserData = (user: any) => {
  localStorage.setItem('adminUser', JSON.stringify(user));
};

/**
 * Get admin user data from localStorage
 */
export const getAdminUserData = () => {
  const userData = localStorage.getItem('adminUser');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      return null;
    }
  }
  return null;
};

/**
 * Remove admin authentication token from localStorage
 */
export const removeAdminToken = () => {
  localStorage.removeItem('adminToken');
};

/**
 * Remove admin user data from localStorage
 */
export const removeAdminUserData = () => {
  localStorage.removeItem('adminUser');
};

/**
 * Clear all admin authentication data
 */
export const clearAdminAuthData = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};

/**
 * Check if admin is authenticated
 */
export const isAdminAuthenticated = (): boolean => {
  const token = getAdminToken();
  return !!token;
};
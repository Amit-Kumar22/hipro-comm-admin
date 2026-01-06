/**
 * Admin Authentication Redux Slice
 * Handles admin-specific authentication using /api/v1/admin endpoints
 * Completely separate from customer authentication system
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { 
  API_BASE_URL, 
  setAdminToken, 
  removeAdminToken, 
  setAdminUserData, 
  removeAdminUserData, 
  getAdminToken, 
  getAdminUserData,
  clearAdminAuthData 
} from '../config/api.config';

// Admin user interface
export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin';
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth interfaces
export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface AdminRegisterCredentials {
  name: string;
  email: string;
  password: string;
  role?: 'admin';
}

export interface AdminAuthResponse {
  user: AdminUser;
  token: string;
}

// Auth state interface
interface AdminAuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Initial state with localStorage restoration
const getInitialAdminAuthState = (): AdminAuthState => {
  if (typeof window !== 'undefined') {
    try {
      const token = getAdminToken();
      const user = getAdminUserData();
      
      // Only restore admin users
      if (token && user && user.role === 'admin') {
        return {
          user: user as AdminUser,
          token,
          isAuthenticated: true,
          loading: false,
          error: null,
        };
      }
    } catch (error) {
      console.error('Error restoring admin auth state:', error);
      // Clear corrupted data
      clearAdminAuthData();
    }
  }
  
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };
};

const initialState: AdminAuthState = getInitialAdminAuthState();

// Admin Login
export const loginAdmin = createAsyncThunk(
  'adminAuth/loginAdmin',
  async (credentials: AdminLoginCredentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        credentials,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { user, token } = response.data.data as AdminAuthResponse;
      
      // Verify admin role
      if (user.role !== 'admin') {
        throw new Error('Access denied. Admin credentials required.');
      }
      
      // Store in localStorage with admin-specific keys
      setAdminToken(token);
      setAdminUserData(user);
      
      return { user, token };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Admin login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// Admin Register
export const registerAdmin = createAsyncThunk(
  'adminAuth/registerAdmin',
  async (credentials: AdminRegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        {
          ...credentials,
          role: 'admin' // Force admin role
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { user, token } = response.data.data as AdminAuthResponse;
      
      // Verify admin role was assigned
      if (user.role !== 'admin') {
        throw new Error('Admin registration failed. Admin role not assigned.');
      }
      
      // Store in localStorage with admin-specific keys
      setAdminToken(token);
      setAdminUserData(user);
      
      return { user, token };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Admin registration failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get Admin Profile
export const getAdminProfile = createAsyncThunk(
  'adminAuth/getAdminProfile',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAdminToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${API_BASE_URL}/auth/me`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const user = response.data.data.user as AdminUser;
      
      // Verify admin role
      if (user.role !== 'admin') {
        throw new Error('Invalid admin session');
      }

      // Update localStorage
      setAdminUserData(user);

      return user;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get admin profile';
      return rejectWithValue(errorMessage);
    }
  }
);

// Logout Admin
export const logoutAdmin = createAsyncThunk(
  'adminAuth/logoutAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAdminToken();
      if (token) {
        await axios.post(
          `${API_BASE_URL}/auth/logout`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      
      // Clear localStorage regardless of API success
      clearAdminAuthData();
      
      return null;
    } catch (error: any) {
      // Always clear local data on logout
      clearAdminAuthData();
      const errorMessage = error.response?.data?.message || error.message || 'Logout failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// Admin Auth Slice
const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    clearAdminCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      clearAdminAuthData();
    },
  },
  extraReducers: (builder) => {
    // Login Admin
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });

    // Register Admin
    builder
      .addCase(registerAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerAdmin.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });

    // Get Admin Profile
    builder
      .addCase(getAdminProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getAdminProfile.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
        clearAdminAuthData();
      });

    // Logout Admin
    builder
      .addCase(logoutAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutAdmin.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAdminError, clearAdminCredentials } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
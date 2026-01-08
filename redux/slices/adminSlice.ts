/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL, getAdminAuthHeaders } from '../config/api.config';

/**
 * Admin Dashboard Types
 */
export interface DashboardStats {
  overview: {
    totalUsers: number;
    totalProducts: number;
    totalCategories: number;
    totalOrders: number;
    recentProducts: number;
    recentUsers: number;
  };
  topCategories: Array<{
    name: string;
    slug: string;
    productCount: number;
  }>;
}

export interface RecentActivity {
  _id: string;
  type: 'order' | 'user' | 'product' | 'system';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  isEmailVerified: boolean;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

interface AdminState {
  dashboardStats: DashboardStats | null;
  recentActivity: RecentActivity[];
  users: AdminUser[];
  currentUser: AdminUser | null;
  usersPagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
  systemInfo: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  dashboardStats: null,
  recentActivity: [],
  users: [],
  currentUser: null,
  usersPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    hasNext: false,
    hasPrev: false,
    limit: 10,
  },
  systemInfo: null,
  loading: false,
  error: null,
};

// Get Dashboard Stats
export const getDashboardStats = createAsyncThunk(
  'admin/getDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/dashboard/stats`,
        { headers: getAdminAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch dashboard stats';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get Recent Activity
export const getRecentActivity = createAsyncThunk(
  'admin/getRecentActivity',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/dashboard/activity?limit=${limit}`,
        { headers: getAdminAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch recent activity';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get All Users
export const getAllUsers = createAsyncThunk(
  'admin/getAllUsers',
  async (params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: 'admin' | 'customer';
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.role) queryParams.append('role', params.role);

      const response = await axios.get(
        `${API_BASE_URL}/admin/users?${queryParams.toString()}`,
        { headers: getAdminAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch users';
      return rejectWithValue(errorMessage);
    }
  }
);

// Update User Role
export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }: { userId: string; role: 'admin' | 'customer' }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/users/${userId}/role`,
        { role },
        { headers: getAdminAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update user role';
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete User
export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/admin/users/${userId}`,
        { headers: getAdminAuthHeaders() }
      );
      return userId;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get System Info
export const getSystemInfo = createAsyncThunk(
  'admin/getSystemInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/system/info`,
        { headers: getAdminAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch system info';
      return rejectWithValue(errorMessage);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    clearDashboardData: (state) => {
      state.dashboardStats = null;
      state.recentActivity = [];
    },
  },
  extraReducers: (builder) => {
    // Get Dashboard Stats
    builder
      .addCase(getDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Recent Activity
    builder
      .addCase(getRecentActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRecentActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.recentActivity = action.payload;
      })
      .addCase(getRecentActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get All Users
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || action.payload || [];
        state.usersPagination = action.payload.pagination || state.usersPagination;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update User Role
    builder
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(u => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete User
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(u => u._id !== action.payload);
        state.usersPagination.totalCount -= 1;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get System Info
    builder
      .addCase(getSystemInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSystemInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.systemInfo = action.payload;
      })
      .addCase(getSystemInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAdminError, clearDashboardData } = adminSlice.actions;
export default adminSlice.reducer;
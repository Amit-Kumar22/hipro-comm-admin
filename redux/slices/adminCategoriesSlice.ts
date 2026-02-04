/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL, getAdminAuthHeaders } from '../config/api.config';

/**
 * Admin Category Management Types
 */
export interface AdminCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategory?: string;
  isActive: boolean;
  sortOrder: number;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminCategoriesState {
  categories: AdminCategory[];
  currentCategory: AdminCategory | null;
  loading: boolean;
  error: string | null;
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
}

const initialState: AdminCategoriesState = {
  categories: [],
  currentCategory: null,
  loading: false,
  error: null,
  pagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    hasNext: false,
    hasPrev: false,
    limit: 10,
  },
};

// Admin Get Categories
export const getAdminCategories = createAsyncThunk(
  'adminCategories/getCategories',
  async (params: {
    page?: number;
    limit?: number;
    search?: string;
    includeInactive?: boolean;
    parentCategory?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.includeInactive !== undefined) queryParams.append('includeInactive', params.includeInactive.toString());
      if (params.parentCategory) queryParams.append('parentCategory', params.parentCategory);

      const response = await axios.get(
        `${API_BASE_URL}/categories?${queryParams.toString()}`,
        { headers: getAdminAuthHeaders() }
      );

      // Safely handle the API response structure
      const responseData = response.data?.data || response.data || {};
      const categories = responseData.categories || responseData || [];
      const pagination = responseData.pagination || {
        totalCount: Array.isArray(categories) ? categories.length : 0,
        totalPages: 1,
        currentPage: 1,
        hasNext: false,
        hasPrev: false,
        limit: 10,
      };

      return {
        categories: Array.isArray(categories) ? categories : [],
        pagination
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch categories';
      return rejectWithValue(errorMessage);
    }
  }
);

// Admin Get Single Category
export const getAdminCategory = createAsyncThunk(
  'adminCategories/getCategory',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/categories/${categoryId}`,
        { headers: getAdminAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch category';
      return rejectWithValue(errorMessage);
    }
  }
);

// Admin Create Category
export const createAdminCategory = createAsyncThunk(
  'adminCategories/createCategory',
  async (categoryData: Omit<AdminCategory, '_id' | 'createdAt' | 'updatedAt' | 'productCount'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/categories`,
        categoryData,
        { headers: getAdminAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      // Return detailed error information
      const errorResponse = {
        message: error.response?.data?.error || error.response?.data?.message || 'Failed to create category',
        details: error.response?.data?.details || null
      };
      return rejectWithValue(errorResponse);
    }
  }
);

// Admin Update Category
export const updateAdminCategory = createAsyncThunk(
  'adminCategories/updateCategory',
  async ({ categoryId, categoryData }: { 
    categoryId: string; 
    categoryData: Partial<AdminCategory> 
  }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/categories/${categoryId}`,
        categoryData,
        { headers: getAdminAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      // Return detailed error information
      const errorResponse = {
        message: error.response?.data?.error || error.response?.data?.message || 'Failed to update category',
        details: error.response?.data?.details || null
      };
      return rejectWithValue(errorResponse);
    }
  }
);

// Admin Delete Category
export const deleteAdminCategory = createAsyncThunk(
  'adminCategories/deleteCategory',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/categories/${categoryId}`,
        { headers: getAdminAuthHeaders() }
      );
      return categoryId;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete category';
      return rejectWithValue(errorMessage);
    }
  }
);

const adminCategoriesSlice = createSlice({
  name: 'adminCategories',
  initialState,
  reducers: {
    clearAdminCategoriesError: (state) => {
      state.error = null;
    },
    clearCurrentAdminCategory: (state) => {
      state.currentCategory = null;
    },
  },
  extraReducers: (builder) => {
    // Get Admin Categories
    builder
      .addCase(getAdminCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload?.categories || [];
        state.pagination = action.payload?.pagination || initialState.pagination;
      })
      .addCase(getAdminCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Ensure categories is always an array even on error
        state.categories = [];
        state.pagination = initialState.pagination;
      });

    // Get Admin Category
    builder
      .addCase(getAdminCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload;
      })
      .addCase(getAdminCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Admin Category
    builder
      .addCase(createAdminCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdminCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.unshift(action.payload);
        state.pagination.totalCount += 1;
      })
      .addCase(createAdminCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Admin Category
    builder
      .addCase(updateAdminCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        if (state.currentCategory?._id === action.payload._id) {
          state.currentCategory = action.payload;
        }
      })
      .addCase(updateAdminCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Admin Category
    builder
      .addCase(deleteAdminCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(c => c._id !== action.payload);
        state.pagination.totalCount -= 1;
        if (state.currentCategory?._id === action.payload) {
          state.currentCategory = null;
        }
      })
      .addCase(deleteAdminCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearAdminCategoriesError, 
  clearCurrentAdminCategory 
} = adminCategoriesSlice.actions;

export default adminCategoriesSlice.reducer;
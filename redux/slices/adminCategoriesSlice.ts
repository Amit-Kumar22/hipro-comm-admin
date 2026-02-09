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
  
  // Standardized pagination and search state
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search: string;
  
  // Filters
  filters: {
    includeInactive?: boolean;
    parentOnly?: boolean;
    parentCategory?: string;
  };
}

const initialState: AdminCategoriesState = {
  categories: [],
  currentCategory: null,
  loading: false,
  error: null,
  
  // Standardized pagination and search state
  page: 1,
  size: 20,
  totalPages: 0,
  totalElements: 0,
  sortBy: 'sortOrder',
  sortOrder: 'asc',
  search: '',
  
  // Filters
  filters: {},
};

// Admin Get Categories
export const getAdminCategories = createAsyncThunk(
  'adminCategories/getCategories',
  async (params: {
    page?: number;
    size?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includeInactive?: boolean;
    parentCategory?: string;
    parentOnly?: boolean;
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Standardized pagination params
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.size) queryParams.append('size', params.size.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.search) queryParams.append('search', params.search);
      
      // Category-specific filters  
      if (params.includeInactive !== undefined) queryParams.append('includeInactive', params.includeInactive.toString());
      if (params.parentCategory) queryParams.append('parentCategory', params.parentCategory);
      if (params.parentOnly !== undefined) queryParams.append('parentOnly', params.parentOnly.toString());

      const response = await axios.get(
        `${API_BASE_URL}/categories?${queryParams.toString()}`,
        { headers: getAdminAuthHeaders() }
      );

      return response.data;
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
    
    // Standardized pagination and search actions
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setSize: (state, action) => {
      state.size = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Reset to initial state
    resetCategoriesState: (state) => {
      state.page = 1;
      state.search = '';
      state.filters = {};
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
        state.categories = action.payload?.data || [];
        
        // Update standardized pagination state
        if (action.payload.pageable) {
          state.page = action.payload.pageable.page;
          state.size = action.payload.pageable.size;
          state.totalPages = action.payload.pageable.totalPages;
          state.totalElements = action.payload.pageable.totalElements;
        }
      })
      .addCase(getAdminCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Ensure categories is always an array even on error
        state.categories = [];
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
        state.totalElements += 1;
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
        state.totalElements = Math.max(0, state.totalElements - 1);
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
  clearCurrentAdminCategory,
  setPage,
  setSize,
  setSortBy,
  setSortOrder,
  setSearch,
  setFilters,
  resetCategoriesState
} = adminCategoriesSlice.actions;

export default adminCategoriesSlice.reducer;
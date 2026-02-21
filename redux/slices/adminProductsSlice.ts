 
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL, getAdminAuthHeaders } from '../config/api.config';

/**
 * Admin Product Management Types
 */
export interface AdminProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: {
    original: number;
    selling: number;
    discount: number;
  };
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  sku: string;
  image?: string;
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  specifications?: Array<{
    key: string;
    value: string;
  }>;
  variants?: Array<{
    name: string;
    options: Array<{
      name: string;
      value: string;
      priceAdjustment: number;
      sku: string;
    }>;
  }>;
  inStock: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  inventory?: {
    quantity: number;
    reserved: number;
    available: number;
    threshold: number;
    isOutOfStock: boolean;
    availableForSale: number;
  };
  returnPolicy?: string;
  whatsInTheBox?: Array<{
    component: string;
    quantity: number;
  }>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

interface AdminProductsState {
  products: AdminProduct[];
  featuredProducts: AdminProduct[];
  deletedProducts: AdminProduct[]; // For Delete History
  currentProduct: AdminProduct | null;
  loading: boolean;
  deletedLoading: boolean; // Loading state for deleted products
  error: string | null;
  
  // Standardized pagination and search state
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  sortBy: 'createdAt' | 'name' | 'price';
  sortOrder: 'asc' | 'desc';
  search: string;
  
  // Delete History Pagination
  deletedPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  
  // Filters
  filters: {
    category?: string;
    isActive?: boolean;
    isFeatured?: boolean;
  };
}

const initialState: AdminProductsState = {
  products: [],
  featuredProducts: [],
  deletedProducts: [], // Initialize deleted products array
  currentProduct: null,
  loading: false,
  deletedLoading: false, // Initialize deleted loading state
  error: null,
  
  // Standardized pagination and search state
  page: 1,
  size: 10,
  totalPages: 0,
  totalElements: 0,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  search: '',
  
  // Delete History Pagination
  deletedPagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  
  // Filters - Default to show only active products
  filters: { isActive: true },
};

// Admin Get Products
export const getAdminProducts = createAsyncThunk(
  'adminProducts/getProducts',
  async (params: {
    page?: number;
    size?: number;
    category?: string;
    search?: string;
    sortBy?: 'createdAt' | 'name' | 'price';
    sortOrder?: 'asc' | 'desc';
    isActive?: boolean;
    isFeatured?: boolean;
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Standardized pagination params
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.size) queryParams.append('size', params.size.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.search) queryParams.append('search', params.search);
      
      // Product-specific filters
      if (params.category) queryParams.append('category', params.category);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params.isFeatured !== undefined) queryParams.append('isFeatured', params.isFeatured.toString());

      const response = await axios.get(
        `${API_BASE_URL}/products?${queryParams.toString()}`,
        { headers: getAdminAuthHeaders() }
      );

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch products';
      return rejectWithValue(errorMessage);
    }
  }
);

// Admin Get Single Product
export const getAdminProduct = createAsyncThunk(
  'adminProducts/getProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/products/${productId}`,
        { headers: getAdminAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch product';
      return rejectWithValue(errorMessage);
    }
  }
);

// Admin Create Product
export const createAdminProduct = createAsyncThunk(
  'adminProducts/createProduct',
  async (productData: any, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/products`,
        productData,
        { headers: getAdminAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      // Return detailed error information
      const errorResponse = {
        message: error.response?.data?.error || error.response?.data?.message || 'Failed to create product',
        details: error.response?.data?.details || null
      };
      return rejectWithValue(errorResponse);
    }
  }
);

// Admin Update Product
export const updateAdminProduct = createAsyncThunk(
  'adminProducts/updateProduct',
  async ({ productId, productData }: { 
    productId: string; 
    productData: any 
  }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/products/${productId}`,
        productData,
        { headers: getAdminAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      // Return detailed error information
      const errorResponse = {
        message: error.response?.data?.error || error.response?.data?.message || 'Failed to update product',
        details: error.response?.data?.details || null
      };
      return rejectWithValue(errorResponse);
    }
  }
);

// Admin Delete Product (SOFT DELETE - moves to Delete History)
export const deleteAdminProduct = createAsyncThunk(
  'adminProducts/deleteProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/products/${productId}`,  // No ?permanent=true, so SOFT DELETE
        { headers: getAdminAuthHeaders() }
      );
      
      console.log('🚀 SOFT DELETE SUCCESS:', response.data);
      
      // Return the response data which includes productId, deletedPermanently, and action
      return {
        productId,
        ...response.data.data
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete product';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get Deleted Products for Delete History page
export const getDeletedProducts = createAsyncThunk(
  'adminProducts/getDeletedProducts',
  async (params: {
    page?: number;
    limit?: number;
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await axios.get(
        `${API_BASE_URL}/products/deleted?${queryParams.toString()}`,
        { headers: getAdminAuthHeaders() }
      );

      console.log('🗂️ DELETED PRODUCTS LOADED:', response.data.data.products.length);
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch deleted products';
      return rejectWithValue(errorMessage);
    }
  }
);

// Permanently Delete Product (from Delete History)
export const permanentDeleteProduct = createAsyncThunk(
  'adminProducts/permanentDeleteProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/products/${productId}?permanent=true`,  // permanent=true for HARD DELETE
        { headers: getAdminAuthHeaders() }
      );
      
      console.log('🗑️ PERMANENT DELETE SUCCESS:', response.data);
      
      return {
        productId,
        ...response.data.data
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to permanently delete product';
      return rejectWithValue(errorMessage);
    }
  }
);

// Restore Product from Delete History
export const restoreProduct = createAsyncThunk(
  'adminProducts/restoreProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/products/${productId}/restore`,
        {},
        { headers: getAdminAuthHeaders() }
      );
      
      console.log('♻️ RESTORE SUCCESS:', response.data);
      
      return {
        productId,
        ...response.data.data
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to restore product';
      return rejectWithValue(errorMessage);
    }
  }
);

const adminProductsSlice = createSlice({
  name: 'adminProducts',
  initialState,
  reducers: {
    clearAdminProductsError: (state) => {
      state.error = null;
    },
    setAdminProductsFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentAdminProduct: (state) => {
      state.currentProduct = null;
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
    
    // Reset to initial state
    resetProductsState: (state) => {
      state.page = 1;
      state.search = '';
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    // Get Admin Products
    builder
      .addCase(getAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data || [];
        
        // Update standardized pagination state
        if (action.payload.pageable) {
          state.page = action.payload.pageable.page;
          state.size = action.payload.pageable.size;
          state.totalPages = action.payload.pageable.totalPages;
          state.totalElements = action.payload.pageable.totalElements;
        }
      })
      .addCase(getAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Admin Product
    builder
      .addCase(getAdminProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(getAdminProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Admin Product
    builder
      .addCase(createAdminProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdminProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
        state.totalElements += 1;
      })
      .addCase(createAdminProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Admin Product
    builder
      .addCase(updateAdminProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.currentProduct?._id === action.payload._id) {
          state.currentProduct = action.payload;
        }
      })
      .addCase(updateAdminProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Admin Product (SOFT DELETE)
    builder
      .addCase(deleteAdminProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminProduct.fulfilled, (state, action) => {
        state.loading = false;
        
        const { productId, action: deleteAction } = action.payload;
        
        if (deleteAction === 'soft_delete') {
          // Soft delete - REMOVE from active products list (since it's now in delete history)
          state.products = state.products.filter(p => p._id !== productId);
          state.totalElements = Math.max(0, state.totalElements - 1);
          
          console.log(`📦 Product SOFT DELETED (moved to Delete History): ${productId}`);
        }
        
        // Clear current product if it was the deleted one
        if (state.currentProduct?._id === productId) {
          state.currentProduct = null;
        }
      })
      .addCase(deleteAdminProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Deleted Products
    builder
      .addCase(getDeletedProducts.pending, (state) => {
        state.deletedLoading = true;
        state.error = null;
      })
      .addCase(getDeletedProducts.fulfilled, (state, action) => {
        state.deletedLoading = false;
        state.deletedProducts = action.payload.data.products || [];
        state.deletedPagination = action.payload.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        };
        
        console.log(`🗂️ Loaded ${state.deletedProducts.length} deleted products`);
      })
      .addCase(getDeletedProducts.rejected, (state, action) => {
        state.deletedLoading = false;
        state.error = action.payload as string;
      });

    // Permanent Delete Product
    builder
      .addCase(permanentDeleteProduct.pending, (state) => {
        state.deletedLoading = true;
        state.error = null;
      })
      .addCase(permanentDeleteProduct.fulfilled, (state, action) => {
        state.deletedLoading = false;
        
        const { productId, deletedPermanently } = action.payload;
        
        if (deletedPermanently) {
          // Remove from deleted products list
          state.deletedProducts = state.deletedProducts.filter(p => p._id !== productId);
          state.deletedPagination.total = Math.max(0, state.deletedPagination.total - 1);
          
          console.log(`🗑️ Product PERMANENTLY DELETED: ${productId}`);
        }
      })
      .addCase(permanentDeleteProduct.rejected, (state, action) => {
        state.deletedLoading = false;
        state.error = action.payload as string;
      });

    // Restore Product
    builder
      .addCase(restoreProduct.pending, (state) => {
        state.deletedLoading = true;
        state.error = null;
      })
      .addCase(restoreProduct.fulfilled, (state, action) => {
        state.deletedLoading = false;
        
        const { productId, restored } = action.payload;
        
        if (restored) {
          // Remove from deleted products list (it's now back in active products)
          state.deletedProducts = state.deletedProducts.filter(p => p._id !== productId);
          state.deletedPagination.total = Math.max(0, state.deletedPagination.total - 1);
          
          console.log(`♻️ Product RESTORED: ${productId}`);
        }
      })
      .addCase(restoreProduct.rejected, (state, action) => {
        state.deletedLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearAdminProductsError, 
  setAdminProductsFilters, 
  clearCurrentAdminProduct,
  setPage,
  setSize,
  setSortBy,
  setSortOrder,
  setSearch,
  resetProductsState
} = adminProductsSlice.actions;

export default adminProductsSlice.reducer;
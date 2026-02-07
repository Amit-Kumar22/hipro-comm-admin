/* eslint-disable @typescript-eslint/no-explicit-any */
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
}

interface AdminProductsState {
  products: AdminProduct[];
  featuredProducts: AdminProduct[];
  currentProduct: AdminProduct | null;
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
  filters: {
    category?: string;
    search?: string;
    sortBy: 'createdAt' | 'name' | 'price';
    sortOrder: 'asc' | 'desc';
    isActive?: boolean;
    isFeatured?: boolean;
  };
}

const initialState: AdminProductsState = {
  products: [],
  featuredProducts: [],
  currentProduct: null,
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
  filters: {
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
};

// Admin Get Products
export const getAdminProducts = createAsyncThunk(
  'adminProducts/getProducts',
  async (params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: 'createdAt' | 'name' | 'price';
    sortOrder?: 'asc' | 'desc';
    isActive?: boolean;
    isFeatured?: boolean;
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.category) queryParams.append('category', params.category);
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params.isFeatured !== undefined) queryParams.append('isFeatured', params.isFeatured.toString());

      const response = await axios.get(
        `${API_BASE_URL}/products?${queryParams.toString()}`,
        { headers: getAdminAuthHeaders() }
      );

      return response.data.data;
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

// Admin Delete Product
export const deleteAdminProduct = createAsyncThunk(
  'adminProducts/deleteProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/products/${productId}`,
        { headers: getAdminAuthHeaders() }
      );
      return productId;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete product';
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
        state.products = action.payload.products || [];
        state.pagination = action.payload.pagination || initialState.pagination;
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
        state.pagination.totalCount += 1;
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

    // Delete Admin Product
    builder
      .addCase(deleteAdminProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(p => p._id !== action.payload);
        state.pagination.totalCount -= 1;
        if (state.currentProduct?._id === action.payload) {
          state.currentProduct = null;
        }
      })
      .addCase(deleteAdminProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearAdminProductsError, 
  setAdminProductsFilters, 
  clearCurrentAdminProduct 
} = adminProductsSlice.actions;

export default adminProductsSlice.reducer;
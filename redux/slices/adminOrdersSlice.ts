import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL, getAdminAuthHeaders } from '../config/api.config';

export interface AdminOrder {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: {
    _id: string;
    product: {
      _id: string;
      name: string;
      images: { url: string; alt: string }[];
    };
    name: string;
    sku: string;
    price: number;
    quantity: number;
    total: number;
  }[];
  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    phone: string;
  };
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentId?: string;
  tracking?: {
    carrier?: string;
    trackingNumber?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminOrdersState {
  orders: AdminOrder[];
  stats: {
    totalOrders: number;
    totalRevenue: number;
    todaysOrders: number;
    todaysRevenue: number;
    statusBreakdown: Record<string, number>;
  } | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
  filters: {
    status?: string;
    search?: string;
  };
}

const initialState: AdminOrdersState = {
  orders: [],
  stats: null,
  pagination: null,
  loading: false,
  updating: false,
  error: null,
  filters: {},
};

// Fetch All Orders
export const fetchAllOrders = createAsyncThunk(
  'adminOrders/fetchAllOrders',
  async (params: { page?: number; limit?: number; status?: string; search?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);

      const response = await axios.get(
        `${API_BASE_URL}/admin/orders?${queryParams.toString()}`,
        { headers: getAdminAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

// Fetch Order Stats
export const fetchOrderStats = createAsyncThunk(
  'adminOrders/fetchOrderStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/orders/stats`,
        { headers: getAdminAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order stats');
    }
  }
);

// Update Order Status
export const updateOrderStatus = createAsyncThunk(
  'adminOrders/updateOrderStatus',
  async ({ orderId, status, notes, tracking }: { 
    orderId: string; 
    status: string; 
    notes?: string; 
    tracking?: any 
  }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/orders/${orderId}/status`,
        { status, notes, tracking },
        { headers: getAdminAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

const adminOrdersSlice = createSlice({
  name: 'adminOrders',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All Orders
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Order Stats
    builder
      .addCase(fetchOrderStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchOrderStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Order Status
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.updating = false;
        const orderIndex = state.orders.findIndex(order => order._id === action.payload._id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearFilters, clearError } = adminOrdersSlice.actions;
export default adminOrdersSlice.reducer;
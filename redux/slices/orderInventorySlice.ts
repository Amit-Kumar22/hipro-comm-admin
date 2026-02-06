/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL, getAdminAuthHeaders } from '../config/api.config';

/**
 * Order Management Types for Inventory Sync
 */
export interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    sku: string;
  };
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface OrderInventoryState {
  recentOrders: Order[];
  stockAffectingOrders: Order[];
  loading: boolean;
  error: string | null;
  lastSyncTime: string | null;
}

const initialState: OrderInventoryState = {
  recentOrders: [],
  stockAffectingOrders: [],
  loading: false,
  error: null,
  lastSyncTime: null,
};

// Get Recent Orders that affect inventory
export const getOrdersForInventorySync = createAsyncThunk(
  'orderInventory/getOrdersForInventorySync',
  async (params: {
    since?: string;
    status?: string[];
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.since) queryParams.append('since', params.since);
      if (params.status?.length) {
        params.status.forEach(status => queryParams.append('status', status));
      }
      
      queryParams.append('limit', '50');
      queryParams.append('sortBy', 'updatedAt');
      queryParams.append('sortOrder', 'desc');

      const response = await axios.get(
        `${API_BASE_URL}/admin/orders?${queryParams.toString()}`,
        { headers: getAdminAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      const errorResponse = {
        message: error.response?.data?.error || error.response?.data?.message || 'Failed to fetch orders',
        details: error.response?.data?.details || null
      };
      return rejectWithValue(errorResponse);
    }
  }
);

// Process Order Status Change for Inventory Update
export const processOrderInventoryUpdate = createAsyncThunk(
  'orderInventory/processOrderInventoryUpdate',
  async (order: Order, { rejectWithValue }) => {
    try {
      // Calculate inventory adjustments based on order status
      const inventoryUpdates = [];
      
      for (const item of order.items) {
        let adjustment = 0;
        let reason = '';
        
        switch (order.status) {
          case 'confirmed':
          case 'processing':
            // Reserve stock when order is confirmed
            adjustment = -item.quantity;
            reason = `Order ${order.orderNumber} confirmed - Stock reserved`;
            break;
          case 'delivered':
            // No additional adjustment needed if already reserved
            continue;
          case 'cancelled':
            // Return stock to available if order was previously confirmed
            adjustment = item.quantity;
            reason = `Order ${order.orderNumber} cancelled - Stock returned`;
            break;
          default:
            continue;
        }
        
        if (adjustment !== 0) {
          inventoryUpdates.push({
            productId: item.product._id,
            sku: item.product.sku,
            adjustment,
            reason,
            orderId: order._id,
            orderNumber: order.orderNumber
          });
        }
      }
      
      return {
        orderId: order._id,
        updates: inventoryUpdates,
        orderStatus: order.status
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to process order inventory update');
    }
  }
);

// Sync Orders with Inventory (to be called periodically)
export const syncOrdersWithInventory = createAsyncThunk(
  'orderInventory/syncOrdersWithInventory',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const lastSync = state.orderInventory.lastSyncTime;
      
      // Get orders since last sync or last hour
      const since = lastSync || new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const ordersResult = await dispatch(getOrdersForInventorySync({
        since,
        status: ['confirmed', 'processing', 'delivered', 'cancelled']
      })).unwrap();
      
      const orders = ordersResult.orders || ordersResult;
      const processedOrders = [];
      
      for (const order of orders) {
        try {
          const result = await dispatch(processOrderInventoryUpdate(order)).unwrap();
          processedOrders.push(result);
        } catch (error) {
          console.warn(`Failed to process order ${order._id}:`, error);
        }
      }
      
      return {
        processedOrders,
        syncTime: new Date().toISOString(),
        totalOrders: orders.length
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sync orders with inventory');
    }
  }
);

const orderInventorySlice = createSlice({
  name: 'orderInventory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    markOrderProcessed: (state, action) => {
      const orderId = action.payload;
      state.stockAffectingOrders = state.stockAffectingOrders.filter(
        order => order._id !== orderId
      );
    },
    resetOrderInventory: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Get Orders for Inventory Sync
      .addCase(getOrdersForInventorySync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrdersForInventorySync.fulfilled, (state, action) => {
        state.loading = false;
        const orders = action.payload.orders || action.payload;
        state.recentOrders = orders;
        state.stockAffectingOrders = orders.filter((order: Order) => 
          ['confirmed', 'processing', 'delivered', 'cancelled'].includes(order.status)
        );
      })
      .addCase(getOrdersForInventorySync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Process Order Inventory Update
      .addCase(processOrderInventoryUpdate.fulfilled, (state, action) => {
        // Mark this order as processed for inventory
        const orderId = action.payload.orderId;
        state.stockAffectingOrders = state.stockAffectingOrders.filter(
          order => order._id !== orderId
        );
      })

      // Sync Orders with Inventory
      .addCase(syncOrdersWithInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncOrdersWithInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.lastSyncTime = action.payload.syncTime;
      })
      .addCase(syncOrdersWithInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  markOrderProcessed, 
  resetOrderInventory 
} = orderInventorySlice.actions;

export default orderInventorySlice.reducer;
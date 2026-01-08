/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL, getAdminAuthHeaders } from '../config/api.config';

/**
 * Inventory Management Types
 */
export interface InventoryItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    sku: string;
    price: {
      original: number;
      selling: number;
    };
    images: Array<{
      url: string;
      alt: string;
      isPrimary: boolean;
    }>;
  };
  sku: string;
  quantityAvailable: number;
  quantityReserved: number;
  quantityLocked: number;
  reorderLevel: number;
  maxStockLevel: number;
  location: {
    warehouse: string;
    section: string;
    shelf: string;
  };
  supplier: {
    name: string;
    contact: string;
    leadTime: number;
  };
  lastRestocked: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Virtual properties
  totalStock: number;
  availableForSale: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export interface InventoryStats {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  averageStockLevel: number;
}

interface InventoryState {
  items: InventoryItem[];
  currentItem: InventoryItem | null;
  lowStockItems: InventoryItem[];
  stats: InventoryStats | null;
  loading: boolean;
  error: string | null;
  syncStatus: {
    lastSyncTime?: string;
    message?: string;
  } | null;
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
  filters: {
    search: string;
    lowStock: boolean;
    outOfStock: boolean;
    sortBy: 'createdAt' | 'quantityAvailable' | 'product.name';
    sortOrder: 'asc' | 'desc';
  };
}

const initialState: InventoryState = {
  items: [],
  currentItem: null,
  lowStockItems: [],
  stats: null,
  loading: false,
  error: null,
  syncStatus: null,
  pagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    hasNext: false,
    hasPrev: false,
    limit: 10,
  },
  filters: {
    search: '',
    lowStock: false,
    outOfStock: false,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
};

// Get Inventory Items
export const getInventory = createAsyncThunk(
  'inventory/getInventory',
  async (params: {
    page?: number;
    limit?: number;
    search?: string;
    lowStock?: boolean;
    outOfStock?: boolean;
    sortBy?: 'createdAt' | 'quantityAvailable' | 'product.name';
    sortOrder?: 'asc' | 'desc';
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.lowStock !== undefined) queryParams.append('lowStock', params.lowStock.toString());
      if (params.outOfStock !== undefined) queryParams.append('outOfStock', params.outOfStock.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await axios.get(
        `${API_BASE_URL}/inventory?${queryParams.toString()}`,
        { headers: getAdminAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      const errorResponse = {
        message: error.response?.data?.error || error.response?.data?.message || 'Failed to fetch inventory',
        details: error.response?.data?.details || null
      };
      return rejectWithValue(errorResponse);
    }
  }
);

// Get Single Inventory Item
export const getInventoryItem = createAsyncThunk(
  'inventory/getInventoryItem',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/inventory/${itemId}`,
        { headers: getAdminAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      const errorResponse = {
        message: error.response?.data?.error || error.response?.data?.message || 'Failed to fetch inventory item',
        details: error.response?.data?.details || null
      };
      return rejectWithValue(errorResponse);
    }
  }
);

// Update Inventory Item
export const updateInventory = createAsyncThunk(
  'inventory/updateInventory',
  async ({ itemId, itemData }: { 
    itemId: string; 
    itemData: any 
  }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/inventory/${itemId}`,
        itemData,
        { headers: getAdminAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      const errorResponse = {
        message: error.response?.data?.error || error.response?.data?.message || 'Failed to update inventory',
        details: error.response?.data?.details || null
      };
      return rejectWithValue(errorResponse);
    }
  }
);

// Adjust Stock
export const adjustStock = createAsyncThunk(
  'inventory/adjustStock',
  async ({ itemId, adjustment, reason, notes }: {
    itemId: string;
    adjustment: number;
    reason: string;
    notes?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/inventory/${itemId}/adjust`,
        { adjustment, reason, notes },
        { headers: getAdminAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      const errorResponse = {
        message: error.response?.data?.error || error.response?.data?.message || 'Failed to adjust stock',
        details: error.response?.data?.details || null
      };
      return rejectWithValue(errorResponse);
    }
  }
);

// Get Low Stock Items
export const getLowStockItems = createAsyncThunk(
  'inventory/getLowStockItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/inventory/low-stock`,
        { headers: getAdminAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      const errorResponse = {
        message: error.response?.data?.error || error.response?.data?.message || 'Failed to fetch low stock items',
        details: error.response?.data?.details || null
      };
      return rejectWithValue(errorResponse);
    }
  }
);

// Get Inventory Stats
export const getInventoryStats = createAsyncThunk(
  'inventory/getInventoryStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/inventory/stats`,
        { headers: getAdminAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      const errorResponse = {
        message: error.response?.data?.error || error.response?.data?.message || 'Failed to fetch inventory stats',
        details: error.response?.data?.details || null
      };
      return rejectWithValue(errorResponse);
    }
  }
);

// Bulk Update Inventory
export const bulkUpdateInventory = createAsyncThunk(
  'inventory/bulkUpdateInventory',
  async (updates: Array<{ id: string; [key: string]: any }>, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/inventory/bulk-update`,
        { updates },
        { headers: getAdminAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      const errorResponse = {
        message: error.response?.data?.error || error.response?.data?.message || 'Failed to bulk update inventory',
        details: error.response?.data?.details || null
      };
      return rejectWithValue(errorResponse);
    }
  }
);

// Sync Inventory with Product Stock Levels
export const syncInventory = createAsyncThunk(
  'inventory/syncInventory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/inventory/sync`,
        {},
        { headers: getAdminAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      const errorResponse = {
        message: error.response?.data?.error || error.response?.data?.message || 'Failed to sync inventory',
        details: error.response?.data?.details || null
      };
      return rejectWithValue(errorResponse);
    }
  }
);

// Auto-sync stock based on orders
export const autoSyncStockFromOrders = createAsyncThunk(
  'inventory/autoSyncStockFromOrders',
  async (orderUpdates: Array<{
    productId: string;
    sku: string;
    adjustment: number;
    reason: string;
    orderId: string;
    orderNumber: string;
  }>, { dispatch, rejectWithValue }) => {
    try {
      const results = [];
      
      // Get all inventory items to find IDs by product ID
      const inventoryResponse = await axios.get(
        `${API_BASE_URL}/inventory?limit=1000`,
        { headers: getAdminAuthHeaders() }
      );
      
      const inventoryItems = inventoryResponse.data.data.inventory || inventoryResponse.data.data;
      
      for (const update of orderUpdates) {
        try {
          // Find inventory item by product ID
          const inventoryItem = inventoryItems.find((item: any) => 
            item.product._id === update.productId || 
            item.product === update.productId
          );
          
          if (inventoryItem) {
            // Adjust stock for this item
            const adjustResult = await dispatch(adjustStock({
              itemId: inventoryItem._id,
              adjustment: update.adjustment,
              reason: update.reason,
              notes: `Auto-sync from order ${update.orderNumber} (${update.orderId})`
            })).unwrap();
            
            results.push({
              productId: update.productId,
              sku: update.sku,
              success: true,
              adjustment: update.adjustment,
              data: adjustResult.data
            });
          } else {
            results.push({
              productId: update.productId,
              sku: update.sku,
              success: false,
              error: 'Inventory item not found'
            });
          }
        } catch (error: any) {
          results.push({
            productId: update.productId,
            sku: update.sku,
            success: false,
            error: error.message || 'Failed to adjust stock'
          });
        }
      }
      
      return results;
    } catch (error: any) {
      const errorResponse = {
        message: error.response?.data?.error || error.response?.data?.message || 'Failed to auto-sync stock from orders',
        details: error.response?.data?.details || null
      };
      return rejectWithValue(errorResponse);
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentItem: (state) => {
      state.currentItem = null;
    },
    resetInventory: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Get Inventory
      .addCase(getInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.inventory;
        state.pagination = action.payload.pagination;
      })
      .addCase(getInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get Inventory Item
      .addCase(getInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload;
      })
      .addCase(getInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Inventory
      .addCase(updateInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInventory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentItem?._id === action.payload._id) {
          state.currentItem = action.payload;
        }
      })
      .addCase(updateInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Adjust Stock
      .addCase(adjustStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adjustStock.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item._id === action.payload.data._id);
        if (index !== -1) {
          state.items[index] = action.payload.data;
        }
        if (state.currentItem?._id === action.payload.data._id) {
          state.currentItem = action.payload.data;
        }
      })
      .addCase(adjustStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get Low Stock Items
      .addCase(getLowStockItems.fulfilled, (state, action) => {
        state.lowStockItems = action.payload;
      })

      // Get Inventory Stats
      .addCase(getInventoryStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      // Bulk Update Inventory
      .addCase(bulkUpdateInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUpdateInventory.fulfilled, (state, action) => {
        state.loading = false;
        // Update items based on bulk update results
        action.payload.forEach((result: any) => {
          if (result.success) {
            const index = state.items.findIndex(item => item._id === result.id);
            if (index !== -1) {
              state.items[index] = result.data;
            }
          }
        });
      })
      .addCase(bulkUpdateInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Sync Inventory
      .addCase(syncInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncInventory.fulfilled, (state, action) => {
        state.loading = false;
        // Successfully synced - refresh the inventory list
        state.syncStatus = {
          lastSyncTime: new Date().toISOString(),
          message: action.payload?.message || 'Inventory synced successfully'
        };
      })
      .addCase(syncInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Auto-sync Stock from Orders
      .addCase(autoSyncStockFromOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(autoSyncStockFromOrders.fulfilled, (state, action) => {
        state.loading = false;
        // The individual adjustStock calls within autoSyncStockFromOrders
        // will trigger their own state updates
      })
      .addCase(autoSyncStockFromOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  setFilters, 
  clearCurrentItem, 
  resetInventory 
} = inventorySlice.actions;

export default inventorySlice.reducer;
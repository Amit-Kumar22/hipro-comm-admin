import { configureStore } from '@reduxjs/toolkit';
import adminAuthReducer from './slices/adminAuthSlice';
import adminProductsReducer from './slices/adminProductsSlice';
import adminCategoriesReducer from './slices/adminCategoriesSlice';
import inventoryReducer from './slices/inventorySlice';
import orderInventoryReducer from './slices/orderInventorySlice';
import adminOrdersReducer from './slices/adminOrdersSlice';
import adminReducer from './slices/adminSlice';
import paymentVerificationReducer from './slices/paymentVerificationSlice';

// Import RTK Query API for immediate updates
import { adminProductsApi } from './api/adminProductsApi';

export const store = configureStore({
  reducer: {
    adminAuth: adminAuthReducer,
    adminProducts: adminProductsReducer,
    adminCategories: adminCategoriesReducer,
    inventory: inventoryReducer,
    orderInventory: orderInventoryReducer,
    adminOrders: adminOrdersReducer,
    admin: adminReducer,
    paymentVerification: paymentVerificationReducer,
    
    // Add RTK Query API reducer for automatic cache management
    [adminProductsApi.reducerPath]: adminProductsApi.reducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    })
    // Add RTK Query middleware for automatic cache invalidation
    .concat(adminProductsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
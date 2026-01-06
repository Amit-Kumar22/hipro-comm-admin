import { configureStore } from '@reduxjs/toolkit';
import adminAuthReducer from './slices/adminAuthSlice';
import adminProductsReducer from './slices/adminProductsSlice';
import adminCategoriesReducer from './slices/adminCategoriesSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    adminAuth: adminAuthReducer,
    adminProducts: adminProductsReducer,
    adminCategories: adminCategoriesReducer,
    admin: adminReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
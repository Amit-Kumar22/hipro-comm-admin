import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, getAdminAuthHeaders } from '../config/api.config';

// Define the RTK Query API for immediate cache invalidation
export const adminProductsApi = createApi({
  reducerPath: 'adminProductsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const authHeaders = getAdminAuthHeaders();
      Object.entries(authHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
      return headers;
    },
  }),
  tagTypes: ['AdminProduct', 'AdminProductList', 'DeletedProduct', 'Inventory'],
  endpoints: (builder) => ({
    // GET: Admin Products with automatic caching
    getAdminProducts: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.size) queryParams.append('size', params.size.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        if (params.search) queryParams.append('search', params.search);
        if (params.category) queryParams.append('category', params.category);
        if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
        if (params.isFeatured !== undefined) queryParams.append('isFeatured', params.isFeatured.toString());

        return `/products?${queryParams.toString()}`;
      },
      providesTags: (result) => [
        { type: 'AdminProductList', id: 'LIST' },
        ...(result?.data || []).map((product: any) => ({ 
          type: 'AdminProduct' as const, 
          id: product._id 
        })),
      ],
      // Transform response to match existing Redux structure
      transformResponse: (response: any) => ({
        data: response.data || [],
        pageable: response.pageable || {},
        success: response.success || false
      })
    }),

    // GET: Single Admin Product
    getAdminProduct: builder.query({
      query: (productId) => `/products/${productId}`,
      providesTags: (result, error, id) => [
        { type: 'AdminProduct', id }
      ],
    }),

    // POST: Create Admin Product with IMMEDIATE UI update
    createAdminProduct: builder.mutation({
      query: (productData) => ({
        url: '/products',
        method: 'POST',
        body: productData,
      }),
      // IMMEDIATE invalidation - forces UI refresh
      invalidatesTags: [
        { type: 'AdminProductList', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' }
      ],
      // Optimistic update for instant UI feedback
      async onQueryStarted(productData, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('✅ Product created successfully - UI will update automatically');
          
          // Optional: Update other related queries
          dispatch(
            adminProductsApi.util.invalidateTags([
              { type: 'AdminProductList', id: 'LIST' }
            ])
          );
        } catch (error) {
          console.error('❌ Product creation failed:', error);
        }
      },
    }),

    // PUT: Update Admin Product with IMMEDIATE UI update
    updateAdminProduct: builder.mutation({
      query: ({ productId, productData }) => ({
        url: `/products/${productId}`,
        method: 'PUT',
        body: productData,
      }),
      // ENHANCED invalidation - invalidate ALL related cache
      invalidatesTags: (result, error, { productId }) => [
        { type: 'AdminProduct', id: productId },
        { type: 'AdminProductList', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' },
        // Also invalidate any cached queries
        'AdminProduct',
        'AdminProductList'
      ],
      // FORCE cache refresh
      async onQueryStarted({ productId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('✅ Product updated successfully - FORCING cache refresh');
          
          // FORCE invalidate ALL product-related cache
          dispatch(
            adminProductsApi.util.invalidateTags([
              'AdminProduct',
              'AdminProductList',
              { type: 'AdminProductList', id: 'LIST' }
            ])
          );
          
          // FORCE refetch of the products list
          dispatch(adminProductsApi.util.updateQueryData(
            'getAdminProducts', 
            undefined, 
            (draft: any) => {
              // This will trigger a refetch
              return draft;
            }
          ));
          
        } catch (error) {
          console.error('❌ Product update failed:', error);
        }
      },
    }),

    // DELETE: Delete Admin Product with IMMEDIATE UI update (SOFT DELETE)
    deleteAdminProduct: builder.mutation({
      query: (productId) => ({
        url: `/products/${productId}`,  // No ?permanent=true, so it's SOFT DELETE
        method: 'DELETE',
      }),
      // IMMEDIATE invalidation for instant UI update
      invalidatesTags: [
        { type: 'AdminProductList', id: 'LIST' },
        { type: 'DeletedProduct', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' }
      ],
      // Optimistic update for immediate feedback
      async onQueryStarted(productId, { dispatch, queryFulfilled, getState }) {
        // Pessimistic update - wait for success then invalidate
        try {
          const { data } = await queryFulfilled;
          
          console.log('� Product SOFT DELETE response:', data);
          
          if (data.data.action === 'soft_delete') {
            console.log('✅ Product moved to Delete History - UI will update immediately');
          }
          
          // Force immediate cache refresh
          dispatch(
            adminProductsApi.util.invalidateTags([
              { type: 'AdminProductList', id: 'LIST' },
              { type: 'DeletedProduct', id: 'LIST' }
            ])
          );
          
        } catch (error) {
          console.error('❌ Product soft deletion failed:', error);
        }
      },
    }),

    // GET: Deleted Products for Delete History page
    getDeletedProducts: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        
        return `/products/deleted?${queryParams.toString()}`;
      },
      providesTags: (result) => [
        { type: 'DeletedProduct', id: 'LIST' },
        ...(result?.data?.products || []).map((product: any) => ({ 
          type: 'DeletedProduct' as const, 
          id: product._id 
        })),
      ],
      // Transform response
      transformResponse: (response: any) => ({
        data: response.data?.products || [],
        pagination: response.data?.pagination || {},
        success: response.success || false
      })
    }),

    // DELETE: Permanently delete product from Delete History
    permanentDeleteProduct: builder.mutation({
      query: (productId) => ({
        url: `/products/${productId}?permanent=true`,  // permanent=true for HARD DELETE
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'DeletedProduct', id: 'LIST' }
      ],
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          console.log('🗑️ Product PERMANENT DELETE response:', data);
          
          if (data.data.deletedPermanently) {
            console.log('✅ Product PERMANENTLY deleted - removed forever');
          }
          
          // Force immediate cache refresh
          dispatch(
            adminProductsApi.util.invalidateTags([
              { type: 'DeletedProduct', id: 'LIST' }
            ])
          );
          
        } catch (error) {
          console.error('❌ Permanent delete failed:', error);
        }
      },
    }),

    // POST: Restore product from Delete History
    restoreProduct: builder.mutation({
      query: (productId) => ({
        url: `/products/${productId}/restore`,
        method: 'POST',
      }),
      invalidatesTags: [
        { type: 'AdminProductList', id: 'LIST' },
        { type: 'DeletedProduct', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' }
      ],
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          console.log('♻️ Product RESTORE response:', data);
          
          if (data.data.restored) {
            console.log('✅ Product restored - back to active products');
          }
          
          // Force immediate cache refresh
          dispatch(
            adminProductsApi.util.invalidateTags([
              { type: 'AdminProductList', id: 'LIST' },
              { type: 'DeletedProduct', id: 'LIST' }
            ])
          );
          
        } catch (error) {
          console.error('❌ Product restore failed:', error);
        }
      },
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetAdminProductsQuery,
  useGetAdminProductQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useDeleteAdminProductMutation,
  useGetDeletedProductsQuery,
  usePermanentDeleteProductMutation,
  useRestoreProductMutation,
} = adminProductsApi;
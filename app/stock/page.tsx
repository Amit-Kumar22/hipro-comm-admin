'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  getInventory, 
  getInventoryStats,
  getLowStockItems,
  adjustStock,
  updateInventory,
  setFilters,
  clearError,
  syncInventory
} from '@/redux/slices/inventorySlice';
import { useToast } from '@/components/providers/ToastProvider';
import StockSyncStatus from '@/components/inventory/StockSyncStatus';
import StockAdjustmentModal from '@/components/modals/StockAdjustmentModal';
import InventoryEditModal from '@/components/modals/InventoryEditModal';

// Debounce hook
function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function StockPage() {
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useToast();
  const { 
    items, 
    stats, 
    loading, 
    error, 
    pagination, 
    filters,
    syncStatus 
  } = useAppSelector((state) => state.inventory);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [localFilters, setLocalFilters] = useState(filters);

  // Debounce search term and filters to reduce API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedFilters = useDebounce(localFilters, 300);

  // Initial load - only call once when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await dispatch(getInventory({}));
        await dispatch(getInventoryStats());
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, [dispatch]);

  // Handle debounced search and filters
  useEffect(() => {
    if (debouncedSearchTerm !== '' || Object.keys(debouncedFilters).length > 0) {
      const searchFilters = {
        ...debouncedFilters,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      };
      
      dispatch(setFilters(searchFilters));
      dispatch(getInventory({ ...searchFilters, page: 1 }));
    }
  }, [debouncedSearchTerm, debouncedFilters, dispatch]);

  // Error handling with improved logic
  useEffect(() => {
    if (error) {
      let errorMessage = 'An error occurred';
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        if ('message' in error) {
          errorMessage = (error as any).message;
        } else if ('error' in error) {
          errorMessage = (error as any).error;
        }
      }
      
      // Handle rate limit error specifically
      if (errorMessage.includes('Too many requests')) {
        showError('Rate limit exceeded. Please wait a moment before trying again.');
      } else {
        showError(errorMessage);
      }
      
      dispatch(clearError());
    }
  }, [error, showError, dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The actual search is handled by the debounced effect
    // This just prevents form submission
  };

  const handleFilterChange = useCallback((filterName: string, value: any) => {
    setLocalFilters(prev => ({ ...prev, [filterName]: value }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    dispatch(getInventory({ ...filters, page }));
  }, [dispatch, filters]);

  // Throttled manual sync to prevent spam clicking
  const handleManualSync = useCallback(async () => {
    if (loading) return; // Prevent multiple simultaneous syncs
    
    try {
      await dispatch(syncInventory()).unwrap();
      showSuccess('Inventory sync completed successfully!');
      
      // Refresh data after successful sync
      setTimeout(() => {
        Promise.all([
          dispatch(getInventory({ ...filters })),
          dispatch(getInventoryStats())
        ]).catch(error => {
          console.error('Failed to refresh after sync:', error);
        });
      }, 1000);
    } catch (error: any) {
      const errorMessage = error?.message || 'Inventory sync failed';
      if (errorMessage.includes('Too many requests')) {
        showError('Rate limit exceeded. Please wait before syncing again.');
      } else {
        showError(`Inventory sync failed: ${errorMessage}`);
      }
    }
  }, [dispatch, filters, showSuccess, showError, loading]);

  const openAdjustmentModal = useCallback((item: any) => {
    setSelectedItem(item);
    setIsAdjustmentModalOpen(true);
  }, []);

  const openEditModal = useCallback((item: any) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  }, []);

  const handleStockAdjustment = useCallback(async (adjustment: number, reason: string, notes?: string) => {
    if (!selectedItem) return;
    
    try {
      await dispatch(adjustStock({
        itemId: selectedItem._id,
        adjustment,
        reason,
        notes
      })).unwrap();
      
      showSuccess(`Stock ${adjustment > 0 ? 'increased' : 'decreased'} by ${Math.abs(adjustment)} units`);
      setIsAdjustmentModalOpen(false);
      setSelectedItem(null);
      
      // Only refresh current page data to avoid excessive API calls
      setTimeout(() => {
        dispatch(getInventory({ ...filters, page: pagination?.currentPage || 1 }));
      }, 500);
      
    } catch (error: any) {
      let errorMessage = 'Failed to adjust stock';
      
      if (error?.details && Array.isArray(error.details)) {
        errorMessage = error.details.map((d: any) => `${d.field}: ${d.message}`).join(', ');
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      if (errorMessage.includes('Too many requests')) {
        showError('Rate limit exceeded. Please wait before making changes.');
      } else {
        showError(errorMessage);
      }
    }
  }, [selectedItem, dispatch, showSuccess, showError, filters, pagination]);

  const handleInventoryUpdate = useCallback(async (itemData: any) => {
    if (!selectedItem) return;
    
    try {
      await dispatch(updateInventory({
        itemId: selectedItem._id,
        itemData
      })).unwrap();
      
      showSuccess('Inventory updated successfully');
      setIsEditModalOpen(false);
      setSelectedItem(null);
      
      // Only refresh current page data to avoid excessive API calls
      setTimeout(() => {
        dispatch(getInventory({ ...filters, page: pagination?.currentPage || 1 }));
      }, 500);
      
    } catch (error: any) {
      let errorMessage = 'Failed to update inventory';
      
      if (error?.details && Array.isArray(error.details)) {
        errorMessage = error.details.map((d: any) => `${d.field}: ${d.message}`).join(', ');
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      if (errorMessage.includes('Too many requests')) {
        showError('Rate limit exceeded. Please wait before making changes.');
      } else {
        showError(errorMessage);
      }
    }
  }, [selectedItem, dispatch, showSuccess, showError, filters, pagination]);

  // Throttled low stock items function
  const handleGetLowStockItems = useCallback(async () => {
    try {
      await dispatch(getLowStockItems());
      showSuccess('Low stock items loaded successfully');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to load low stock items';
      if (errorMessage.includes('Too many requests')) {
        showError('Rate limit exceeded. Please wait before trying again.');
      } else {
        showError(errorMessage);
      }
    }
  }, [dispatch, showSuccess, showError]);

  const getStockStatus = (item: any) => {
    if (item.isOutOfStock) {
      return { text: 'Out of Stock', className: 'bg-red-100 text-red-800' };
    } else if (item.isLowStock) {
      return { text: 'Low Stock', className: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: 'In Stock', className: 'bg-green-100 text-green-800' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
          <div className="flex items-center space-x-6 mt-2">
            <p className="text-sm text-gray-600">Manage inventory levels and stock adjustments</p>
            <StockSyncStatus />
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleManualSync}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Syncing...' : 'Sync Inventory'}
          </button>
          <button
            onClick={handleGetLowStockItems}
            disabled={loading}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm disabled:opacity-50"
          >
            View Low Stock Items
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-xs font-medium text-gray-500">Total Products</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-xs font-medium text-gray-500">Total Stock</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalStock.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-xs font-medium text-gray-500">Avg Stock Level</h3>
            <p className="text-2xl font-bold text-gray-900">{Math.round(stats.averageStockLevel)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-xs font-medium text-gray-500">Low Stock</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-xs font-medium text-gray-500">Out of Stock</h3>
            <p className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-xs font-medium text-gray-500">Total Value</h3>
            <p className="text-2xl font-bold text-green-600">₹{stats.totalValue.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Search and Filters - Optimized with debouncing */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by name or SKU... (auto-search after typing)"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm disabled:opacity-50"
            >
              Search
            </button>
          </form>
          
          <div className="flex gap-2">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={localFilters.lowStock || false}
                onChange={(e) => handleFilterChange('lowStock', e.target.checked)}
                className="mr-2 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              Low Stock Only
            </label>
            
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={localFilters.outOfStock || false}
                onChange={(e) => handleFilterChange('outOfStock', e.target.checked)}
                className="mr-2 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              Out of Stock Only
            </label>
          </div>
        </div>
        
        {/* Search indicator */}
        {searchTerm !== debouncedSearchTerm && (
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            <div className="animate-pulse w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
            Searching...
          </div>
        )}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading inventory...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No inventory items found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Reserved</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Level</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          {item.product.images?.[0] && (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                            <p className="text-xs text-gray-500">₹{item.product.price.selling}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{item.sku}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{item.quantityAvailable}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{item.quantityReserved}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{item.reorderLevel}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">
                        {item.location.warehouse} - {item.location.section}{item.location.shelf}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openAdjustmentModal(item)}
                            className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded transition-colors"
                          >
                            Adjust
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {(pagination.currentPage - 1) * pagination.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{pagination.totalCount}</span>{' '}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    ←
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pagination.currentPage
                            ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    →
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <StockAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => {
          setIsAdjustmentModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onAdjust={handleStockAdjustment}
      />

      <InventoryEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onSave={handleInventoryUpdate}
      />
    </div>
  );
}
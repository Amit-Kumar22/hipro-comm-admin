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
import { 
  Package2, 
  Search, 
  Filter, 
  RefreshCw, 
  TrendingDown, 
  AlertTriangle,
  Zap,
  Edit3, 
  Settings,
  Eye,
  DollarSign,
  BarChart3,
  Archive,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Upload,
  Plus,
  Minus,
  Activity
} from 'lucide-react';

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
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

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

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item._id));
    }
  };

  const getStockStatus = (item: any) => {
    if (item.isOutOfStock) {
      return { 
        text: 'Out of Stock', 
        className: 'bg-red-50 text-red-700 border border-red-200 ring-1 ring-red-200', 
        icon: <XCircle className="h-3 w-3 mr-1" /> 
      };
    } else if (item.isLowStock) {
      return { 
        text: 'Low Stock', 
        className: 'bg-amber-50 text-amber-700 border border-amber-200 ring-1 ring-amber-200', 
        icon: <AlertTriangle className="h-3 w-3 mr-1" /> 
      };
    } else {
      return { 
        text: 'In Stock', 
        className: 'bg-emerald-50 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-200', 
        icon: <CheckCircle className="h-3 w-3 mr-1" /> 
      };
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-6">
            <AlertCircle className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">Error Loading Stock</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-slate-500 to-blue-500 hover:from-slate-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Professional Header with Enhanced Design */}
      <div className="bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 rounded-2xl shadow-xl shadow-gray-500/30 p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              📦 Stock Management
            </h1>
            <div className="flex items-center space-x-6 mt-3">
              <p className="text-gray-100 text-base">Comprehensive inventory control and tracking</p>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                <StockSyncStatus />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-3 lg:mt-0">
            <button
              onClick={handleManualSync}
              disabled={loading}
              className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 disabled:opacity-50 text-sm"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="font-medium">{loading ? 'Syncing...' : 'Sync Inventory'}</span>
            </button>
            <button
              onClick={handleGetLowStockItems}
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-2 rounded-lg hover:from-amber-500 hover:to-amber-600 transition-all duration-300 shadow-lg text-sm font-medium"
            >
              <TrendingDown className="h-4 w-4" />
              <span>Low Stock</span>
            </button>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-slate-400 to-slate-500 px-3 py-2 rounded-lg hover:from-slate-500 hover:to-slate-600 transition-all duration-300 shadow-lg text-sm font-medium">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg shadow-xl shadow-slate-500/20 border-2 border-slate-200/50 p-3 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gradient-to-r from-slate-500 to-slate-600 text-white p-2 rounded-lg shadow-lg shadow-slate-500/30">
                <Package2 className="h-4 w-4" />
              </div>
              <span className="text-base">📦</span>
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent">
              {stats.totalProducts.toLocaleString()}
            </h3>
            <p className="text-slate-600 font-semibold text-xs">Total Products</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-xl shadow-green-500/20 border-2 border-green-200/50 p-3 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-2 rounded-lg shadow-lg shadow-green-500/30">
                <BarChart3 className="h-4 w-4" />
              </div>
              <span className="text-base">📊</span>
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {stats.totalStock.toLocaleString()}
            </h3>
            <p className="text-green-600 font-semibold text-xs">Total Stock</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-xl shadow-purple-500/20 border-2 border-purple-200/50 p-3 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-lg shadow-lg shadow-purple-500/30">
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-base">📈</span>
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {Math.round(stats.averageStockLevel)}
            </h3>
            <p className="text-purple-600 font-semibold text-xs">Avg Level</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg shadow-xl shadow-amber-500/20 border-2 border-amber-200/50 p-3 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-2 rounded-lg shadow-lg shadow-amber-500/30">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <span className="text-base">⚠️</span>
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {stats.lowStockItems}
            </h3>
            <p className="text-amber-600 font-semibold text-xs">Low Stock</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg shadow-xl shadow-red-500/20 border-2 border-red-200/50 p-3 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-2 rounded-lg shadow-lg shadow-red-500/30">
                <XCircle className="h-4 w-4" />
              </div>
              <span className="text-base">❌</span>
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              {stats.outOfStockItems}
            </h3>
            <p className="text-red-600 font-semibold text-xs">Out of Stock</p>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg shadow-xl shadow-teal-500/20 border-2 border-teal-200/50 p-3 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-2 rounded-lg shadow-lg shadow-teal-500/30">
                <DollarSign className="h-4 w-4" />
              </div>
              <span className="text-base">💰</span>
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              ₹{(stats.totalValue / 1000).toFixed(0)}K
            </h3>
            <p className="text-teal-600 font-semibold text-xs">Total Value</p>
          </div>
        </div>
      )}

      {/* Enhanced Search and Filters */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-slate-600" />
            <h2 className="text-base font-bold text-slate-700">🔍 Search & Filter</h2>
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Enhanced Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="🔍 Search products, SKUs, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none text-sm transition-all duration-300 bg-slate-50 hover:bg-white"
                />
              </div>
            </form>
            
            {/* Enhanced Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={localFilters.sortBy || 'createdAt'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none text-sm bg-slate-50 hover:bg-white transition-all duration-300"
              >
                <option value="createdAt">📅 Sort by Date</option>
                <option value="quantityAvailable">📊 Sort by Stock</option>
                <option value="product.name">📝 Sort by Name</option>
              </select>
              
              <select
                value={localFilters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none text-sm bg-slate-50 hover:bg-white transition-all duration-300"
              >
                <option value="desc">⬇️ Descending</option>
                <option value="asc">⬆️ Ascending</option>
              </select>

              <label className="flex items-center space-x-2 px-3 py-2 border-2 border-slate-200 rounded-lg bg-slate-50 hover:bg-white hover:border-slate-300 transition-all duration-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.lowStock}
                  onChange={(e) => handleFilterChange('lowStock', e.target.checked)}
                  className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                />
                <span className="text-sm text-slate-700 font-medium">⚠️ Low Stock Only</span>
              </label>

              <label className="flex items-center space-x-2 px-3 py-2 border-2 border-slate-200 rounded-lg bg-slate-50 hover:bg-white hover:border-slate-300 transition-all duration-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.outOfStock}
                  onChange={(e) => handleFilterChange('outOfStock', e.target.checked)}
                  className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                />
                <span className="text-sm text-slate-700 font-medium">❌ Out of Stock Only</span>
              </label>
              
              <button
                onClick={() => {
                  setLocalFilters({
                    search: '',
                    lowStock: false,
                    outOfStock: false,
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                  });
                  setSearchTerm('');
                }}
                className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-slate-500 to-blue-500 text-white rounded-lg hover:from-slate-600 hover:to-blue-600 transition-all duration-300 text-sm font-medium shadow-lg"
              >
                <Filter className="h-3 w-3" />
                <span>Clear All</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stock Table */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-700">
                📦 Stock Inventory
              </h2>
              <p className="text-slate-600 text-sm">
                {selectedItems.length > 0 && `${selectedItems.length} items selected • `}
                {items.length} products • Page {pagination?.currentPage || 1} of {pagination?.totalPages || 1}
              </p>
            </div>
            {selectedItems.length > 0 && (
              <div className="flex space-x-2">
                <button className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-slate-400 to-blue-500 text-white rounded-lg hover:from-slate-500 hover:to-blue-600 transition-all duration-300 shadow-lg text-xs font-medium">
                  <Upload className="h-3 w-3" />
                  <span>Bulk Update</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-lg hover:from-green-500 hover:to-emerald-600 transition-all duration-300 shadow-lg text-xs font-medium">
                  <Download className="h-3 w-3" />
                  <span>Export Selected</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === items.length && items.length > 0}
                    onChange={selectAllItems}
                    className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">📦 Product Details</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">📊 Stock Level</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">🎯 Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">💰 Pricing</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">🕒 Last Updated</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">⚡ Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                      <div>
                        <p className="text-lg font-semibold text-gray-700">Loading stock data...</p>
                        <p className="text-sm text-gray-500">Please wait while we fetch inventory</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <Package2 className="h-16 w-16 text-gray-300" />
                      <div>
                        <p className="text-lg font-semibold text-gray-700">No stock items found</p>
                        <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr 
                      key={item._id} 
                      className={`hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all duration-300 ${
                        selectedItems.includes(item._id) ? 'bg-gradient-to-r from-slate-50 to-blue-50 border-l-4 border-slate-500' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id)}
                          onChange={() => toggleItemSelection(item._id)}
                          className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-10 w-10">
                            {item.product?.images?.[0] ? (
                              <img 
                                className="h-10 w-10 rounded-lg object-cover border-2 border-gray-200 shadow-sm" 
                                src={item.product.images[0].url} 
                                alt={item.product?.name || 'Product'} 
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center border-2 border-slate-200 shadow-lg">
                                <Package2 className="h-5 w-5 text-slate-500" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {item.product?.name || 'Unknown Product'}
                            </p>
                            <p className="text-xs text-gray-500">
                              SKU: <span className="font-mono">{item.sku}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-gray-900">{item.quantityAvailable}</span>
                          <span className="text-xs text-gray-500 font-medium">units</span>
                        </div>
                        <p className="text-xs text-gray-400">Min: {item.reorderLevel}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${status.className}`}>
                          {status.icon}
                          {status.text}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-gray-900">
                          ₹{item.product?.price?.selling?.toLocaleString() || '0'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Value: ₹{((item.product?.price?.selling || 0) * item.quantityAvailable).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">
                          {item.lastRestocked ? new Date(item.lastRestocked).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.lastRestocked ? new Date(item.lastRestocked).toLocaleTimeString() : ''}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => openAdjustmentModal(item)}
                            className="bg-gradient-to-r from-slate-400 to-blue-500 hover:from-slate-500 hover:to-blue-600 text-white p-1 rounded-lg transition-all duration-300 shadow-lg"
                            title="Adjust Stock"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white p-1 rounded-lg transition-all duration-300 shadow-lg"
                            title="Edit Item"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            className="bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 text-white p-1 rounded-lg transition-all duration-300 shadow-lg"
                            title="View Details"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-4 py-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-slate-700 font-medium">
                  📄 Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} results
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                  className="px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-lg hover:from-slate-600 hover:to-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                >
                  ⬅️ Previous
                </button>
                
                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                  const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                  if (pageNum > pagination.totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 shadow-lg ${
                        pageNum === pagination.currentPage
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                          : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 hover:from-slate-200 hover:to-slate-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                >
                  Next ➡️
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isAdjustmentModalOpen && selectedItem && (
        <StockAdjustmentModal
          item={selectedItem}
          isOpen={isAdjustmentModalOpen}
          onClose={() => {
            setIsAdjustmentModalOpen(false);
            setSelectedItem(null);
          }}
          onAdjust={handleStockAdjustment}
        />
      )}

      {isEditModalOpen && selectedItem && (
        <InventoryEditModal
          item={selectedItem}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedItem(null);
          }}
          onSave={handleInventoryUpdate}
        />
      )}
    </div>
  );
}
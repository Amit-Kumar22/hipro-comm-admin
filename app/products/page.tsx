'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  getAdminProducts, 
  deleteAdminProduct,
  setPage,
  setSize,
  setSortBy,
  setSortOrder,
  setSearch,
  setAdminProductsFilters
} from '@/redux/slices/adminProductsSlice';
import { getAdminCategories } from '@/redux/slices/adminCategoriesSlice';
import ProductModal from '@/components/modals/ProductModal';
import { 
  Package, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  MoreVertical,
  ShoppingBag,
  Tag,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Upload,
  Star,
  Archive,
  Globe
} from 'lucide-react';

export default function AdminProductsPage() {
  const dispatch = useAppDispatch();
  
  // Get standardized state from Redux
  const { 
    products, 
    loading: productsLoading, 
    error: productsError,
    page,
    size,
    totalPages,
    totalElements,
    sortBy,
    sortOrder,
    search,
    filters
  } = useAppSelector((state) => state.adminProducts);
  
  const { categories } = useAppSelector((state) => state.adminCategories);

  // Local UI state
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // Local filter state for UI (before dispatching to Redux)
  const [localSearch, setLocalSearch] = useState(search);
  const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
  const [statusFilter, setStatusFilter] = useState(
    filters.isActive === true ? 'active' :
    filters.isActive === false ? 'inactive' : 'all'
  );

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (searchTerm: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          dispatch(setSearch(searchTerm));
          dispatch(setPage(1)); // Reset to first page on search
        }, 500);
      };
    })(),
    [dispatch]
  );

  // Load data effect
  useEffect(() => {
    // Load products with current Redux state
    dispatch(getAdminProducts({
      page,
      size,
      sortBy,
      sortOrder,
      search,
      category: filters.category,
      isActive: filters.isActive,
      isFeatured: filters.isFeatured
    }));
  }, [dispatch, page, size, sortBy, sortOrder, search, filters]);

  // Load categories once
  useEffect(() => {
    dispatch(getAdminCategories({ size: 100, includeInactive: false }));
  }, [dispatch]);

  // Handle search input change
  useEffect(() => {
    debouncedSearch(localSearch);
  }, [localSearch, debouncedSearch]);

  const getCategoryName = (categoryId: string | { _id: string; name: string; slug: string } | undefined) => {
    if (!categoryId) return 'No Category';
    if (typeof categoryId === 'string') {
      const category = categories.find(c => c._id === categoryId);
      return category?.name || 'No Category';
    }
    return categoryId.name || 'No Category';
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteAdminProduct(productId)).unwrap();
        // Refresh data after deletion
        dispatch(getAdminProducts({
          page,
          size,
          sortBy,
          sortOrder,
          search,
          category: filters.category,
          isActive: filters.isActive,
          isFeatured: filters.isFeatured
        }));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleModalSuccess = () => {
    // Refresh products after modal success
    dispatch(getAdminProducts({
      page,
      size,
      sortBy,
      sortOrder,
      search,
      category: filters.category,
      isActive: filters.isActive,
      isFeatured: filters.isFeatured
    }));
  };

  const handleRefresh = () => {
    dispatch(getAdminProducts({
      page,
      size,
      sortBy,
      sortOrder,
      search,
      category: filters.category,
      isActive: filters.isActive,
      isFeatured: filters.isFeatured
    }));
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleSizeChange = (newSize: number) => {
    dispatch(setSize(newSize));
    dispatch(setPage(1)); // Reset to first page when changing size
  };

  // Sort handlers
  const handleSort = (field: 'createdAt' | 'name' | 'price') => {
    if (sortBy === field) {
      // Toggle sort order if same field
      dispatch(setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      // New field, default to desc
      dispatch(setSortBy(field));
      dispatch(setSortOrder('desc'));
    }
    dispatch(setPage(1)); // Reset to first page on sort change
  };

  // Filter handlers
  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    dispatch(setAdminProductsFilters({
      category: category === 'all' ? undefined : category
    }));
    dispatch(setPage(1)); // Reset to first page on filter change
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    const isActive = status === 'active' ? true : 
                    status === 'inactive' ? false : undefined;
    dispatch(setAdminProductsFilters({ isActive }));
    dispatch(setPage(1)); // Reset to first page on filter change
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === products?.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products?.map(product => product._id) || []);
    }
  };

  // Calculate stats
  const stats = {
    total: totalElements,
    active: products?.filter(p => p.isActive).length || 0,
    inactive: products?.filter(p => !p.isActive).length || 0,
    categories: [...new Set(products?.map(p => getCategoryName(p.category)))].length || 0
  };

  if (productsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Products</h3>
          <p className="text-gray-600 mb-4">
            {typeof productsError === 'string' ? productsError : 
             typeof productsError === 'object' && productsError && 'message' in productsError ? 
             (typeof (productsError as any).message === 'string' ? (productsError as any).message : 'Failed to load products') :
             'An error occurred while loading products'}
          </p>
          <button 
            onClick={handleRefresh}
            className="bg-gradient-to-r from-slate-500 to-blue-500 hover:from-slate-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 rounded-2xl shadow-xl shadow-gray-500/30 p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Products Management</h1>
            <p className="text-gray-100 text-base">Manage your product catalog and inventory</p>
          </div>
          <div className="flex items-center space-x-2 mt-3 sm:mt-0">
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="font-medium">Refresh</span>
            </button>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-slate-400 to-slate-500 px-3 py-2 rounded-lg hover:from-slate-500 hover:to-slate-600 transition-all duration-300 shadow-lg text-sm">
              <Upload className="h-4 w-4" />
              <span className="font-medium">Import</span>
            </button>
            <button
              onClick={handleAddProduct}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg text-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="font-medium">Add Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg shadow-xl shadow-slate-500/20 border-2 border-slate-200/50 p-3 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-gradient-to-r from-slate-500 to-slate-600 text-white p-2 rounded-lg shadow-lg shadow-slate-500/30">
              <Package className="h-4 w-4" />
            </div>
            <span className="text-base">📦</span>
          </div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent">
            {stats.total.toLocaleString()}
          </h3>
          <p className="text-slate-600 font-semibold text-xs">Total Products</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-xl shadow-green-500/20 border-2 border-green-200/50 p-3 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-2 rounded-lg shadow-lg shadow-green-500/30">
              <CheckCircle className="h-4 w-4" />
            </div>
            <span className="text-base">✅</span>
          </div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {stats.active.toLocaleString()}
          </h3>
          <p className="text-green-600 font-semibold text-xs">Active Products</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg shadow-xl shadow-red-500/20 border-2 border-red-200/50 p-3 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-2 rounded-lg shadow-lg shadow-red-500/30">
              <XCircle className="h-4 w-4" />
            </div>
            <span className="text-base">❌</span>
          </div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            {stats.inactive.toLocaleString()}
          </h3>
          <p className="text-red-600 font-semibold text-xs">Inactive Products</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-xl shadow-purple-500/20 border-2 border-purple-200/50 p-3 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-lg shadow-lg shadow-purple-500/30">
              <Tag className="h-4 w-4" />
            </div>
            <span className="text-base">🏷️</span>
          </div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {stats.categories.toLocaleString()}
          </h3>
          <p className="text-purple-600 font-semibold text-xs">Categories</p>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2 mb-3 sm:mb-0">
              <Filter className="h-5 w-5 text-slate-600" />
              <h2 className="text-base font-bold text-slate-700">🔍 Filters & Search</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                className="flex items-center space-x-2 bg-gradient-to-r from-slate-100 to-blue-100 text-slate-700 px-3 py-2 rounded-lg hover:from-slate-200 hover:to-blue-200 transition-all duration-300 text-sm"
              >
                {viewMode === 'table' ? <Grid3X3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
                <span className="font-medium">Grid View</span>
              </button>
              <button className="flex items-center space-x-2 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-3 py-2 rounded-lg hover:from-slate-200 hover:to-slate-300 transition-all duration-300 text-sm">
                <Download className="h-4 w-4" />
                <span className="font-medium">Export</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="📎 Search products, SKU..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-slate-50 hover:bg-white"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-slate-50 hover:bg-white"
            >
              <option value="all">🏷️ All Categories</option>
              {categories?.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-slate-50 hover:bg-white"
            >
              <option value="all">📊 All Status</option>
              <option value="active">✅ Active</option>
              <option value="inactive">❌ Inactive</option>
            </select>

            <button className="bg-gradient-to-r from-slate-500 to-blue-500 text-white px-3 py-2 rounded-lg hover:from-slate-600 hover:to-blue-600 transition-all duration-300 shadow-lg font-medium text-sm">
              🔍 Advanced Search
            </button>
          </div>

          {selectedProducts.length > 0 && (
            <div className="mt-4 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50 p-3 rounded-lg border-2 border-slate-200/50">
              <span className="text-slate-700 font-medium text-sm">
                {selectedProducts.length} product(s) selected
              </span>
              <div className="flex space-x-2">
                <button className="bg-gradient-to-r from-red-400 to-pink-500 text-white px-3 py-1 rounded-lg hover:from-red-500 hover:to-pink-600 transition-all duration-300 shadow-lg text-xs font-medium">
                  Delete Selected
                </button>
                <button className="bg-gradient-to-r from-slate-400 to-blue-500 text-white px-3 py-1 rounded-lg hover:from-slate-500 hover:to-blue-600 transition-all duration-300 shadow-lg text-xs font-medium">
                  Bulk Edit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Products Table */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-slate-600" />
              <h3 className="text-base font-bold text-slate-700">
                📦 Products Catalog ({products?.length || 0} of {totalElements})
              </h3>
            </div>
            {productsLoading && (
              <div className="flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded-lg">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-slate-600 mr-2"></div>
                <span>Loading...</span>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products?.length && products && products.length > 0}
                    onChange={selectAllProducts}
                    className="rounded border-slate-300 text-slate-600 shadow-sm focus:border-slate-300 focus:ring focus:ring-slate-200"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  📦 Product Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  🏷️ Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  💰 Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  📊 Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  ⚡ Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productsLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="animate-pulse h-3 w-3 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="animate-pulse flex items-center space-x-3">
                        <div className="h-12 w-12 bg-gray-200 rounded-md"></div>
                        <div>
                          <div className="h-3 bg-gray-200 rounded w-32 mb-1"></div>
                          <div className="h-2 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="animate-pulse h-3 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="animate-pulse h-3 bg-gray-200 rounded w-12"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="animate-pulse h-4 bg-gray-200 rounded-full w-14"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="animate-pulse flex space-x-1">
                        <div className="h-6 bg-gray-200 rounded w-12"></div>
                        <div className="h-6 bg-gray-200 rounded w-12"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : products && products.length > 0 ? (
                products.map((product: any) => (
                  <tr key={product._id} className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all duration-300">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => toggleProductSelection(product._id)}
                        className="rounded border-slate-300 text-slate-600 shadow-sm focus:border-slate-300 focus:ring focus:ring-slate-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        {product.images?.[0] ? (
                          <img 
                            src={product.images[0].url} 
                            alt={product.name}
                            className="h-12 w-12 rounded-md object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gradient-to-br from-slate-100 to-blue-100 rounded-lg flex items-center justify-center text-lg border-2 border-slate-200 shadow-lg">
                            📦
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center space-x-1">
                            <Tag className="h-3 w-3" />
                            <span>SKU: {product.sku}</span>
                          </div>
                          {product.description && (
                            <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                        {getCategoryName(product.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          ₹{product.price?.selling?.toLocaleString() || 0}
                        </span>
                      </div>
                      {product.price?.original && product.price?.selling && product.price.original > product.price.selling && (
                        <div className="text-xs text-gray-500 line-through">
                          MRP: ₹{product.price?.original?.toLocaleString() || 0}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border ${
                        product.isActive 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {product.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="bg-gradient-to-r from-slate-400 to-blue-500 hover:from-slate-500 hover:to-blue-600 text-white p-1 rounded-lg transition-all duration-300 shadow-lg"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button className="bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 text-white p-1 rounded-lg transition-all duration-300 shadow-lg">
                          <Eye className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white p-1 rounded-lg transition-all duration-300 shadow-lg"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="text-gray-400 mb-3">
                      <Package className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No products found</h3>
                    <p className="text-gray-500 mb-3 text-sm">Try adjusting your search criteria or add some products</p>
                    <button
                      onClick={handleAddProduct}
                      className="bg-gradient-to-r from-slate-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-slate-600 hover:to-blue-600 transition-all duration-300 shadow-lg text-sm"
                    >
                      Add Your First Product
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Enhanced Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <span>
                  Showing {((page - 1) * size) + 1} to {Math.min(page * size, totalElements)} of {totalElements} products
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Page size selector */}
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-slate-600">Show:</span>
                  <select
                    value={size}
                    onChange={(e) => handleSizeChange(Number(e.target.value))}
                    className="px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                
                {/* Page navigation */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm border rounded ${
                          page === pageNum
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ProductModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        product={selectedProduct}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getAdminProducts, deleteAdminProduct } from '@/redux/slices/adminProductsSlice';
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
  const { products, loading: productsLoading, error: productsError } = useAppSelector(
    (state) => state.adminProducts
  );
  const { categories } = useAppSelector((state) => state.adminCategories);

  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    dispatch(getAdminProducts({ page: 1, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }));
    dispatch(getAdminCategories({ includeInactive: false }));
  }, [dispatch]);

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
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleModalSuccess = () => {
    dispatch(getAdminProducts({ page: 1, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }));
  };

  const handleRefresh = () => {
    dispatch(getAdminProducts({ page: 1, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }));
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

  // Filter products based on search and filters
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || 
                           getCategoryName(product.category).toLowerCase() === categoryFilter.toLowerCase();
    
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && product.isActive) ||
                         (statusFilter === 'inactive' && !product.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  // Calculate stats
  const stats = {
    total: products?.length || 0,
    active: products?.filter(p => p.isActive).length || 0,
    inactive: products?.filter(p => !p.isActive).length || 0,
    categories: [...new Set(products?.map(p => getCategoryName(p.category)))].length || 0
  };

  if (productsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl shadow-red-500/20 border-2 border-red-200/50 p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-6">
            <AlertCircle className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-red-900 mb-4">Error Loading Products</h3>
          <p className="text-red-800 mb-6">{productsError}</p>
          <button 
            onClick={handleRefresh}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-8 space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl shadow-2xl shadow-purple-500/30 p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">📦 Products Management</h1>
            <p className="text-purple-100 text-lg">Manage your product catalog and inventory</p>
          </div>
          <div className="flex items-center space-x-4 mt-6 lg:mt-0">
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-300"
            >
              <RefreshCw className="h-5 w-5" />
              <span className="font-medium">Refresh</span>
            </button>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-green-400 to-emerald-500 px-4 py-2 rounded-xl hover:from-green-500 hover:to-emerald-600 transition-all duration-300 shadow-lg">
              <Upload className="h-5 w-5" />
              <span className="font-medium">Import</span>
            </button>
            <button
              onClick={handleAddProduct}
              className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">Add Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compact Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-2xl shadow-blue-500/20 border-2 border-blue-200/50 p-4 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-2 rounded-lg shadow-xl shadow-blue-500/30">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-lg">📦</span>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {stats.total.toLocaleString()}
          </h3>
          <p className="text-blue-600 font-semibold text-sm">Total Products</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-2xl shadow-green-500/20 border-2 border-green-200/50 p-4 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-2 rounded-lg shadow-xl shadow-green-500/30">
              <CheckCircle className="h-5 w-5" />
            </div>
            <span className="text-lg">✅</span>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {stats.active.toLocaleString()}
          </h3>
          <p className="text-green-600 font-semibold text-sm">Active Products</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-2xl shadow-orange-500/20 border-2 border-orange-200/50 p-4 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-2 rounded-lg shadow-xl shadow-orange-500/30">
              <XCircle className="h-5 w-5" />
            </div>
            <span className="text-lg">❌</span>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            {stats.inactive.toLocaleString()}
          </h3>
          <p className="text-orange-600 font-semibold text-sm">Inactive Products</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-2xl shadow-purple-500/20 border-2 border-purple-200/50 p-4 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-lg shadow-xl shadow-purple-500/30">
              <Tag className="h-5 w-5" />
            </div>
            <span className="text-lg">🏷️</span>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {stats.categories.toLocaleString()}
          </h3>
          <p className="text-purple-600 font-semibold text-sm">Categories</p>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-2xl shadow-2xl shadow-gray-500/10 border-2 border-gray-200/50 p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="flex items-center space-x-3 mb-4 lg:mb-0">
            <Filter className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Filters & Search</h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-4 py-2 rounded-xl hover:from-purple-200 hover:to-blue-200 transition-all duration-300"
            >
              {viewMode === 'table' ? <Grid3X3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
              <span className="font-medium">{viewMode === 'table' ? 'Grid View' : 'Table View'}</span>
            </button>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-4 py-2 rounded-xl hover:from-green-200 hover:to-emerald-200 transition-all duration-300">
              <Download className="h-4 w-4" />
              <span className="font-medium">Export</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
          >
            <option value="all">🏷️ All Categories</option>
            {categories?.map((category) => (
              <option key={category._id} value={category.name}>
                📂 {category.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
          >
            <option value="all">📊 All Status</option>
            <option value="active">✅ Active</option>
            <option value="inactive">❌ Inactive</option>
          </select>

          <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-3 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg font-medium">
            🔍 Advanced Search
          </button>
        </div>

        {selectedProducts.length > 0 && (
          <div className="mt-6 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border-2 border-purple-200/50">
            <span className="text-purple-700 font-medium">
              {selectedProducts.length} product(s) selected
            </span>
            <div className="flex space-x-3">
              <button className="bg-gradient-to-r from-red-400 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-500 hover:to-pink-600 transition-all duration-300 shadow-lg text-sm font-medium">
                Delete Selected
              </button>
              <button className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-blue-500 hover:to-indigo-600 transition-all duration-300 shadow-lg text-sm font-medium">
                Bulk Edit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Products Table */}
      <div className="bg-white rounded-2xl shadow-2xl shadow-gray-500/10 border-2 border-gray-200/50 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b-2 border-gray-200/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Package className="h-6 w-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">
                📦 Products Catalog ({filteredProducts.length})
              </h3>
            </div>
            {productsLoading && (
              <div className="flex items-center text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-xl">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                <span className="font-medium">Loading...</span>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-purple-50 to-blue-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={selectAllProducts}
                    className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                  📦 Product Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                  🏷️ Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                  💰 Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                  📊 Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                  ⚡ Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productsLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="animate-pulse h-4 w-4 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="animate-pulse flex items-center space-x-4">
                        <div className="h-16 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
                        <div>
                          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-40 mb-2"></div>
                          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="animate-pulse h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="animate-pulse h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="animate-pulse h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="animate-pulse flex space-x-2">
                        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16"></div>
                        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-300">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => toggleProductSelection(product._id)}
                        className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        {product.images?.[0] ? (
                          <img 
                            src={product.images[0].url} 
                            alt={product.name}
                            className="h-16 w-16 rounded-xl object-cover shadow-lg border-2 border-purple-200"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center text-2xl border-2 border-purple-200 shadow-lg">
                            📦
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-bold text-gray-900 max-w-xs">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center space-x-1">
                            <Tag className="h-4 w-4" />
                            <span>SKU: {product.sku}</span>
                          </div>
                          {product.description && (
                            <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-2 border-purple-200">
                        📂 {getCategoryName(product.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-lg font-bold text-green-600">
                          ₹{product.price.selling.toLocaleString()}
                        </span>
                      </div>
                      {product.price.mrp && product.price.mrp > product.price.selling && (
                        <div className="text-xs text-gray-500 line-through">
                          MRP: ₹{product.price.mrp.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full shadow-lg ${
                        product.isActive 
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-200' 
                          : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-2 border-red-200'
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
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white p-2 rounded-lg transition-all duration-300 shadow-lg"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white p-2 rounded-lg transition-all duration-300 shadow-lg">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white p-2 rounded-lg transition-all duration-300 shadow-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <Package className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your search criteria or add some products</p>
                    <button
                      onClick={handleAddProduct}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg"
                    >
                      Add Your First Product
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
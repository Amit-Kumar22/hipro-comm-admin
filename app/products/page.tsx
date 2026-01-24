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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Products</h3>
          <p className="text-gray-600 mb-4">{productsError}</p>
          <button 
            onClick={handleRefresh}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-4">
      {/* Professional Header */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Products Management</h1>
              <p className="text-gray-600 text-sm mt-1">Manage your product catalog and inventory</p>
            </div>
            <div className="flex items-center space-x-2 mt-3 sm:mt-0">
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm">
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </button>
              <button
                onClick={handleAddProduct}
                className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 rounded-md transition-colors text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-gray-100 text-gray-700 p-2 rounded-md">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {stats.total.toLocaleString()}
          </h3>
          <p className="text-gray-600 text-xs">Total Products</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-gray-100 text-gray-700 p-2 rounded-md">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {stats.active.toLocaleString()}
          </h3>
          <p className="text-gray-600 text-xs">Active Products</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-gray-100 text-gray-700 p-2 rounded-md">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {stats.inactive.toLocaleString()}
          </h3>
          <p className="text-gray-600 text-xs">Inactive Products</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-gray-100 text-gray-700 p-2 rounded-md">
              <Tag className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {stats.categories.toLocaleString()}
          </h3>
          <p className="text-gray-600 text-xs">Categories</p>
        </div>
      </div>

      {/* Compact Filters */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2 mb-3 sm:mb-0">
              <Filter className="h-4 w-4 text-gray-500" />
              <h2 className="text-sm font-medium text-gray-900">Filters & Search</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm"
              >
                {viewMode === 'table' ? <Grid3X3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
                <span>Grid View</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
            >
              <option value="all">All Categories</option>
              {categories?.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button className="bg-gray-900 text-white px-3 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium text-sm">
              Search
            </button>
          </div>

          {selectedProducts.length > 0 && (
            <div className="mt-3 flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200">
              <span className="text-gray-700 text-sm font-medium">
                {selectedProducts.length} product(s) selected
              </span>
              <div className="flex space-x-2">
                <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md transition-colors text-sm">
                  Delete Selected
                </button>
                <button className="bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-md transition-colors text-sm">
                  Bulk Edit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Professional Products Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-900">
                Products Catalog ({filteredProducts.length})
              </h3>
            </div>
            {productsLoading && (
              <div className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                <span>Loading...</span>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={selectAllProducts}
                    className="rounded border-gray-300 text-gray-900 shadow-sm focus:border-gray-900 focus:ring focus:ring-gray-200"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Product Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
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
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => toggleProductSelection(product._id)}
                        className="rounded border-gray-300 text-gray-900 shadow-sm focus:border-gray-900 focus:ring focus:ring-gray-200"
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
                          <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center text-lg border border-gray-200">
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
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-1.5 rounded-md transition-colors"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-1.5 rounded-md transition-colors">
                          <Eye className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 p-1.5 rounded-md transition-colors"
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
                      className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm"
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
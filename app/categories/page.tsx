'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getAdminCategories, deleteAdminCategory } from '@/redux/slices/adminCategoriesSlice';
import CategoryModal from '@/components/modals/CategoryModal';
import { 
  Folder, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  FolderOpen,
  Tag,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Upload,
  AlertCircle,
  Hash,
  Globe,
  Archive
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const dispatch = useAppDispatch();
  const { categories, loading, error } = useAppSelector((state) => state.adminCategories);

  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    dispatch(getAdminCategories({ includeInactive: true }));
  }, [dispatch]);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setShowModal(true);
  };

  const handleEditCategory = (category: any) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await dispatch(deleteAdminCategory(categoryId)).unwrap();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleModalSuccess = () => {
    dispatch(getAdminCategories({ includeInactive: true }));
  };

  const handleRefresh = () => {
    dispatch(getAdminCategories({ includeInactive: true }));
  };

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const selectAllCategories = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(filteredCategories?.map(category => category._id) || []);
    }
  };

  // Filter categories based on search and filters
  const filteredCategories = categories?.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && category.isActive) ||
                         (statusFilter === 'inactive' && !category.isActive);
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Calculate stats
  const stats = {
    total: categories?.length || 0,
    active: categories?.filter(c => c.isActive).length || 0,
    inactive: categories?.filter(c => !c.isActive).length || 0,
    withImages: categories?.filter(c => c.image).length || 0
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl shadow-red-500/20 border-2 border-red-200/50 p-6 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-xl font-bold text-red-900 mb-2">Error Loading Categories</h3>
          <p className="text-red-800 mb-4 text-sm">{error}</p>
          <button 
            onClick={handleRefresh}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 rounded-2xl shadow-xl shadow-gray-500/30 p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">📂 Categories Management</h1>
            <p className="text-gray-100 text-base">Organize your product categories</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
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
              onClick={handleAddCategory}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg text-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="font-medium">Add Category</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compact Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg shadow-xl shadow-slate-500/20 border-2 border-slate-200/50 p-3 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-gradient-to-r from-slate-500 to-slate-600 text-white p-2 rounded-lg shadow-lg shadow-slate-500/30">
              <Folder className="h-4 w-4" />
            </div>
            <span className="text-base">📂</span>
          </div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent">
            {stats.total}
          </h3>
          <p className="text-slate-600 font-semibold text-xs">Total Categories</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-xl shadow-green-500/20 border-2 border-green-200/50 p-3 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-2 rounded-lg shadow-lg shadow-green-500/30">
              <CheckCircle className="h-4 w-4" />
            </div>
            <span className="text-base">✅</span>
          </div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {stats.active}
          </h3>
          <p className="text-green-600 font-semibold text-xs">Active</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg shadow-xl shadow-red-500/20 border-2 border-red-200/50 p-3 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-2 rounded-lg shadow-lg shadow-red-500/30">
              <XCircle className="h-4 w-4" />
            </div>
            <span className="text-base">❌</span>
          </div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            {stats.inactive}
          </h3>
          <p className="text-red-600 font-semibold text-xs">Inactive</p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg shadow-xl shadow-slate-500/20 border-2 border-slate-200/50 p-3 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-gradient-to-r from-slate-500 to-blue-500 text-white p-2 rounded-lg shadow-lg shadow-slate-500/30">
              <Eye className="h-4 w-4" />
            </div>
            <span className="text-base">🖼️</span>
          </div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-slate-600 to-blue-600 bg-clip-text text-transparent">
            {stats.withImages}
          </h3>
          <p className="text-slate-600 font-semibold text-xs">With Images</p>
        </div>
      </div>

      {/* Compact Filters */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <div className="flex items-center space-x-2 mb-3 lg:mb-0">
            <Filter className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-bold text-gray-900">Filters & Search</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
              className="flex items-center space-x-1 bg-gradient-to-r from-slate-100 to-blue-100 text-slate-700 px-3 py-2 rounded-lg hover:from-slate-200 hover:to-blue-200 transition-all duration-300 text-sm"
            >
              {viewMode === 'table' ? <Grid3X3 className="h-3 w-3" /> : <List className="h-3 w-3" />}
              <span className="font-medium">{viewMode === 'table' ? 'Grid' : 'Table'}</span>
            </button>
            <button className="flex items-center space-x-1 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-3 py-2 rounded-lg hover:from-slate-200 hover:to-slate-300 transition-all duration-300 text-sm">
              <Download className="h-3 w-3" />
              <span className="font-medium">Export</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-slate-50 hover:bg-white"
            />
          </div>
          
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

        {selectedCategories.length > 0 && (
          <div className="mt-4 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50 p-3 rounded-lg border-2 border-slate-200/50">
            <span className="text-slate-700 font-medium text-sm">
              {selectedCategories.length} category(ies) selected
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

      {/* Compact Categories Table */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Folder className="h-5 w-5 text-slate-600" />
              <h3 className="text-lg font-bold text-gray-900">
                📂 Categories ({filteredCategories.length})
              </h3>
            </div>
            {loading && (
              <div className="flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded-lg">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-slate-600 mr-2"></div>
                <span className="font-medium">Loading...</span>
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
                    checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                    onChange={selectAllCategories}
                    className="rounded border-slate-300 text-slate-600 shadow-sm focus:border-slate-300 focus:ring focus:ring-slate-200"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  📂 Category Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  🌐 Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  📊 Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  🖼️ Image
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  ⚡ Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="animate-pulse h-3 w-3 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="animate-pulse flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                        <div>
                          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24 mb-1"></div>
                          <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="animate-pulse h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="animate-pulse h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-16"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="animate-pulse h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-12"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="animate-pulse flex space-x-1">
                        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-12"></div>
                        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-12"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr key={category._id} className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all duration-300">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category._id)}
                        onChange={() => toggleCategorySelection(category._id)}
                        className="rounded border-slate-300 text-slate-600 shadow-sm focus:border-slate-300 focus:ring focus:ring-slate-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        {category.image ? (
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="h-10 w-10 rounded-lg object-cover shadow-lg border-2 border-slate-200"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gradient-to-br from-slate-100 to-blue-100 rounded-lg flex items-center justify-center text-lg border-2 border-slate-200 shadow-lg">
                            📂
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-bold text-gray-900">{category.name}</div>
                          {category.description && (
                            <div className="text-xs text-gray-600 max-w-xs truncate">
                              {category.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1">
                        <Hash className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600 font-mono">/{category.slug}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded-full shadow-lg ${
                        category.isActive 
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-200' 
                          : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-2 border-red-200'
                      }`}>
                        {category.isActive ? (
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
                      <span className={`text-xs font-medium ${category.image ? 'text-green-600' : 'text-gray-400'}`}>
                        {category.image ? '✅ Yes' : '❌ No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="bg-gradient-to-r from-slate-400 to-blue-500 hover:from-slate-500 hover:to-blue-600 text-white p-1 rounded-lg transition-all duration-300 shadow-lg"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button className="bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 text-white p-1 rounded-lg transition-all duration-300 shadow-lg">
                          <Eye className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
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
                      <Folder className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">No categories found</h3>
                    <p className="text-gray-600 mb-3 text-sm">Try adjusting your search or add some categories</p>
                    <button
                      onClick={handleAddCategory}
                      className="bg-gradient-to-r from-slate-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-slate-600 hover:to-blue-600 transition-all duration-300 shadow-lg text-sm"
                    >
                      Add Your First Category
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        category={selectedCategory}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
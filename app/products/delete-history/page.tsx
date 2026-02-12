'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import { 
  useGetDeletedProductsQuery,
  usePermanentDeleteProductMutation,
  useRestoreProductMutation
} from '@/redux/api/adminProductsApi';
import { 
  Trash2, 
  RotateCcw, 
  Search, 
  Calendar,
  Package,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface DeletedProduct {
  _id: string;
  name: string;
  price: {
    selling: number;
    original: number;
  };
  category: {
    _id: string;
    name: string;
  };
  imageUrl: string;
  deletedAt: string;
  isActive: boolean;
}

export default function DeleteHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(10);
  
  const { showToast } = useToast();
  
  // RTK Query hooks for immediate UI updates
  const { 
    data: deletedData, 
    isLoading: deletedLoading, 
    error,
    refetch
  } = useGetDeletedProductsQuery({ 
    page: currentPage, 
    limit: pageLimit 
  });

  const [permanentDelete, { isLoading: isPermanentDeleting }] = usePermanentDeleteProductMutation();
  const [restoreProductMutation, { isLoading: isRestoring }] = useRestoreProductMutation();

  // Extract data from RTK Query response
  const deletedProducts = deletedData?.data || [];
  const deletedPagination = deletedData?.pagination || { page: 1, pages: 0, total: 0, limit: 10 };

  // Handle permanent deletion
  const handlePermanentDelete = async (productId: string, productName: string) => {
    try {
      const result = await permanentDelete(productId).unwrap();
      
      console.log('🗑️ Product permanently deleted:', result);
      showToast(`"${productName}" permanently deleted forever!`, 'success');
      
      // RTK Query automatically refreshes cache
      
    } catch (error: any) {
      console.error('Permanent delete error:', error);
      showToast(error?.message || 'Failed to permanently delete product', 'error');
    }
    setConfirmDelete(null);
  };

  // Handle product restoration
  const handleRestore = async (productId: string, productName: string) => {
    try {
      const result = await restoreProductMutation(productId).unwrap();
      
      console.log('♻️ Product restored:', result);
      showToast(`"${productName}" restored to active products!`, 'success');
      
      // RTK Query automatically refreshes cache
      
    } catch (error: any) {
      console.error('Restore error:', error);
      showToast(error?.message || 'Failed to restore product', 'error');
    }
  };

  // Pagination handler
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Filter products based on search term
  const filteredProducts = deletedProducts.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (deletedLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Deleted Products</h3>
          <p className="text-gray-600 mb-4">
            {typeof error === 'object' && 'message' in error ? error.message : 'Failed to load deleted products'}
          </p>
          <button 
            onClick={() => refetch()}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 via-red-600 to-pink-600 rounded-2xl shadow-xl shadow-red-500/30 p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Trash2 className="h-6 w-6" />
              Delete History
            </h1>
            <p className="text-red-100 text-base">Manage soft-deleted products - restore or permanently delete</p>
          </div>
          <div className="flex items-center space-x-2 mt-3 sm:mt-0">
            <div className="text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg">
              {deletedProducts.length} deleted products
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="🔍 Search deleted products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 bg-slate-50 hover:bg-white"
          />
        </div>
      </div>

      {/* Deleted Products List */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
            <Package className="h-5 w-5 text-red-600" />
            🗑️ Deleted Products ({filteredProducts.length})
          </h3>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Trash2 className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No deleted products found</h3>
            <p className="text-gray-500 text-sm">
              {searchTerm ? 'Try adjusting your search criteria' : 'All products are currently active'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-red-50 to-pink-50">
                <tr>
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
                    📅 Deleted At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    ⚡ Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product: DeletedProduct) => (
                  <tr key={product._id} className="hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300">
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg flex items-center justify-center text-lg border-2 border-red-200 shadow-lg">
                          📦
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {product.name}
                          </div>
                          <div className="text-xs text-red-600 font-semibold">
                            🗑️ DELETED
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                        {product.category?.name || 'No Category'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{product.price?.selling?.toLocaleString() || 0}
                      </div>
                      {product.price?.original && product.price?.selling && product.price.original > product.price.selling && (
                        <div className="text-xs text-gray-500 line-through">
                          MRP: ₹{product.price?.original?.toLocaleString() || 0}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(product.deletedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRestore(product._id, product.name)}
                          disabled={isRestoring}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-2 rounded-lg transition-all duration-300 shadow-lg flex items-center gap-1 text-xs disabled:opacity-50"
                          title="Restore Product"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Restore
                        </button>
                        
                        {confirmDelete === product._id ? (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handlePermanentDelete(product._id, product.name)}
                              disabled={isPermanentDeleting}
                              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3 py-1 rounded text-xs shadow-lg disabled:opacity-50"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-3 py-1 rounded text-xs shadow-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(product._id)}
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white p-2 rounded-lg transition-all duration-300 shadow-lg flex items-center gap-1 text-xs"
                            title="Permanently Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete Forever
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {deletedPagination.pages > 1 && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Page {deletedPagination.page} of {deletedPagination.pages} ({deletedPagination.total} total)
              </div>
              <div className="flex space-x-2">
                {Array.from({ length: Math.min(5, deletedPagination.pages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (deletedPagination.pages > 5) {
                    if (deletedPagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (deletedPagination.page >= deletedPagination.pages - 2) {
                      pageNum = deletedPagination.pages - 4 + i;
                    } else {
                      pageNum = deletedPagination.page - 2 + i;
                    }
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm border rounded ${
                        deletedPagination.page === pageNum
                          ? 'bg-red-500 text-white border-red-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getAdminProducts } from '@/redux/slices/adminProductsSlice';
import { getAdminCategories } from '@/redux/slices/adminCategoriesSlice';
import Link from 'next/link';

export default function AdminProductsPage() {
  const dispatch = useAppDispatch();
  const { products, loading: productsLoading, error: productsError } = useAppSelector(
    (state) => state.adminProducts
  );
  const { categories } = useAppSelector((state) => state.adminCategories);

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

  if (productsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
        <p className="text-red-800">Error loading products: {productsError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Products Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <Link 
          href="/admin/products/new" 
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-md transition-colors"
        >
          Add Product
        </Link>
      </div>

      {/* Products Grid */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">
            Products ({products?.length || 0})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productsLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3">
                      <div className="animate-pulse flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded mr-3"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="animate-pulse h-5 bg-gray-200 rounded w-12"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="animate-pulse flex space-x-2">
                        <div className="h-6 bg-gray-200 rounded w-12"></div>
                        <div className="h-6 bg-gray-200 rounded w-12"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : products && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {product.images?.[0] ? (
                          <img 
                            src={product.images[0].url} 
                            alt={product.name}
                            className="h-10 w-10 rounded object-cover mr-3"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded mr-3 flex items-center justify-center">
                            📦
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {getCategoryName(product.category)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      ₹{product.price.selling.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this product?')) {
                              // Implement delete functionality
                              console.log('Delete product:', product._id);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
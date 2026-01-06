'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getAdminCategories } from '@/redux/slices/adminCategoriesSlice';
import Link from 'next/link';

export default function AdminCategoriesPage() {
  const dispatch = useAppDispatch();
  const { categories, loading, error } = useAppSelector((state) => state.adminCategories);

  useEffect(() => {
    dispatch(getAdminCategories({ includeInactive: true }));
  }, [dispatch]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
        <p className="text-red-800">Error loading categories: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Categories Management</h1>
          <p className="text-sm text-gray-600 mt-1">Organize your product categories</p>
        </div>
        <Link 
          href="/admin/categories/new" 
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-md transition-colors"
        >
          Add Category
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">
            Categories ({categories?.length || 0})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sort Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
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
                      <div className="animate-pulse h-5 bg-gray-200 rounded w-12"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-8"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="animate-pulse flex space-x-2">
                        <div className="h-6 bg-gray-200 rounded w-12"></div>
                        <div className="h-6 bg-gray-200 rounded w-12"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : categories && categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="h-10 w-10 rounded object-cover mr-3"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="h-10 w-10 bg-gray-200 rounded mr-3 hidden flex items-center justify-center">
                          📂
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          <div className="text-sm text-gray-500">/{category.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {/* Parent functionality can be added when needed */}
                      -
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        category.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {/* Sort order functionality can be added when needed */}
                      0
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/categories/${category._id}/edit`}
                          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this category?')) {
                              // Implement delete functionality
                              console.log('Delete category:', category._id);
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
                    No categories found
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
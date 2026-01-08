'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getAdminProducts, deleteAdminProduct } from '@/redux/slices/adminProductsSlice';
import { getAdminCategories } from '@/redux/slices/adminCategoriesSlice';
import ProductModal from '@/components/modals/ProductModal';

export default function AdminProductsPage() {
  const dispatch = useAppDispatch();
  const { products, loading: productsLoading, error: productsError } = useAppSelector(
    (state) => state.adminProducts
  );
  const { categories } = useAppSelector((state) => state.adminCategories);

  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

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
        <button
          onClick={handleAddProduct}
          className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors"
        >
          Add Product
        </button>
      </div>

      {/* Products Grid */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-2 border-b border-gray-200">
          <h3 className="text-xs font-medium text-gray-900">
            Products ({products?.length || 0})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productsLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-2 py-2">
                      <div className="animate-pulse flex items-center">
                        <div className="h-8 w-8 bg-gray-200 rounded mr-2"></div>
                        <div>
                          <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                          <div className="h-2 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="animate-pulse h-3 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="animate-pulse h-3 bg-gray-200 rounded w-12"></div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-10"></div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="animate-pulse flex space-x-1">
                        <div className="h-5 bg-gray-200 rounded w-8"></div>
                        <div className="h-5 bg-gray-200 rounded w-8"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : products && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-2 py-2">
                      <div className="flex items-center">
                        {product.images?.[0] ? (
                          <img 
                            src={product.images[0].url} 
                            alt={product.name}
                            className="h-8 w-8 rounded object-cover mr-2"
                          />
                        ) : (
                          <div className="h-8 w-8 bg-gray-200 rounded mr-2 flex items-center justify-center text-xs">
                            📦
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-medium text-gray-900 truncate max-w-xs">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-500">
                      {getCategoryName(product.category)}
                    </td>
                    <td className="px-2 py-2 text-xs font-medium text-gray-900">
                      ₹{product.price.selling.toLocaleString()}
                    </td>
                    <td className="px-2 py-2">
                      <span className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded-full ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-1 py-0.5 rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-1 py-0.5 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-2 py-4 text-center text-xs text-gray-500">
                    No products found
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
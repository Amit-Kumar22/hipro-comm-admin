'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  fetchAllOrders, 
  fetchOrderStats,
  updateOrderStatus,
  setFilters,
  clearFilters,
  clearError 
} from '@/redux/slices/adminOrdersSlice';
import { useToast } from '@/components/providers/ToastProvider';
import { 
  Package, 
  Search, 
  Filter, 
  RefreshCw, 
  TrendingUp,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  User,
  Eye,
  Edit3,
  Download,
  Upload,
  BarChart3,
  Activity,
  Truck,
  CreditCard
} from 'lucide-react';

export default function AdminOrdersPage() {
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useToast();
  const { 
    orders, 
    stats, 
    loading, 
    error, 
    pagination, 
    filters 
  } = useAppSelector((state) => state.adminOrders);

  const [searchTerm, setSearchTerm] = useState('');
  const [localFilters, setLocalFilters] = useState(filters || {});
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await dispatch(fetchAllOrders({}));
        await dispatch(fetchOrderStats());
      } catch (error) {
        console.error('Failed to load orders data:', error);
      }
    };

    loadInitialData();
  }, [dispatch]);

  // Error handling
  useEffect(() => {
    if (error) {
      showError(error);
      dispatch(clearError());
    }
  }, [error, showError, dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      dispatch(setFilters({ search: searchTerm }));
      dispatch(fetchAllOrders({ search: searchTerm }));
    }
  };

  const handleFilterChange = useCallback((filterName: string, value: any) => {
    const newFilters = { ...localFilters, [filterName]: value };
    setLocalFilters(newFilters);
    dispatch(setFilters(newFilters));
    dispatch(fetchAllOrders(newFilters));
  }, [localFilters, dispatch]);

  const handleStatusUpdate = useCallback(async (orderId: string, newStatus: string) => {
    try {
      await dispatch(updateOrderStatus({ orderId, status: newStatus }));
      showSuccess(`Order status updated to ${newStatus}`);
    } catch (error: any) {
      showError(error?.message || 'Failed to update order status');
    }
  }, [dispatch, showSuccess, showError]);

  const handleRefresh = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchAllOrders({})),
        dispatch(fetchOrderStats())
      ]);
      showSuccess('Orders data refreshed successfully');
    } catch (error) {
      showError('Failed to refresh orders data');
    }
  }, [dispatch, showSuccess, showError]);

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order._id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-2 border-yellow-200';
      case 'processing':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-2 border-blue-200';
      case 'shipped':
        return 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-2 border-purple-200';
      case 'delivered':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-200';
      case 'cancelled':
        return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-2 border-red-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-2 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'processing':
        return <Activity className="h-3 w-3 mr-1" />;
      case 'shipped':
        return <Truck className="h-3 w-3 mr-1" />;
      case 'delivered':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'cancelled':
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return <AlertTriangle className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 space-y-6">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl shadow-indigo-500/30 p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">🛍️ Orders Management</h1>
            <p className="text-indigo-100 text-base">Manage customer orders and fulfillment processes</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 text-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="font-medium">{loading ? 'Loading...' : 'Refresh'}</span>
            </button>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-green-400 to-emerald-500 px-3 py-2 rounded-lg hover:from-green-500 hover:to-emerald-600 transition-all duration-300 shadow-lg text-sm">
              <Download className="h-4 w-4" />
              <span className="font-medium">Export</span>
            </button>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-400 to-cyan-500 px-3 py-2 rounded-lg hover:from-blue-500 hover:to-cyan-600 transition-all duration-300 shadow-lg text-sm">
              <Upload className="h-4 w-4" />
              <span className="font-medium">Import</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compact Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-xl shadow-blue-500/20 border-2 border-blue-200/50 p-3 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-2 rounded-lg shadow-lg shadow-blue-500/30">
                <ShoppingCart className="h-3 w-3" />
              </div>
              <span className="text-sm">🛒</span>
            </div>
            <h3 className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {stats.totalOrders || 0}
            </h3>
            <p className="text-blue-600 font-semibold text-xs">Total Orders</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-xl shadow-green-500/20 border-2 border-green-200/50 p-3 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-2 rounded-lg shadow-lg shadow-green-500/30">
                <DollarSign className="h-3 w-3" />
              </div>
              <span className="text-sm">💰</span>
            </div>
            <h3 className="text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              ₹{stats.totalRevenue?.toLocaleString() || 0}
            </h3>
            <p className="text-green-600 font-semibold text-xs">Total Revenue</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg shadow-xl shadow-yellow-500/20 border-2 border-yellow-200/50 p-3 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-2 rounded-lg shadow-lg shadow-yellow-500/30">
                <Clock className="h-3 w-3" />
              </div>
              <span className="text-sm">⏳</span>
            </div>
            <h3 className="text-sm font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              {stats.statusBreakdown?.pending || 0}
            </h3>
            <p className="text-yellow-600 font-semibold text-xs">Pending</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-xl shadow-purple-500/20 border-2 border-purple-200/50 p-3 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-lg shadow-lg shadow-purple-500/30">
                <Truck className="h-3 w-3" />
              </div>
              <span className="text-sm">🚚</span>
            </div>
            <h3 className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {stats.statusBreakdown?.shipped || 0}
            </h3>
            <p className="text-purple-600 font-semibold text-xs">Shipped</p>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg shadow-xl shadow-teal-500/20 border-2 border-teal-200/50 p-3 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-2 rounded-lg shadow-lg shadow-teal-500/30">
                <CheckCircle className="h-3 w-3" />
              </div>
              <span className="text-sm">✅</span>
            </div>
            <h3 className="text-sm font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              {stats.statusBreakdown?.delivered || 0}
            </h3>
            <p className="text-teal-600 font-semibold text-xs">Delivered</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg shadow-xl shadow-red-500/20 border-2 border-red-200/50 p-3 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-2 rounded-lg shadow-lg shadow-red-500/30">
                <XCircle className="h-3 w-3" />
              </div>
              <span className="text-sm">❌</span>
            </div>
            <h3 className="text-sm font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              {stats.statusBreakdown?.cancelled || 0}
            </h3>
            <p className="text-red-600 font-semibold text-xs">Cancelled</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg shadow-gray-500/10 border-2 border-gray-100/50 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="🔍 Search orders, customer names, order IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
              />
            </div>
          </form>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={localFilters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm bg-white"
            >
              <option value="">📊 All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={localFilters.timeRange || ''}
              onChange={(e) => handleFilterChange('timeRange', e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm bg-white"
            >
              <option value="">📅 Time Range</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>

            <select
              value={localFilters.paymentStatus || ''}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm bg-white"
            >
              <option value="">💳 Payment Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            
            <button
              onClick={() => {
                setLocalFilters({});
                setSearchTerm('');
                dispatch(clearFilters());
                dispatch(fetchAllOrders({}));
              }}
              className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all duration-300 text-sm"
            >
              <Filter className="h-3 w-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-lg shadow-gray-500/10 border-2 border-gray-100/50 overflow-hidden">
        <div className="p-4 border-b-2 border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                🛍️ Orders List
              </h2>
              <p className="text-gray-500 text-sm">
                {selectedOrders.length > 0 && `${selectedOrders.length} orders selected • `}
                {orders.length} orders • Page {pagination?.page || 1} of {pagination?.pages || 1}
              </p>
            </div>
            {selectedOrders.length > 0 && (
              <div className="flex space-x-2">
                <button className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg shadow-blue-500/30 text-sm">
                  <Edit3 className="h-3 w-3" />
                  <span>Bulk Update</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg shadow-green-500/30 text-sm">
                  <Download className="h-3 w-3" />
                  <span>Export Selected</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onChange={selectAllOrders}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                      <div>
                        <p className="text-lg font-semibold text-gray-700">Loading orders...</p>
                        <p className="text-sm text-gray-500">Please wait while we fetch order data</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <Package className="h-16 w-16 text-gray-300" />
                      <div>
                        <p className="text-lg font-semibold text-gray-700">No orders found</p>
                        <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr 
                    key={order._id} 
                    className={`hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 ${
                      selectedOrders.includes(order._id) ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={() => toggleOrderSelection(order._id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          #{order.orderNumber || order._id.slice(-6)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.items?.length || 0} items
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold">
                            {order.user?.name?.[0] || 'U'}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {order.user?.name || 'Unknown Customer'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {order.user?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-gray-900">
                        ₹{order.totals?.total?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="p-2 text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-lg transition-all duration-200 group"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                          className="p-2 text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-lg transition-all duration-200 group"
                          title="Edit Order"
                        >
                          <Edit3 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          className="text-xs border-2 border-gray-200 rounded px-2 py-1 focus:border-indigo-500 focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-700 font-medium">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => dispatch(fetchAllOrders({ ...localFilters, page: pagination.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1.5 text-sm font-medium text-gray-500 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Previous
                </button>
                
                <button className="px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 rounded-lg">
                  {pagination.page}
                </button>
                
                <button
                  onClick={() => dispatch(fetchAllOrders({ ...localFilters, page: pagination.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                  className="px-3 py-1.5 text-sm font-medium text-gray-500 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchAllOrders, updateOrderStatus } from '../../redux/slices/adminOrdersSlice';

export default function OrdersTable() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, pagination, loading, updating, filters } = useSelector(
    (state: RootState) => state.adminOrders
  );

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchAllOrders({ page: 1, limit: 20, ...filters }));
  }, [dispatch, filters]);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    await dispatch(updateOrderStatus({ orderId, status }));
    dispatch(fetchAllOrders({ page: pagination?.page || 1, limit: 20, ...filters }));
  };

  const handlePageChange = (page: number) => {
    dispatch(fetchAllOrders({ page, limit: 20, ...filters }));
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-200 text-yellow-900 border-yellow-300',
      PAID: 'bg-blue-200 text-blue-900 border-blue-300',
      SHIPPED: 'bg-purple-200 text-purple-900 border-purple-300',
      DELIVERED: 'bg-green-200 text-green-900 border-green-300',
      CANCELLED: 'bg-red-200 text-red-900 border-red-300',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-200 text-gray-900 border-gray-300';
  };

  if (loading && orders.length === 0) {
    return (
      <div className="bg-white rounded border p-4">
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <div className="bg-white rounded border p-8 text-center">
        <div className="text-3xl mb-3">📋</div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">No Orders Found</h3>
        <p className="text-xs text-gray-600">
          {Object.keys(filters).length > 0 
            ? 'No orders match your current filters.' 
            : 'No orders have been placed yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded border overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b bg-gray-50 flex justify-between items-center">
        <h3 className="text-sm font-medium">Orders ({pagination?.total || 0})</h3>
        {selectedOrders.length > 0 && (
          <span className="text-xs text-gray-500">{selectedOrders.length} selected</span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  onChange={(e) =>
                    setSelectedOrders(e.target.checked ? orders.map(o => o._id) : [])
                  }
                />
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={selectedOrders.includes(order._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders([...selectedOrders, order._id]);
                      } else {
                        setSelectedOrders(selectedOrders.filter(id => id !== order._id));
                      }
                    }}
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="text-xs">
                    <div className="font-semibold text-gray-900">{order.orderNumber}</div>
                    <div className="text-gray-600">#{order._id.slice(-6)}</div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="text-xs">
                    <div className="font-semibold text-gray-900">{order.user?.name || 'N/A'}</div>
                    <div className="text-gray-700">{order.user?.email || 'N/A'}</div>
                  </div>
                </td>
                <td className="px-3 py-2 text-xs font-medium text-gray-900">
                  {order.items?.length || 0} items
                </td>
                <td className="px-3 py-2">
                  <div className="text-xs">
                    <div className="font-bold text-gray-900">₹{order.totals?.total?.toFixed(2) || '0.00'}</div>
                    <div className="text-gray-700">{order.paymentMethod === 'cod' ? 'COD' : 'Online'}</div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                    disabled={updating}
                    className="text-xs border-0 bg-transparent focus:ring-0 cursor-pointer"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-0.5 rounded border text-xs font-semibold ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 text-xs font-medium text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="px-3 py-2 text-xs">
                  <button className="text-blue-700 hover:text-blue-900 font-medium">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="px-3 py-2 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-700">
            Page {pagination.page} of {pagination.pages} • {pagination.total} total
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-2 py-1 text-xs border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              ←
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-2 py-1 text-xs border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
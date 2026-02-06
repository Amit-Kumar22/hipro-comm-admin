'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchAllOrders, updateOrderStatus } from '../../redux/slices/adminOrdersSlice';
import PaymentVerification from './PaymentVerification';

export default function OrdersTable() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, pagination, loading, updating, filters } = useSelector(
    (state: RootState) => state.adminOrders
  );

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [trackingModal, setTrackingModal] = useState<{ isOpen: boolean; order: any | null }>({
    isOpen: false,
    order: null
  });
  const [paymentVerificationModal, setPaymentVerificationModal] = useState<{ 
    isOpen: boolean; 
    payment: any | null; 
    order: any | null;
  }>({
    isOpen: false,
    payment: null,
    order: null
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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

  // Payment verification functions
  const handleVerifyPayment = async (paymentId: string, orderId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/admin/verify/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentVerificationModal({
          isOpen: true,
          payment: data.data.payment,
          order: data.data.order
        });
      } else {
        alert('Failed to fetch payment details');
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      alert('Error fetching payment details');
    }
  };

  const handlePaymentAction = async (paymentId: string, action: 'approve' | 'reject', message?: string) => {
    setIsProcessingPayment(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/admin/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentId,
          action,
          message
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        
        // Close modal and refresh orders
        setPaymentVerificationModal({ isOpen: false, payment: null, order: null });
        dispatch(fetchAllOrders({ page: pagination?.page || 1, limit: 20, ...filters }));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to process payment action');
      }
    } catch (error) {
      console.error('Error processing payment action:', error);
      alert('Error processing payment action');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-orange-100 text-orange-800',
      PAID: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentBadge = (method: string, status: string) => {
    if (method === 'cod') {
      return status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    }
    return status === 'PAID' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
  };

  const checkStockStatus = (items: any[]) => {
    // Mock stock check - integrate with actual inventory system
    const lowStockItems = items.filter(item => {
      // Assuming we have stock info in product data
      return item.product?.inventory?.available < 5;
    });
    return lowStockItems.length > 0;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gradient-to-r from-slate-100 to-blue-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg p-6 text-center">
        <div className="text-4xl mb-2">📋</div>
        <h3 className="text-lg font-semibold text-slate-700 mb-1">No Orders Found</h3>
        <p className="text-sm text-slate-600">
          {Object.keys(filters).length > 0 
            ? 'No orders match your current filters.' 
            : 'No orders have been placed yet.'}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Professional Tracking Modal - Rendered Outside Table Container */}
      {trackingModal.isOpen && trackingModal.order && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-800 text-white rounded-t-lg">
              <div>
                <h3 className="text-sm font-bold">Order Tracking</h3>
                <p className="text-xs text-gray-300">{trackingModal.order.orderNumber}</p>
              </div>
              <button
                onClick={() => setTrackingModal({ isOpen: false, order: null })}
                className="text-gray-300 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {/* Order Status */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-600">Current Status</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusBadge(trackingModal.order.status)}`}>
                    {trackingModal.order.status}
                  </span>
                </div>
                
                {/* Status Timeline */}
                <div className="space-y-2">
                  {[
                    { status: 'PENDING', label: 'Order Placed', icon: '📋' },
                    { status: 'PAID', label: 'Payment Confirmed', icon: '💳' },
                    { status: 'SHIPPED', label: 'Order Shipped', icon: '🚚' },
                    { status: 'DELIVERED', label: 'Delivered', icon: '📦' }
                  ].map((step, index) => {
                    const isCompleted = ['PAID', 'SHIPPED', 'DELIVERED'].includes(trackingModal.order.status) && 
                      (step.status === 'PENDING' || 
                       (step.status === 'PAID' && ['PAID', 'SHIPPED', 'DELIVERED'].includes(trackingModal.order.status)) ||
                       (step.status === 'SHIPPED' && ['SHIPPED', 'DELIVERED'].includes(trackingModal.order.status)) ||
                       (step.status === 'DELIVERED' && trackingModal.order.status === 'DELIVERED'));
                    
                    const isCurrent = trackingModal.order.status === step.status;
                    
                    return (
                      <div key={step.status} className={`flex items-center space-x-3 p-2 rounded ${
                        isCurrent ? 'bg-blue-50 border border-blue-200' : 
                        isCompleted ? 'bg-green-50' : 'bg-gray-50'
                      }`}>
                        <span className="text-lg">{step.icon}</span>
                        <div className="flex-1">
                          <div className={`text-xs font-medium ${
                            isCurrent ? 'text-blue-800' : 
                            isCompleted ? 'text-green-800' : 'text-gray-600'
                          }`}>
                            {step.label}
                          </div>
                          {isCurrent && (
                            <div className="text-xs text-blue-600 font-semibold">Current Status</div>
                          )}
                        </div>
                        {isCompleted && <span className="text-green-600 text-sm">✓</span>}
                        {isCurrent && <span className="text-blue-600 text-sm">●</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Details */}
              <div className="border-t pt-3 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-gray-800 mb-2">Order Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Order ID:</span>
                      <div className="font-semibold">{trackingModal.order._id.slice(-8)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Amount:</span>
                      <div className="font-bold text-green-600">₹{trackingModal.order.totals?.total?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment:</span>
                      <div className="font-medium">{trackingModal.order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Order Date:</span>
                      <div className="font-medium">{new Date(trackingModal.order.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="text-xs font-bold text-gray-800 mb-2">Customer Details</h4>
                  <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
                    <div className="font-medium">{trackingModal.order.user?.name || 'N/A'}</div>
                    <div className="text-gray-600">{trackingModal.order.user?.email || 'N/A'}</div>
                    {trackingModal.order.shippingAddress && (
                      <div className="text-gray-600">
                        {trackingModal.order.shippingAddress.address}, {trackingModal.order.shippingAddress.city}
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                {trackingModal.order.items && trackingModal.order.items.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {trackingModal.order.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                          <div>
                            <div className="font-medium">{item.product?.name || 'Unknown Product'}</div>
                            <div className="text-gray-600">Qty: {item.quantity}</div>
                          </div>
                          <div className="font-bold">₹{((item.product?.price || 0) * (item.quantity || 1)).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`Order: ${trackingModal.order._id}\nStatus: ${trackingModal.order.status}\nAmount: ₹${trackingModal.order.totals?.total?.toFixed(2) || '0.00'}`);
                  }}
                  className="w-full px-3 py-2 text-xs font-medium bg-gradient-to-r from-slate-400 to-blue-500 text-white rounded hover:from-slate-500 hover:to-blue-600 transition-all duration-300"
                >
                  📋 Copy Order Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg overflow-hidden">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 border-b border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-700">
              📋 Orders ({pagination?.total || 0})
            </h3>
          </div>
          {selectedOrders.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-gradient-to-r from-slate-400 to-blue-500 text-white px-2 py-1 rounded-lg font-medium">
                {selectedOrders.length} selected
              </span>
              <button className="px-3 py-1 text-xs bg-gradient-to-r from-slate-500 to-blue-500 text-white rounded-lg hover:from-slate-600 hover:to-blue-600 transition-all duration-300 shadow-lg font-medium">
                ⚡ Actions
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Compact Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
            <tr>
              <th className="px-3 py-3 text-left">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-slate-600 shadow-sm focus:border-slate-300 focus:ring focus:ring-slate-200"
                  onChange={(e) =>
                    setSelectedOrders(e.target.checked ? orders.map(o => o._id) : [])
                  }
                />
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">📋 Order</th>
              <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">👤 Customer</th>
              <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">📦 Items</th>
              <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">💰 Amount</th>
              <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider w-24">📊 Status</th>
              <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">📅 Date</th>
              <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">⚡ Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {orders.map((order, index) => (
              <React.Fragment key={order._id}>
                <tr className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all duration-300`}>
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-slate-600 shadow-sm focus:border-slate-300 focus:ring focus:ring-slate-200"
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
                  <td className="px-3 py-3">
                    <div className="text-xs">
                      <div className="font-bold text-gray-900">{order.orderNumber}</div>
                      <div className="text-gray-600">#{order._id.slice(-6)}</div>
                      {checkStockStatus(order.items || []) && (
                        <div className="text-red-600 font-medium">⚠️ Low Stock</div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 min-w-44">
                    <div className="text-xs">
                      <div className="font-semibold text-gray-900">{order.user?.name || 'N/A'}</div>
                      <div className="text-gray-600">{order.user?.email || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs">
                      <div className="font-semibold text-gray-900">
                        {order.items?.length || 0} items
                      </div>
                      <div className="text-gray-600">
                        Qty: {order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}
                      </div>
                      {order.items && order.items.length > 0 && (
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {expandedOrder === order._id ? '▲' : '▼'} View
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-gray-900">₹{order.totals?.total?.toFixed(2) || '0.00'}</div>
                      <div className={`px-1 py-0.5 rounded text-xs ${getPaymentBadge(order.paymentMethod, order.paymentStatus)}`}>
                        {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                      </div>
                      {/* Show Verify Payment button for pending online payments */}
                      {order.paymentMethod !== 'cod' && order.paymentStatus === 'PENDING' && order.paymentId && (
                        <button
                          onClick={() => handleVerifyPayment(order.paymentId!, order._id)}
                          className="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition-colors w-full"
                        >
                          🔍 Verify Payment
                        </button>
                      )}
                      {order.paymentMethod !== 'cod' && order.paymentStatus === 'PAID' && (
                        <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs text-center">
                          ✅ Verified
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 w-24">
                    <div className="space-y-1">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        disabled={updating}
                        className="w-20 text-xs border border-gray-300 rounded px-1 py-1 bg-white text-gray-900 font-medium focus:border-blue-500"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                      <div>
                        <span className={`inline-block px-1 py-0.5 rounded text-xs font-medium ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs font-medium text-gray-900">
                    <div>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                    <div className="text-gray-600">{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                        className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-slate-400 to-blue-500 text-white rounded-lg hover:from-slate-500 hover:to-blue-600 transition-all duration-300 shadow-lg"
                      >
                        {expandedOrder === order._id ? 'Hide' : 'View'}
                      </button>
                      <button 
                        onClick={() => setTrackingModal({ isOpen: true, order })}
                        className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-lg hover:from-green-500 hover:to-emerald-600 transition-all duration-300 shadow-lg"
                      >
                        Track
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Compact Expanded Order Details */}
                {expandedOrder === order._id && (
                  <tr>
                    <td colSpan={8} className="px-3 py-2 bg-gray-50 border-l-2 border-blue-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Order Items */}
                        <div>
                          <h5 className="text-xs font-bold text-gray-900 mb-1">Items ({order.items?.length || 0})</h5>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {order.items?.map((item: any, index: number) => (
                              <div key={index} className="flex items-center space-x-2 p-1 bg-white rounded text-xs">
                                {item.product?.images?.[0] && (
                                  <img
                                    src={item.product.images[0].url}
                                    alt={item.product.images[0].alt}
                                    className="w-8 h-8 rounded object-cover"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 truncate">{item.name}</div>
                                  <div className="text-gray-600">
                                    {item.sku} | Qty: {item.quantity} | ₹{item.price}
                                  </div>
                                  <div className="flex space-x-1">
                                    <span className={`px-1 py-0.5 rounded text-xs ${
                                      item.product?.inventory?.available > 10 ? 'bg-green-100 text-green-800' 
                                      : item.product?.inventory?.available > 0 ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                    }`}>
                                      Stock: {item.product?.inventory?.available || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-xs font-bold">₹{item.total}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Shipping & Actions */}
                        <div>
                          <h5 className="text-xs font-bold text-gray-900 mb-1">Shipping & Actions</h5>
                          <div className="p-2 bg-white rounded text-xs mb-2">
                            <div>{order.shippingAddress?.street}</div>
                            <div>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</div>
                            {order.shippingAddress?.phone && <div>📱 {order.shippingAddress.phone}</div>}
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                              Update Status
                            </button>
                            <button className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                              Reserve Stock
                            </button>
                            <button className="px-2 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700">
                              Check Inventory
                            </button>
                            <button className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700">
                              Invoice
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Compact Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-4 py-3 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-700 font-medium">
              📄 {((pagination.page - 1) * 20) + 1}-{Math.min(pagination.page * 20, pagination.total)} of {pagination.total}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 text-xs bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-lg hover:from-slate-600 hover:to-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg font-medium"
              >
                ⬅️ Prev
              </button>
              <span className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium">
                {pagination.page}/{pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg font-medium"
              >
                Next ➡️
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
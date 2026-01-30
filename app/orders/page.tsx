'use client';

import OrdersStats from '../../components/orders/OrdersStats';
import OrdersFilters from '../../components/orders/OrdersFilters';
import OrdersTable from '../../components/orders/OrdersTable';

export default function AdminOrdersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 rounded-2xl shadow-xl shadow-gray-500/30 p-6 text-white">
        <h1 className="text-2xl font-bold text-white">📋 Orders Management</h1>
        <p className="text-gray-100 text-base">Manage customer orders and fulfillment</p>
      </div>

      {/* Enhanced Statistics */}
      <OrdersStats />

      {/* Enhanced Filters */}
      <OrdersFilters />

      {/* Enhanced Orders Table */}
      <OrdersTable />
    </div>
  );
}
'use client';

import OrdersStats from '../../components/orders/OrdersStats';
import OrdersFilters from '../../components/orders/OrdersFilters';
import OrdersTable from '../../components/orders/OrdersTable';

export default function AdminOrdersPage() {
  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Orders Management</h1>
        <p className="text-xs text-gray-600">Manage customer orders and fulfillment</p>
      </div>

      {/* Compact Statistics */}
      <OrdersStats />

      {/* Compact Filters */}
      <OrdersFilters />

      {/* Compact Orders Table */}
      <OrdersTable />
    </div>
  );
}
'use client';

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Orders Management</h1>
        <p className="text-sm text-gray-600 mt-1">Manage customer orders and fulfillment</p>
      </div>

      {/* Coming Soon */}
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Orders Management Coming Soon</h3>
        <p className="text-sm text-gray-600">
          Order management functionality will be available in the next update.
        </p>
      </div>
    </div>
  );
}
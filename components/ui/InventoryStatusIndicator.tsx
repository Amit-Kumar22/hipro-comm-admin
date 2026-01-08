'use client';

import { useAppSelector } from '@/redux/hooks';

export default function InventoryStatusIndicator() {
  const { lastSyncTime, loading, stockAffectingOrders } = useAppSelector((state) => state.orderInventory);
  const { stats } = useAppSelector((state) => state.inventory);

  if (!lastSyncTime && !loading) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-sm">
        {/* Sync Status */}
        <div className="flex items-center space-x-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${loading ? 'bg-blue-400 animate-pulse' : 'bg-green-400'}`}></div>
          <span className="text-sm font-medium text-gray-900">
            {loading ? 'Syncing inventory...' : 'Inventory synced'}
          </span>
        </div>
        
        {/* Last Sync Time */}
        {lastSyncTime && (
          <p className="text-xs text-gray-500 mb-2">
            Last sync: {new Date(lastSyncTime).toLocaleString()}
          </p>
        )}
        
        {/* Pending Orders */}
        {stockAffectingOrders.length > 0 && (
          <p className="text-xs text-orange-600">
            {stockAffectingOrders.length} order{stockAffectingOrders.length > 1 ? 's' : ''} pending stock update
          </p>
        )}
        
        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-500">Total Stock</p>
              <p className="text-sm font-medium text-gray-900">{stats.totalStock.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Low Stock</p>
              <p className={`text-sm font-medium ${stats.lowStockItems > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                {stats.lowStockItems}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
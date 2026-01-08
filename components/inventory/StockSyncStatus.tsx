'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';

interface StockSyncStatusProps {
  className?: string;
}

export default function StockSyncStatus({ className = '' }: StockSyncStatusProps) {
  const { syncStatus } = useAppSelector((state) => state.inventory);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Dynamic Stock Status Indicator */}
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          !isOnline 
            ? 'bg-red-500' 
            : syncStatus?.lastSyncTime 
              ? 'bg-green-500 animate-pulse' 
              : 'bg-yellow-500'
        }`}></div>
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {!isOnline ? 'Offline' : 'Dynamic Stock Sync'}
          </div>
          <div className="text-xs text-gray-500">
            {!isOnline 
              ? 'Stock updates paused' 
              : syncStatus?.lastSyncTime 
                ? `Last sync: ${new Date(syncStatus.lastSyncTime).toLocaleTimeString()}`
                : 'Ready to sync'
            }
          </div>
        </div>
      </div>

      {/* Status Message */}
      {syncStatus?.message && (
        <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
          {syncStatus.message}
        </div>
      )}
    </div>
  );
}
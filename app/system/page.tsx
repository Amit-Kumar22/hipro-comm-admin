'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getSystemInfo } from '@/redux/slices/adminSlice';

export default function AdminSystemPage() {
  const dispatch = useAppDispatch();
  const { systemInfo, loading, error } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getSystemInfo());
  }, [dispatch]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
        <p className="text-red-800">Error loading system info: {error}</p>
      </div>
    );
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">System Information</h1>
        <p className="text-sm text-gray-600 mt-1">Server status and system details</p>
      </div>

      {loading ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : systemInfo ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Application Version:</span>
                <span className="font-medium">{systemInfo.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Node.js Version:</span>
                <span className="font-medium">{systemInfo.nodeVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Environment:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  systemInfo.environment === 'production' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {systemInfo.environment}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform:</span>
                <span className="font-medium">{systemInfo.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Uptime:</span>
                <span className="font-medium">{formatUptime(systemInfo.uptime)}</span>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Memory Usage</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">RSS (Resident Set Size):</span>
                <span className="font-medium">{formatMemory(systemInfo.memoryUsage.rss)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Heap Total:</span>
                <span className="font-medium">{formatMemory(systemInfo.memoryUsage.heapTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Heap Used:</span>
                <span className="font-medium">{formatMemory(systemInfo.memoryUsage.heapUsed)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">External:</span>
                <span className="font-medium">{formatMemory(systemInfo.memoryUsage.external)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Array Buffers:</span>
                <span className="font-medium">{formatMemory(systemInfo.memoryUsage.arrayBuffers)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <p className="text-sm text-gray-500">No system information available</p>
        </div>
      )}

      {/* Health Check */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Health Status</h3>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">System is running normally</span>
        </div>
      </div>
    </div>
  );
}
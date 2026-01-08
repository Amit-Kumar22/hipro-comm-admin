'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getDashboardStats, getRecentActivity } from '@/redux/slices/adminSlice';

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { dashboardStats, recentActivity, loading, error } = useAppSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(getDashboardStats());
    dispatch(getRecentActivity(8));
  }, [dispatch]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
        <p className="text-red-800">Error loading dashboard: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Overview of your commerce platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          // Loading skeletons
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))
        ) : (
          dashboardStats && [
            { label: 'Total Users', value: dashboardStats.overview?.totalUsers || 0, icon: '👥', color: 'blue' },
            { label: 'Products', value: dashboardStats.overview?.totalProducts || 0, icon: '📦', color: 'green' },
            { label: 'Categories', value: dashboardStats.overview?.totalCategories || 0, icon: '📂', color: 'purple' },
            { label: 'Orders', value: dashboardStats.overview?.totalOrders || 0, icon: '📋', color: 'orange' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-lg font-semibold text-gray-900">{(stat.value || 0).toLocaleString()}</p>
                </div>
                <span className="text-lg">{stat.icon}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Growth Stats */}
      {dashboardStats && dashboardStats.overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Activity (30 days)</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Recent Products</span>
                <span className="text-sm font-medium text-green-600">
                  {dashboardStats.overview.recentProducts || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Recent Users</span>
                <span className="text-sm font-medium text-blue-600">
                  {dashboardStats.overview.recentUsers || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Top Categories</h3>
            <div className="space-y-2">
              {dashboardStats.topCategories?.slice(0, 3).map((category, index) => (
                <div key={category.slug} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{category.name}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {category.productCount} products
                  </span>
                </div>
              )) || (
                <p className="text-sm text-gray-500">No categories found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="space-y-3">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity._id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-xs">
                      {activity.type === 'user' ? '👤' : 
                       activity.type === 'order' ? '📋' : 
                       activity.type === 'product' ? '📦' : '⚙️'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getDashboardStats, getRecentActivity } from '@/redux/slices/adminSlice';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Activity,
  Clock,
  Eye,
  ArrowUpRight,
  Target,
  Zap,
  Globe
} from 'lucide-react';
import MetricCard, { MetricCardSkeleton } from '@/components/ui/MetricCard';
import { SalesChart, CategoryPieChart, RevenueLineChart, UserGrowthChart } from '@/components/charts/AnalyticsCharts';

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { dashboardStats, recentActivity, loading, error } = useAppSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(getDashboardStats());
    dispatch(getRecentActivity(8));
  }, [dispatch]);

  // Enhanced mock data with realistic e-commerce metrics
  const salesData = [
    { month: 'Jan', sales: 65000, orders: 240, customers: 180 },
    { month: 'Feb', sales: 59000, orders: 200, customers: 165 },
    { month: 'Mar', sales: 80000, orders: 300, customers: 220 },
    { month: 'Apr', sales: 81000, orders: 320, customers: 245 },
    { month: 'May', sales: 56000, orders: 180, customers: 190 },
    { month: 'Jun', sales: 95000, orders: 380, customers: 285 },
  ];

  const categoryData = dashboardStats?.topCategories?.map((category, index) => ({
    name: category.name,
    value: category.productCount,
    color: ['#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb'][index % 5]
  })) || [
    { name: 'Electronics', value: 45, color: '#374151' },
    { name: 'Clothing', value: 30, color: '#6b7280' },
    { name: 'Books', value: 15, color: '#9ca3af' },
    { name: 'Home & Garden', value: 10, color: '#d1d5db' }
  ];

  const revenueData = [
    { day: 'Mon', revenue: 12000 },
    { day: 'Tue', revenue: 15000 },
    { day: 'Wed', revenue: 8000 },
    { day: 'Thu', revenue: 22000 },
    { day: 'Fri', revenue: 18000 },
    { day: 'Sat', revenue: 25000 },
    { day: 'Sun', revenue: 20000 }
  ];

  const userGrowthData = [
    { month: 'Jan', users: 120 },
    { month: 'Feb', users: 145 },
    { month: 'Mar', users: 180 },
    { month: 'Apr', users: 220 },
    { month: 'May', users: 195 },
    { month: 'Jun', users: 280 }
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <Activity className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-800 text-sm">
            {typeof error === 'string' ? error : 
             typeof error === 'object' && error && 'message' in error ? 
             (typeof (error as any).message === 'string' ? (error as any).message : 'Failed to load dashboard') :
             'An error occurred while loading dashboard data'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Enhanced Professional Header */}
        <div className="bg-gradient-to-r from-white via-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl shadow-lg backdrop-blur-sm">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-slate-600 mt-2 text-lg">
                  Welcome back! Here's what's happening with your business today.
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="bg-white/70 backdrop-blur-sm border border-blue-200 px-4 py-2 rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-pulse"></div>
                    <span className="text-slate-700 font-semibold">Live Data</span>
                  </div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm border border-blue-200 px-4 py-2 rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <span className="text-slate-700 font-semibold">System Healthy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Metrics Grid with Gradients */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => <MetricCardSkeleton key={i} />)
          ) : (
            <>
              <div className="bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-gray-100 text-sm font-medium">+12.5%</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {(dashboardStats?.overview?.totalUsers || 1250).toLocaleString()}
                  </div>
                  <div className="text-gray-100 font-medium">Total Users</div>
                  <div className="text-gray-200 text-sm mt-1">+12.5% from last month</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-gray-100 text-sm font-medium">+8.2%</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {(dashboardStats?.overview?.totalProducts || 3).toLocaleString()}
                  </div>
                  <div className="text-gray-100 font-medium">Products</div>
                  <div className="text-gray-200 text-sm mt-1">+8.2% from last month</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                      <ShoppingBag className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-gray-100 text-sm font-medium">+23.1%</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {(dashboardStats?.overview?.totalOrders || 2340).toLocaleString()}
                  </div>
                  <div className="text-gray-100 font-medium">Total Orders</div>
                  <div className="text-gray-200 text-sm mt-1">+23.1% from last month</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-gray-100 text-sm font-medium">+15.8%</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    ₹{(420000).toLocaleString('en-IN')}
                  </div>
                  <div className="text-gray-100 font-medium">Revenue</div>
                  <div className="text-gray-200 text-sm mt-1">+15.8% from last month</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Enhanced Charts Section with Modern Design */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Analytics */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-slate-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Sales Analytics</h3>
                  <p className="text-slate-600 mt-1">Monthly performance overview</p>
                </div>
                <div className="flex items-center space-x-2 text-emerald-700 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-2 rounded-xl border border-emerald-200">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-bold text-sm">+18.2%</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <SalesChart data={salesData} />
            </div>
          </div>

          {/* Revenue Trend */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-slate-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Weekly Revenue</h3>
                  <p className="text-slate-600 mt-1">Last 7 days performance</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-3 rounded-xl">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="p-6">
              <RevenueLineChart data={revenueData} />
            </div>
          </div>
        </div>

        {/* Enhanced Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Distribution */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-slate-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Product Distribution</h3>
                  <p className="text-slate-600 mt-1">By categories</p>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 p-3 rounded-xl">
                  <Target className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </div>
            <div className="p-6">
              <CategoryPieChart data={categoryData} />
              <div className="mt-6 space-y-3">
                {categoryData.slice(0, 4).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200/50">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-sm text-slate-500 bg-white px-2 py-1 rounded-md">{item.value} products</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Growth */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-slate-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">User Growth</h3>
                  <p className="text-slate-600 mt-1">New registrations</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-3 rounded-xl">
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
            <div className="p-6">
              <UserGrowthChart data={userGrowthData} />
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center space-x-2 text-green-800">
                  <Users className="h-5 w-5" />
                  <span className="font-bold text-sm">280 new users this month</span>
                </div>
                <p className="text-green-600 text-sm mt-1 font-medium">+28% increase from last month</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-slate-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
                  <p className="text-slate-600 mt-1">Latest updates</p>
                </div>
                <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-3 py-2 rounded-xl">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4">
                      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {recentActivity.map((activity) => (
                    <div key={activity._id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-sm">
                          {activity.type === 'user_registered' ? '👤' : 
                           activity.type === 'product_created' ? '📦' : '⚡'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600 mb-1">{activity.subtitle}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {activity.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="h-6 w-6 text-gray-400" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">No Recent Activity</h4>
                  <p className="text-gray-500 text-xs">Activity will appear here when users interact with your store</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
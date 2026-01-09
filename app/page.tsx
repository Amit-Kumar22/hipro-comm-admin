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
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
  })) || [
    { name: 'Electronics', value: 45, color: '#3B82F6' },
    { name: 'Clothing', value: 30, color: '#10B981' },
    { name: 'Books', value: 15, color: '#F59E0B' },
    { name: 'Home & Garden', value: 10, color: '#EF4444' }
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
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-8 space-y-10">
        {/* Enhanced Colorful Header */}
        <div className="text-center lg:text-left bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 p-8 rounded-3xl shadow-2xl shadow-purple-500/30">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent drop-shadow-lg">
            🚀 Analytics Dashboard
          </h1>
          <p className="text-white/90 mt-3 text-xl font-medium">
            ✨ Real-time insights into your e-commerce performance
          </p>
          <div className="flex items-center justify-center lg:justify-start space-x-6 mt-6">
            <div className="flex items-center space-x-2 text-sm text-white bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <Globe className="h-5 w-5 text-green-300" />
              <span className="font-semibold">🌍 Live Data</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-white bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <Zap className="h-5 w-5 text-yellow-300" />
              <span className="font-semibold">⚡ System Healthy</span>
            </div>
          </div>
        </div>

        {/* Enhanced Colorful Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => <MetricCardSkeleton key={i} />)
          ) : (
            <>
              <MetricCard
                title="Total Users"
                value={dashboardStats?.overview?.totalUsers || 1250}
                change={{ value: 12.5, type: 'increase', period: 'last month' }}
                icon={<Users className="h-6 w-6" />}
                colorScheme="blue"
                format="number"
              />
              <MetricCard
                title="Products"
                value={dashboardStats?.overview?.totalProducts || 890}
                change={{ value: 8.2, type: 'increase', period: 'last month' }}
                icon={<Package className="h-6 w-6" />}
                colorScheme="green"
                format="number"
              />
              <MetricCard
                title="Total Orders"
                value={dashboardStats?.overview?.totalOrders || 2340}
                change={{ value: 23.1, type: 'increase', period: 'last month' }}
                icon={<ShoppingBag className="h-6 w-6" />}
                colorScheme="purple"
                format="number"
              />
              <MetricCard
                title="Revenue"
                value={420000}
                change={{ value: 15.8, type: 'increase', period: 'last month' }}
                icon={<DollarSign className="h-6 w-6" />}
                colorScheme="orange"
                format="currency"
              />
            </>
          )}
        </div>

        {/* Enhanced Colorful Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Sales Analytics */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl shadow-2xl shadow-blue-500/20 border-2 border-blue-200/50 p-10 hover:shadow-3xl hover:shadow-blue-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">📊 Sales Analytics</h3>
                <p className="text-blue-600/80 mt-2 text-lg font-medium">Monthly performance overview</p>
              </div>
              <div className="flex items-center space-x-2 text-green-700 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-3 rounded-xl shadow-lg">
                <TrendingUp className="h-6 w-6" />
                <span className="font-bold text-lg">+18.2%</span>
              </div>
            </div>
            <SalesChart data={salesData} />
          </div>

          {/* Revenue Trend */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-2xl shadow-purple-500/20 border-2 border-purple-200/50 p-10 hover:shadow-3xl hover:shadow-purple-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">💰 Weekly Revenue</h3>
                <p className="text-purple-600/80 mt-2 text-lg font-medium">Last 7 days performance</p>
              </div>
              <div className="text-purple-500 bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-xl shadow-lg">
                <Activity className="h-8 w-8" />
              </div>
            </div>
            <RevenueLineChart data={revenueData} />
          </div>
        </div>

        {/* Additional Colorful Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Category Distribution */}
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl shadow-2xl shadow-orange-500/20 border-2 border-orange-200/50 p-10 hover:shadow-3xl hover:shadow-orange-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">🎯 Product Distribution</h3>
                <p className="text-orange-600/80 mt-2 text-lg font-medium">By categories</p>
              </div>
              <Target className="h-8 w-8 text-orange-500 bg-gradient-to-r from-orange-100 to-yellow-100 p-2 rounded-xl shadow-lg" />
            </div>
            <CategoryPieChart data={categoryData} />
            <div className="mt-6 space-y-3">
              {categoryData.slice(0, 4).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{item.value} products</span>
                </div>
              ))}
            </div>
          </div>

          {/* User Growth */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-2xl shadow-green-500/20 border-2 border-green-200/50 p-10 hover:shadow-3xl hover:shadow-green-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">📈 User Growth</h3>
                <p className="text-green-600/80 mt-2 text-lg font-medium">New registrations</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-green-500 bg-gradient-to-r from-green-100 to-emerald-100 p-2 rounded-xl shadow-lg" />
            </div>
            <UserGrowthData data={userGrowthData} />
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-700">
                <Users className="h-5 w-5" />
                <span className="font-semibold">280 new users this month</span>
              </div>
              <p className="text-blue-600 text-sm mt-1">+28% increase from last month</p>
            </div>
          </div>

          {/* Recent Activity Enhanced */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl shadow-2xl shadow-indigo-500/20 border-2 border-indigo-200/50 p-10 hover:shadow-3xl hover:shadow-indigo-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">⚡ Live Activity</h3>
                <p className="text-indigo-600/80 mt-2 text-lg font-medium">Real-time updates</p>
              </div>
              <div className="flex items-center space-x-3 bg-gradient-to-r from-indigo-100 to-blue-100 px-4 py-2 rounded-xl shadow-lg">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg"></div>
                <Clock className="h-6 w-6 text-indigo-500" />
              </div>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
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
                  <div key={activity._id} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors group">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="text-white text-lg">
                        {activity.type === 'user_registered' ? '👤' : 
                         activity.type === 'product_created' ? '📦' : '⚡'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 mb-1">{activity.title}</p>
                      <p className="text-sm text-gray-600 mb-2">{activity.subtitle}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">
                          {new Date(activity.timestamp).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {activity.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h4>
                <p className="text-gray-500 text-sm">Activity will appear here when users interact with your store</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for User Growth
function UserGrowthData({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" stroke="#666" fontSize={11} />
        <YAxis stroke="#666" fontSize={11} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Area 
          type="monotone" 
          dataKey="users" 
          stroke="#3B82F6" 
          fill="url(#colorUsers)" 
          strokeWidth={2}
        />
        <defs>
          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
          </linearGradient>
        </defs>
      </AreaChart>
    </ResponsiveContainer>
  );
}
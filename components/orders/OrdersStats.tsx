'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchOrderStats } from '../../redux/slices/adminOrdersSlice';

export default function OrdersStats() {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading } = useSelector((state: RootState) => state.adminOrders);

  useEffect(() => {
    dispatch(fetchOrderStats());
  }, [dispatch]);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg shadow-xl shadow-slate-500/20 border-2 border-slate-200/50 p-3">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded-lg mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: '📋',
      gradient: 'from-slate-50 to-blue-50',
      iconGradient: 'from-slate-500 to-slate-600',
      textGradient: 'from-slate-600 to-slate-700',
      labelColor: 'text-slate-600'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: '💰',
      gradient: 'from-green-50 to-emerald-50',
      iconGradient: 'from-green-500 to-emerald-500',
      textGradient: 'from-green-600 to-emerald-600',
      labelColor: 'text-green-600'
    },
    {
      title: "Today's Orders",
      value: stats.todaysOrders.toLocaleString(),
      icon: '📅',
      gradient: 'from-purple-50 to-pink-50',
      iconGradient: 'from-purple-500 to-pink-500',
      textGradient: 'from-purple-600 to-pink-600',
      labelColor: 'text-purple-600'
    },
    {
      title: "Today's Revenue",
      value: `₹${stats.todaysRevenue.toLocaleString()}`,
      icon: '💳',
      gradient: 'from-amber-50 to-orange-50',
      iconGradient: 'from-amber-500 to-orange-500',
      textGradient: 'from-amber-600 to-orange-600',
      labelColor: 'text-amber-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {statCards.map((stat) => (
        <div key={stat.title} className={`bg-gradient-to-br ${stat.gradient} rounded-lg shadow-xl shadow-slate-500/20 border-2 border-slate-200/50 p-3 hover:scale-105 transition-all duration-300`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`bg-gradient-to-r ${stat.iconGradient} text-white p-2 rounded-lg shadow-lg`}>
              <span className="text-sm">{stat.icon}</span>
            </div>
            <span className="text-base">{stat.icon}</span>
          </div>
          <h3 className={`text-lg font-bold bg-gradient-to-r ${stat.textGradient} bg-clip-text text-transparent`}>
            {stat.value}
          </h3>
          <p className={`${stat.labelColor} font-semibold text-xs`}>{stat.title}</p>
        </div>
      ))}
    </div>
  );
}
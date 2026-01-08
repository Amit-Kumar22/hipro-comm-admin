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
          <div key={i} className="bg-white rounded border p-3">
            <div className="animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
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
      color: 'text-blue-600'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: '💰',
      color: 'text-green-600'
    },
    {
      title: "Today's Orders",
      value: stats.todaysOrders.toLocaleString(),
      icon: '📅',
      color: 'text-purple-600'
    },
    {
      title: "Today's Revenue",
      value: `₹${stats.todaysRevenue.toLocaleString()}`,
      icon: '💳',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {statCards.map((stat) => (
        <div key={stat.title} className="bg-white rounded border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">{stat.title}</p>
              <p className={`text-lg font-semibold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
            <div className="text-xl">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
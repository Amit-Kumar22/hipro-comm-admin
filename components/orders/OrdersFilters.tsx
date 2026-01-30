'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { setFilters, clearFilters, fetchAllOrders } from '../../redux/slices/adminOrdersSlice';

export default function OrdersFilters() {
  const dispatch = useDispatch<AppDispatch>();
  const { filters } = useSelector((state: RootState) => state.adminOrders);
  
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || '');

  const handleSearch = () => {
    const newFilters = {
      ...(search.trim() && { search: search.trim() }),
      ...(status && { status })
    };
    dispatch(setFilters(newFilters));
    dispatch(fetchAllOrders({ page: 1, ...newFilters }));
  };

  const handleClear = () => {
    setSearch('');
    setStatus('');
    dispatch(clearFilters());
    dispatch(fetchAllOrders({ page: 1 }));
  };

  const hasFilters = search || status;

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg">
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 border-b border-slate-200">
        <h2 className="text-base font-bold text-slate-700">🔍 Filters & Search</h2>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="🔍 Search orders, customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-slate-50 hover:bg-white"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-slate-50 hover:bg-white"
          >
            <option value="">📊 All Status</option>
            <option value="PENDING">🔄 Pending</option>
            <option value="PAID">💳 Paid</option>
            <option value="SHIPPED">🚚 Shipped</option>
            <option value="DELIVERED">✅ Delivered</option>
            <option value="CANCELLED">❌ Cancelled</option>
          </select>

          <button
            onClick={handleSearch}
            className="px-4 py-2 text-sm bg-gradient-to-r from-slate-500 to-blue-500 text-white rounded-lg hover:from-slate-600 hover:to-blue-600 transition-all duration-300 shadow-lg font-medium"
          >
            🔍 Filter
          </button>

          {hasFilters && (
            <button
              onClick={handleClear}
              className="px-3 py-2 text-sm bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-lg hover:from-red-500 hover:to-pink-600 transition-all duration-300 shadow-lg font-medium"
            >
              ✖ Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
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
    <div className="bg-white rounded border p-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search orders, customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <button
          onClick={handleSearch}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Filter
        </button>

        {hasFilters && (
          <button
            onClick={handleClear}
            className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
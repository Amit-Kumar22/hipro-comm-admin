'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getAllUsers, updateUserRole, deleteUser } from '@/redux/slices/adminSlice';
import { 
  Users, 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Crown, 
  Mail, 
  Calendar,
  MoreVertical,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Download,
  RefreshCw,
  AlertCircle,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { users, usersPagination, loading, error } = useAppSelector((state) => state.admin);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Load users with filters
  useEffect(() => {
    dispatch(getAllUsers({
      page: currentPage,
      limit: 20,
      search: searchTerm || undefined,
      role: roleFilter !== 'all' ? roleFilter as 'admin' | 'customer' : undefined
    }));
  }, [dispatch, currentPage, searchTerm, roleFilter]);

  const handleRoleChange = async (userId: string, newRole: 'customer' | 'admin') => {
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      await dispatch(updateUserRole({ userId, role: newRole }));
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      await dispatch(deleteUser(userId));
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    dispatch(getAllUsers({
      page: currentPage,
      limit: 20,
      search: searchTerm || undefined,
      role: roleFilter !== 'all' ? roleFilter as 'admin' | 'customer' : undefined
    }));
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
  };

  // Stats calculations
  const stats = {
    total: usersPagination?.totalCount || 0,
    admins: users.filter(u => u.role === 'admin').length,
    customers: users.filter(u => u.role === 'customer').length,
    verified: users.filter(u => u.isEmailVerified).length
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl shadow-red-500/20 border-2 border-red-200/50 p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-6">
            <AlertCircle className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-red-900 mb-4">Error Loading Users</h3>
          <p className="text-red-800 mb-6">{error}</p>
          <button 
            onClick={handleRefresh}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl shadow-indigo-500/30 p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">👥 Users Management</h1>
            <p className="text-indigo-100 text-lg">Manage user accounts, roles, and permissions</p>
          </div>
          <div className="flex items-center space-x-4 mt-6 lg:mt-0">
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-300"
            >
              <RefreshCw className="h-5 w-5" />
              <span className="font-medium">Refresh</span>
            </button>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-green-400 to-emerald-500 px-4 py-2 rounded-xl hover:from-green-500 hover:to-emerald-600 transition-all duration-300 shadow-lg">
              <Plus className="h-5 w-5" />
              <span className="font-medium">Add User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compact Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-2xl shadow-blue-500/20 border-2 border-blue-200/50 p-4 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-2 rounded-lg shadow-xl shadow-blue-500/30">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-lg">👥</span>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {stats.total.toLocaleString()}
          </h3>
          <p className="text-blue-600 font-semibold text-sm">Total Users</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-2xl shadow-green-500/20 border-2 border-green-200/50 p-4 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-2 rounded-lg shadow-xl shadow-green-500/30">
              <UserCheck className="h-5 w-5" />
            </div>
            <span className="text-lg">🛒</span>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {stats.customers.toLocaleString()}
          </h3>
          <p className="text-green-600 font-semibold text-sm">Customers</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-2xl shadow-purple-500/20 border-2 border-purple-200/50 p-4 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-lg shadow-xl shadow-purple-500/30">
              <Crown className="h-5 w-5" />
            </div>
            <span className="text-lg">👑</span>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {stats.admins.toLocaleString()}
          </h3>
          <p className="text-purple-600 font-semibold text-sm">Admins</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl shadow-2xl shadow-orange-500/20 border-2 border-orange-200/50 p-4 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-2 rounded-lg shadow-xl shadow-orange-500/30">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-lg">✅</span>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
            {stats.verified.toLocaleString()}
          </h3>
          <p className="text-orange-600 font-semibold text-sm">Verified</p>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-2xl shadow-2xl shadow-gray-500/10 border-2 border-gray-200/50 p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="flex items-center space-x-3 mb-4 lg:mb-0">
            <Filter className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Filters & Search</h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-4 py-2 rounded-xl hover:from-indigo-200 hover:to-purple-200 transition-all duration-300"
            >
              <Eye className="h-4 w-4" />
              <span className="font-medium">{viewMode === 'table' ? 'Grid View' : 'Table View'}</span>
            </button>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-4 py-2 rounded-xl hover:from-green-200 hover:to-emerald-200 transition-all duration-300">
              <Download className="h-4 w-4" />
              <span className="font-medium">Export</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
            />
          </form>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
          >
            <option value="all">🌟 All Roles</option>
            <option value="customer">🛒 Customers</option>
            <option value="admin">👑 Admins</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
          >
            <option value="all">📊 All Status</option>
            <option value="verified">✅ Verified</option>
            <option value="unverified">❌ Unverified</option>
          </select>
        </div>

        {selectedUsers.length > 0 && (
          <div className="mt-6 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border-2 border-indigo-200/50">
            <span className="text-indigo-700 font-medium">
              {selectedUsers.length} user(s) selected
            </span>
            <div className="flex space-x-3">
              <button className="bg-gradient-to-r from-red-400 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-500 hover:to-pink-600 transition-all duration-300 shadow-lg text-sm font-medium">
                Delete Selected
              </button>
              <button className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-blue-500 hover:to-indigo-600 transition-all duration-300 shadow-lg text-sm font-medium">
                Bulk Actions
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Users Table */}
      <div className="bg-white rounded-2xl shadow-2xl shadow-gray-500/10 border-2 border-gray-200/50 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b-2 border-gray-200/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-900">
                👥 Users List ({usersPagination?.totalCount || 0})
              </h3>
            </div>
            {loading && (
              <div className="flex items-center text-sm text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                <span className="font-medium">Loading...</span>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={selectAllUsers}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  👤 User Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  🏷️ Role & Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  📅 Joined Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  ⚡ Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">{loading ? (
                // Enhanced Loading skeletons
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="animate-pulse h-4 w-4 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="animate-pulse flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
                        <div>
                          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-48"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="animate-pulse">
                        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20 mb-2"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="animate-pulse h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="animate-pulse flex space-x-2">
                        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20"></div>
                        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => toggleUserSelection(user._id)}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/30">
                          <span className="text-white font-bold text-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-600 flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full shadow-lg ${
                          user.role === 'admin' 
                            ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-2 border-purple-200' 
                            : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-200'
                        }`}>
                          {user.role === 'admin' ? '👑' : '🛒'} {user.role}
                        </span>
                        <div className="flex items-center space-x-1">
                          {user.isEmailVerified ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-red-100 to-pink-100 text-red-700">
                              <XCircle className="h-3 w-3 mr-1" />
                              Unverified
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(user.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value as 'customer' | 'admin')}
                          className="text-xs border-2 border-indigo-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 font-medium"
                          disabled={loading}
                        >
                          <option value="customer">🛒 Customer</option>
                          <option value="admin">👑 Admin</option>
                        </select>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            disabled={loading}
                            className="bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white px-3 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 shadow-lg text-xs font-medium"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <Users className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-600">Try adjusting your search criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination */}
        {usersPagination && usersPagination.totalPages > 1 && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t-2 border-gray-200/50">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-700 font-medium">
                📊 Page {usersPagination.currentPage} of {usersPagination.totalPages} 
                <span className="text-indigo-600 ml-2">
                  ({usersPagination.totalCount} total users)
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!usersPagination.hasPrev}
                  className="bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg text-sm font-medium"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!usersPagination.hasNext}
                  className="bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg text-sm font-medium"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
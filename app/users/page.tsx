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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Users</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-4">
      {/* Professional Header */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Users Management</h1>
              <p className="text-gray-600 text-sm mt-1">Manage user accounts, roles, and permissions</p>
            </div>
            <div className="flex items-center space-x-2 mt-3 sm:mt-0">
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 rounded-md transition-colors text-sm">
                <Plus className="h-4 w-4" />
                <span>Add User</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-gray-100 text-gray-700 p-2 rounded-md">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {stats.total.toLocaleString()}
          </h3>
          <p className="text-gray-600 text-xs">Total Users</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-gray-100 text-gray-700 p-2 rounded-md">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {stats.customers.toLocaleString()}
          </h3>
          <p className="text-gray-600 text-xs">Customers</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-gray-100 text-gray-700 p-2 rounded-md">
              <Crown className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {stats.admins.toLocaleString()}
          </h3>
          <p className="text-gray-600 text-xs">Admins</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-gray-100 text-gray-700 p-2 rounded-md">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {stats.verified.toLocaleString()}
          </h3>
          <p className="text-gray-600 text-xs">Verified</p>
        </div>
      </div>

      {/* Compact Filters */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2 mb-3 sm:mb-0">
              <Filter className="h-4 w-4 text-gray-500" />
              <h2 className="text-sm font-medium text-gray-900">Filters & Search</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm"
              >
                <Eye className="h-4 w-4" />
                <span>Grid View</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
              />
            </form>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="admin">Admins</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>

          {selectedUsers.length > 0 && (
            <div className="mt-3 flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200">
              <span className="text-gray-700 text-sm font-medium">
                {selectedUsers.length} user(s) selected
              </span>
              <div className="flex space-x-2">
                <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md transition-colors text-sm">
                  Delete Selected
                </button>
                <button className="bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-md transition-colors text-sm">
                  Bulk Actions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compact Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-900">
                Users List ({usersPagination?.totalCount || 0})
              </h3>
            </div>
            {loading && (
              <div className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                <span>Loading...</span>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={selectAllUsers}
                    className="rounded border-gray-300 text-gray-900 shadow-sm focus:border-gray-900 focus:ring focus:ring-gray-200"
                  />
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Role & Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">{loading ? (
                // Compact Loading skeletons
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="animate-pulse h-3 w-3 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="animate-pulse flex items-center space-x-3">
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                        <div>
                          <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-32"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="animate-pulse h-3 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="animate-pulse flex space-x-2">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-6 bg-gray-200 rounded w-12"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => toggleUserSelection(user._id)}
                        className="rounded border-gray-300 text-gray-900 shadow-sm focus:border-gray-900 focus:ring focus:ring-gray-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-600 flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                        <div className="flex items-center space-x-1">
                          {user.isEmailVerified ? (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Unverified
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(user.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value as 'customer' | 'admin')}
                          className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                          disabled={loading}
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                        </select>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md transition-colors disabled:opacity-50 text-xs"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <div className="text-gray-400 mb-3">
                      <Users className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No users found</h3>
                    <p className="text-gray-600 text-xs">Try adjusting your search criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Compact Pagination */}
        {usersPagination && usersPagination.totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <div className="text-xs text-gray-700">
                Page {usersPagination.currentPage} of {usersPagination.totalPages} 
                <span className="text-gray-600 ml-2">
                  ({usersPagination.totalCount} total users)
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!usersPagination.hasPrev}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!usersPagination.hasNext}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
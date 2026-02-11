import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Briefcase, Mail, Calendar, Trash2, Filter, ChevronLeft } from 'lucide-react';

const UserManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState(null);
  const [loginHistory, setLoginHistory] = useState(null);
  const [loginStats, setLoginStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'login-history'

  useEffect(() => {
    // Only admins can access this page
    if (user && user.role !== 'admin') {
      navigate('/');
      return;
    }

    if (!user) {
      navigate('/signin');
      return;
    }

    fetchAllUsers();
  }, [user, navigate]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, historyRes, statsRes] = await Promise.all([
        fetch('http://localhost:5001/api/auth/users/all'),
        fetch('http://localhost:5001/api/auth/login-history'),
        fetch('http://localhost:5001/api/auth/login-stats')
      ]);
      
      const usersData = await usersRes.json();
      const historyData = await historyRes.json();
      const statsData = await statsRes.json();
      
      setAllUsers(usersData);
      setLoginHistory(historyData);
      setLoginStats(statsData);
      console.log('✅ Users and login history loaded');
    } catch (err) {
      console.error('❌ Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!allUsers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load users</p>
        </div>
      </div>
    );
  }

  // Get users based on filter
  let displayUsers = [];
  if (filterRole === 'all') {
    displayUsers = [
      ...allUsers.customers,
      ...allUsers.businessOwners,
      ...allUsers.admins
    ];
  } else if (filterRole === 'customer') {
    displayUsers = allUsers.customers;
  } else if (filterRole === 'business') {
    displayUsers = allUsers.businessOwners;
  } else if (filterRole === 'admin') {
    displayUsers = allUsers.admins;
  }

  // Filter by search term
  const filteredUsers = displayUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'customer':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'business':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'admin':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'customer':
        return '👤';
      case 'business':
        return '🏢';
      case 'admin':
        return '👑';
      default:
        return '👤';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Admin Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-10 h-10 text-blue-600" />
            User Management
          </h1>
          <p className="text-gray-600 mt-2">Manage all registered users: customers, business owners, and admins</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            👥 Registered Users
          </button>
          <button
            onClick={() => setActiveTab('login-history')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'login-history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 Login History
          </button>
        </div>

        {/* USERS TAB */}
        {activeTab === 'users' && allUsers && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{allUsers.total}</h3>
              </div>
              <Users className="w-12 h-12 text-gray-300" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Customers</p>
                <h3 className="text-3xl font-bold text-blue-600 mt-1">{allUsers.customers.length}</h3>
              </div>
              <UserCheck className="w-12 h-12 text-blue-300" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Business Owners</p>
                <h3 className="text-3xl font-bold text-green-600 mt-1">{allUsers.businessOwners.length}</h3>
              </div>
              <Briefcase className="w-12 h-12 text-green-300" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Admins</p>
                <h3 className="text-3xl font-bold text-red-600 mt-1">{allUsers.admins.length}</h3>
              </div>
              <span className="text-3xl">👑</span>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search by name or email</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="John Doe, user@example.com..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Filter by Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Users</option>
                <option value="customer">Customers Only</option>
                <option value="business">Business Owners Only</option>
                <option value="admin">Admins Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Business Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                            {u.name.charAt(0)}
                          </div>
                          <p className="font-medium text-gray-900">{u.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getRoleBadgeColor(u.role)}`}>
                          {getRoleIcon(u.role)} {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700 text-sm">
                          {u.businessName ? (
                            <span className="font-medium">{u.businessName}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(u.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-2 text-sm font-medium"
                          title="Delete user (coming soon)"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {allUsers && activeTab === 'users' && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-bold">📊 Total Registered Users:</span> {allUsers.total} 
              ({allUsers.customers.length} customers, {allUsers.businessOwners.length} business owners, {allUsers.admins.length} admins)
            </p>
          </div>
        )}
          </div>
        )}

        {/* LOGIN HISTORY TAB */}
        {activeTab === 'login-history' && loginStats && loginHistory && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Last 24 Hours</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">{loginStats.last24Hours.total}</h3>
                  <p className="text-xs text-green-600 mt-1">✓ {loginStats.last24Hours.success} success</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Last 7 Days</p>
                  <h3 className="text-3xl font-bold text-blue-600 mt-1">{loginStats.last7Days.total}</h3>
                  <p className="text-xs text-green-600 mt-1">✓ {loginStats.last7Days.success} success</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Last 30 Days</p>
                  <h3 className="text-3xl font-bold text-green-600 mt-1">{loginStats.last30Days.total}</h3>
                  <p className="text-xs text-red-600 mt-1">✗ {loginStats.last30Days.failed} failed</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div>
                <p className="text-gray-600 text-sm font-medium">By Role (Last 30 Days)</p>
                <div className="mt-2 space-y-1 text-xs">
                  <p>👤 Customer: <span className="font-bold">{loginStats.byRole.customer}</span></p>
                  <p>🏢 Business: <span className="font-bold">{loginStats.byRole.business}</span></p>
                  <p>👑 Admin: <span className="font-bold">{loginStats.byRole.admin}</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Login History Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Login Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loginHistory.history && loginHistory.history.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-medium">{log.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                          log.role === 'admin' ? 'bg-red-100 text-red-700 border-red-200' :
                          log.role === 'business' ? 'bg-green-100 text-green-700 border-green-200' :
                          'bg-blue-100 text-blue-700 border-blue-200'
                        }`}>
                          {log.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                          log.status === 'success' 
                            ? 'bg-green-100 text-green-700 border-green-200' 
                            : 'bg-red-100 text-red-700 border-red-200'
                        }`}>
                          {log.status === 'success' ? '✓ Success' : '✗ Failed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(log.loginTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;

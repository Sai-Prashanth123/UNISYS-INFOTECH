import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useThemeStore } from '../../store/index.js';
import { adminAPI } from '../../api/endpoints.js';
import { toast } from 'react-toastify';
import { UserPlus, Edit2, Trash2, Power, PowerOff, Users, Briefcase, RefreshCw, Loader2, Wifi, WifiOff, Search, X, Save, UserCheck, UserX, Building2 } from 'lucide-react';
import supabase from '../../config/supabase.js';

/**
 * Admin User Management Page
 * Create and manage Employer and Employee accounts
 * Features:
 * - Real-time updates via Supabase subscriptions
 * - Create new users with role assignment
 * - Assign employees to employers
 * - Edit user details
 * - Activate/deactivate accounts
 * - Delete users
 */
export const AdminUserManagement = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const [users, setUsers] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filterRole, setFilterRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    employerId: '',
    designation: '',
    department: '',
    hourlyPay: '',
    endClient: '',
    endClientReportingMail: ''
  });

  // Fetch users
  const fetchUsers = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const params = filterRole ? { role: filterRole } : {};
      const response = await adminAPI.getUsers(params);
      setUsers(response.data.users || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterRole]);

  // Fetch employers
  const fetchEmployers = useCallback(async () => {
    try {
      const response = await adminAPI.getEmployers();
      setEmployers(response.data.employers || []);
    } catch (error) {
      console.error('Failed to fetch employers');
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
    fetchEmployers();
  }, [fetchUsers, fetchEmployers]);

  // Refetch when filter changes
  useEffect(() => {
    fetchUsers(true);
  }, [filterRole]);

  // Set up Supabase real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('user-management-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log('User change detected:', payload.eventType);
          // Refetch data on any change
          fetchUsers(true);
          fetchEmployers();
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUsers, fetchEmployers]);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.designation?.toLowerCase().includes(term) ||
      user.department?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  // Stats - handle both isActive and is_active field names
  const stats = useMemo(() => {
    const total = users.length;
    const employees = users.filter(u => u.role === 'employee').length;
    const employersCount = users.filter(u => u.role === 'employer').length;
    const active = users.filter(u => u.isActive === true || u.is_active === true).length;
    const inactive = users.filter(u => u.isActive === false || u.is_active === false).length;
    return { total, employees, employers: employersCount, active, inactive };
  }, [users]);

  // Handle create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        designation: formData.designation || undefined,
        department: formData.department || undefined,
        hourlyPay: formData.hourlyPay ? parseFloat(formData.hourlyPay) : (formData.role === 'employee' || formData.role === 'employer' ? 0 : undefined)
      };
      
      // Validate hourlyPay is required for employee/employer
      if ((formData.role === 'employee' || formData.role === 'employer') && (!formData.hourlyPay || parseFloat(formData.hourlyPay) <= 0)) {
        toast.error('Hourly Pay is required and must be greater than 0 for employees and employers');
        setSaving(false);
        return;
      }

      if (formData.role === 'employee' && formData.employerId) {
        payload.employerId = formData.employerId;
      }

      await adminAPI.createUser(payload);
      toast.success(`${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} account created successfully!`);
      setShowCreateModal(false);
      resetForm();
      // Data will auto-refresh via real-time subscription
    } catch (error) {
      console.error('Create user error:', error.response?.data);
      toast.error(error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  // Handle edit user
  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        designation: formData.designation || undefined,
        department: formData.department || undefined,
        hourlyPay: formData.hourlyPay ? parseFloat(formData.hourlyPay) : (editingUser.role === 'employee' || editingUser.role === 'employer' ? 0 : undefined)
      };
      
      // Validate hourlyPay is required for employee/employer
      if ((editingUser.role === 'employee' || editingUser.role === 'employer') && (!formData.hourlyPay || parseFloat(formData.hourlyPay) <= 0)) {
        toast.error('Hourly Pay is required and must be greater than 0 for employees and employers');
        setSaving(false);
        return;
      }

      // Only allow changing employer assignment for employees
      if (editingUser.role === 'employee' && formData.employerId) {
        payload.employerId = formData.employerId;
      }

      await adminAPI.updateUser(editingUser._id, payload);
      toast.success('User updated successfully!');
      setShowEditModal(false);
      setEditingUser(null);
      resetForm();
      // Data will auto-refresh via real-time subscription
    } catch (error) {
      console.error('Update user error:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  // Open edit modal
  const openEditModal = (user) => {
    const userWithId = { ...user, _id: user._id || user.id };
    setEditingUser(userWithId);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'employee',
      employerId: user.employerId?._id || user.employerId?.id || user.employerId || '',
      designation: user.designation || '',
      department: user.department || '',
      hourlyPay: user.hourlyPay || user.hourly_pay || '',
      endClient: user.endClient || '',
      endClientReportingMail: user.endClientReportingMail || ''
    });
    setShowEditModal(true);
  };

  // Handle toggle status
  const handleToggleStatus = async (userId, currentStatus) => {
    setTogglingId(userId);
    try {
      const response = await adminAPI.updateUserStatus(userId, !currentStatus);
      const newStatus = !currentStatus;
      
      // Show success toast with icon
      if (newStatus) {
        toast.success('✅ User activated successfully!', {
          autoClose: 3000,
          style: { background: '#065f46', color: '#fff' }
        });
      } else {
        toast.info('🔒 User deactivated', {
          autoClose: 3000,
          style: { background: '#7c3aed', color: '#fff' }
        });
      }
      
      // Immediately update the local state for instant feedback
      setUsers(prevUsers => 
        prevUsers.map(u => {
          const uId = u._id || u.id;
          return uId === userId ? { ...u, isActive: newStatus, is_active: newStatus } : u;
        })
      );
      
      // Data will also auto-refresh via real-time subscription
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update user status. Please try again.');
    } finally {
      setTogglingId(null);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(userId);
    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      // Data will auto-refresh via real-time subscription
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee',
      employerId: '',
      designation: '',
      department: '',
      hourlyPay: '',
      endClient: '',
      endClientReportingMail: ''
    });
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-600';
      case 'employer': return 'bg-indigo-600';
      case 'employee': return 'bg-blue-600';
      default: return 'bg-slate-600';
    }
  };

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const now = new Date();
    const diff = Math.floor((now - lastUpdated) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastUpdated.toLocaleTimeString();
  };

  // Skeleton Components
  const TableRowSkeleton = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full"></div>
          <div>
            <div className="w-32 h-4 bg-white/20 rounded mb-2"></div>
            <div className="w-40 h-3 bg-white/10 rounded"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><div className="w-20 h-6 bg-white/20 rounded-full"></div></td>
      <td className="px-6 py-4"><div className="w-24 h-4 bg-white/20 rounded"></div></td>
      <td className="px-6 py-4 text-center"><div className="w-16 h-6 bg-white/20 rounded-full mx-auto"></div></td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
          <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
          <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
        </div>
      </td>
    </tr>
  );

  const StatCardSkeleton = () => (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-lg"></div>
        <div>
          <div className="w-8 h-6 bg-white/20 rounded mb-1"></div>
          <div className="w-16 h-3 bg-white/10 rounded"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white">User Management</h1>
            <p className="text-slate-300">Create and manage employer and employee accounts</p>
            {lastUpdated && (
              <p className="text-slate-500 text-sm mt-1">Last updated: {formatLastUpdated()}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
              <span className="text-sm font-medium">{isConnected ? 'Live' : 'Offline'}</span>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={() => fetchUsers(true)}
              disabled={refreshing || loading}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300"
              title="Refresh data"
            >
              <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            </button>

            {/* Create User Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <UserPlus size={20} />
              Create User
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[1, 2, 3, 4, 5].map(i => <StatCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-slate-400 text-xs">Total Users</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Building2 className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.employers}</p>
                  <p className="text-slate-400 text-xs">Employers</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Briefcase className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.employees}</p>
                  <p className="text-slate-400 text-xs">Employees</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <UserCheck className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.active}</p>
                  <p className="text-slate-400 text-xs">Active</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <UserX className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.inactive}</p>
                  <p className="text-slate-400 text-xs">Inactive</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-lg mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, designation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterRole('')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  filterRole === '' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                All Users
              </button>
              <button
                onClick={() => setFilterRole('employer')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  filterRole === 'employer' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Employers
              </button>
              <button
                onClick={() => setFilterRole('employee')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  filterRole === 'employee' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Employees
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-white">User</th>
                  <th className="px-6 py-4 text-left font-semibold text-white">Role</th>
                  <th className="px-6 py-4 text-left font-semibold text-white">Employer</th>
                  <th className="px-6 py-4 text-center font-semibold text-white">Status</th>
                  <th className="px-6 py-4 text-center font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  // Skeleton rows
                  [...Array(5)].map((_, i) => <TableRowSkeleton key={`skeleton-${i}`} />)
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map(user => {
                    const userId = user._id || user.id;
                    return (
                    <tr 
                      key={userId} 
                      className={`hover:bg-white/5 transition-colors duration-200 ${
                        deletingId === userId ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-white">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getRoleBadgeColor(user.role)}`}>
                            {(user.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-sm text-slate-300">{user.email}</div>
                            {user.designation && (
                              <div className="text-xs text-slate-400">{user.designation}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`${getRoleBadgeColor(user.role)} text-white px-3 py-1 rounded-full text-sm font-semibold capitalize`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white">
                        {user.employerId?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {(user.isActive === true || user.is_active === true) ? (
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(user)}
                            disabled={deletingId === userId}
                            className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                            title="Edit user"
                          >
                            <Edit2 size={18} className="text-blue-400" />
                          </button>
                          
                          {/* Toggle Status Button */}
                          {(() => {
                            const isUserActive = user.isActive === true || user.is_active === true;
                            return (
                              <button
                                onClick={() => handleToggleStatus(userId, isUserActive)}
                                disabled={togglingId === userId || deletingId === userId}
                                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                                  isUserActive
                                    ? 'bg-orange-500/20 hover:bg-orange-500/30'
                                    : 'bg-green-500/20 hover:bg-green-500/30'
                                }`}
                                title={isUserActive ? 'Deactivate' : 'Activate'}
                              >
                                {togglingId === userId ? (
                                  <Loader2 size={18} className="text-slate-400 animate-spin" />
                                ) : isUserActive ? (
                                  <PowerOff size={18} className="text-orange-400" />
                                ) : (
                                  <Power size={18} className="text-green-400" />
                                )}
                              </button>
                            );
                          })()}
                          
                          {/* Delete Button */}
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(userId, user.name)}
                              disabled={deletingId !== null}
                              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                              title="Delete user"
                            >
                              {deletingId === userId ? (
                                <Loader2 size={18} className="text-red-400 animate-spin" />
                              ) : (
                                <Trash2 size={18} className="text-red-400" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Users className="w-12 h-12 text-slate-500 mb-3" />
                        <p className="text-slate-400 text-lg">No users found</p>
                        {searchTerm && (
                          <p className="text-slate-500 text-sm mt-1">Try adjusting your search</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Results count */}
          {!loading && filteredUsers.length > 0 && (
            <div className="px-6 py-3 bg-white/5 border-t border-white/10 text-slate-400 text-sm">
              Showing {filteredUsers.length} of {users.length} users
              {refreshing && <Loader2 size={14} className="inline ml-2 animate-spin" />}
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full my-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Create New User</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    minLength="6"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value, employerId: ''})}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                    required
                  >
                    <option value="employee" className="bg-slate-800">Employee</option>
                    <option value="employer" className="bg-slate-800">Employer</option>
                  </select>
                </div>

                {formData.role === 'employee' && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-200">Assign to Employer *</label>
                    <select
                      value={formData.employerId}
                      onChange={(e) => setFormData({...formData, employerId: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                      required
                    >
                      <option value="" className="bg-slate-800">Select Employer</option>
                      {employers.map(emp => {
                        const empId = emp._id || emp.id;
                        return (
                          <option key={empId} value={empId} className="bg-slate-800">{emp.name}</option>
                        );
                      })}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({...formData, designation: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Software Developer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Engineering"
                  />
                </div>

                {(formData.role === 'employee' || formData.role === 'employer') && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-200">Hourly Pay ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.hourlyPay}
                      onChange={(e) => setFormData({...formData, hourlyPay: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      placeholder="e.g., 25.00"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} />
                      Create User
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full my-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Edit User</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Role</label>
                  <input
                    type="text"
                    value={formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">Role cannot be changed</p>
                </div>

                {editingUser.role === 'employee' && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-200">Assign to Employer</label>
                    <select
                      value={formData.employerId}
                      onChange={(e) => setFormData({...formData, employerId: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-slate-800">No Employer</option>
                      {employers.map(emp => {
                        const empId = emp._id || emp.id;
                        return (
                          <option key={empId} value={empId} className="bg-slate-800">{emp.name}</option>
                        );
                      })}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({...formData, designation: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Software Developer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Engineering"
                  />
                </div>

                {(editingUser.role === 'employee' || editingUser.role === 'employer') && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-200">Hourly Pay ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.hourlyPay}
                      onChange={(e) => setFormData({...formData, hourlyPay: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      placeholder="e.g., 25.00"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;

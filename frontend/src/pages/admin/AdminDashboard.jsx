import React, { useState, useEffect, lazy, Suspense, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/index.js';
import { Users, Clock, TrendingUp, Briefcase, Mail, UserCheck, Activity, Calendar, RefreshCw, Wifi, WifiOff, CheckCircle, UserPlus, UserMinus } from 'lucide-react';
import { adminAPI } from '../../api/endpoints.js';
import { supabase } from '../../config/supabase.js';
import { toast } from 'react-toastify';

// Lazy load chart components for faster initial render
const LazyCharts = lazy(() => import('recharts').then(module => ({
  default: ({ hoursTrendData, userDistributionData, CustomTooltip }) => {
    const { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } = module;
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Weekly Hours Trend</h2>
            <TrendingUp className="w-6 h-6 text-blue-400" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={hoursTrendData}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="day" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
              <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">User Distribution</h2>
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={userDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {userDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
})));

// Simple in-memory cache for dashboard stats
const dashboardCache = {
  data: null,
  timestamp: null,
  TTL: 10000 // 10 seconds cache - reduced for more responsive updates
};

// Skeleton loader component for stat cards
const StatCardSkeleton = () => (
  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="h-4 bg-white/20 rounded w-24 mb-3"></div>
        <div className="h-10 bg-white/20 rounded w-16 mb-2"></div>
        <div className="h-3 bg-white/10 rounded w-20"></div>
      </div>
      <div className="w-12 h-12 rounded-full bg-white/10"></div>
    </div>
  </div>
);

// Skeleton for chart section
const ChartSkeleton = () => (
  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 animate-pulse">
    <div className="h-6 bg-white/20 rounded w-48 mb-4"></div>
    <div className="h-[250px] bg-white/5 rounded-lg flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
    </div>
  </div>
);

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const isDark = useThemeStore((state) => state.isDark);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClients: 0,
    totalHours: 0,
    activeEmployees: 0,
    jobPostings: 0,
    contactMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userDistributionData, setUserDistributionData] = useState([]);
  const [hoursTrendData, setHoursTrendData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [realtimeUpdate, setRealtimeUpdate] = useState(null); // Shows which table was updated
  const [recentActivities, setRecentActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const abortControllerRef = useRef(null);
  const subscriptionRef = useRef(null);

  // Helper function to format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Fetch recent activities from database
  const fetchRecentActivities = useCallback(async () => {
    try {
      setActivitiesLoading(true);
      
      // Fetch recent data from multiple tables in parallel
      const [usersRes, timecardsRes, messagesRes, clientsRes, jobsRes] = await Promise.all([
        supabase
          .from('users')
          .select('id, name, email, role, created_at, is_active')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('time_cards')
          .select('id, created_at, total_hours, user_id, users(name)')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('contact_messages')
          .select('id, name, company, created_at, status')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('clients')
          .select('id, name, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('job_postings')
          .select('id, title, created_at, status')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      // Combine and format all activities
      const activities = [];

      // Process users
      if (usersRes.data) {
        usersRes.data.forEach(user => {
          activities.push({
            id: `user-${user.id}`,
            action: 'New user registered',
            user: user.name || user.email,
            time: user.created_at,
            icon: 'Users',
            color: 'blue'
          });
        });
      }

      // Process timecards
      if (timecardsRes.data) {
        timecardsRes.data.forEach(tc => {
          activities.push({
            id: `timecard-${tc.id}`,
            action: `${tc.total_hours || 0} hours logged`,
            user: tc.users?.name || 'Unknown User',
            time: tc.created_at,
            icon: 'Clock',
            color: 'purple'
          });
        });
      }

      // Process contact messages
      if (messagesRes.data) {
        messagesRes.data.forEach(msg => {
          activities.push({
            id: `message-${msg.id}`,
            action: 'Contact message received',
            user: msg.company || msg.name,
            time: msg.created_at,
            icon: 'Mail',
            color: 'pink'
          });
        });
      }

      // Process clients
      if (clientsRes.data) {
        clientsRes.data.forEach(client => {
          activities.push({
            id: `client-${client.id}`,
            action: 'Client added',
            user: client.name,
            time: client.created_at,
            icon: 'Briefcase',
            color: 'green'
          });
        });
      }

      // Process job postings
      if (jobsRes.data) {
        jobsRes.data.forEach(job => {
          activities.push({
            id: `job-${job.id}`,
            action: 'Job posting created',
            user: job.title,
            time: job.created_at,
            icon: 'Briefcase',
            color: 'orange'
          });
        });
      }

      // Sort all activities by time (most recent first) and take top 8
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivities(activities.slice(0, 8));
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  // Fetch dashboard data with caching
  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    // Check cache first (unless force refresh)
    if (!forceRefresh && dashboardCache.data && dashboardCache.timestamp) {
      const age = Date.now() - dashboardCache.timestamp;
      if (age < dashboardCache.TTL) {
        // Use cached data
        applyDashboardData(dashboardCache.data);
        setLoading(false);
        return;
      }
    }

    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Single optimized API call
      const response = await adminAPI.getDashboardStats();
      const data = response.data;

      // Update cache
      dashboardCache.data = data;
      dashboardCache.timestamp = Date.now();

      applyDashboardData(data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching dashboard data:', error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Apply dashboard data to state
  const applyDashboardData = (data) => {
    if (data.stats) {
      setStats(data.stats);
    }
    if (data.userDistribution) {
      setUserDistributionData(data.userDistribution);
    }
    if (data.hoursTrend) {
      setHoursTrendData(data.hoursTrend);
    }
    if (data.meta?.generatedAt) {
      setLastUpdated(new Date(data.meta.generatedAt));
    }
  };

  // Fetch data on mount and setup real-time subscriptions
  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivities();
    
    // Setup Supabase Realtime subscriptions for all relevant tables
    const setupRealtimeSubscriptions = () => {
      // Tables to monitor for changes
      const tablesToWatch = [
        { table: 'users', label: 'Users' },
        { table: 'clients', label: 'Clients' },
        { table: 'time_cards', label: 'Timecards' },
        { table: 'job_postings', label: 'Jobs' },
        { table: 'contact_messages', label: 'Messages' },
        { table: 'invoices', label: 'Invoices' }
      ];

      // Create a channel for all dashboard updates
      const channel = supabase
        .channel('admin-dashboard-realtime')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'users' },
          (payload) => handleRealtimeChange('Users', payload)
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'clients' },
          (payload) => handleRealtimeChange('Clients', payload)
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'time_cards' },
          (payload) => handleRealtimeChange('Timecards', payload)
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'job_postings' },
          (payload) => handleRealtimeChange('Jobs', payload)
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'contact_messages' },
          (payload) => handleRealtimeChange('Messages', payload)
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'invoices' },
          (payload) => handleRealtimeChange('Invoices', payload)
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'client_logos' },
          (payload) => handleRealtimeChange('Logos', payload)
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setRealtimeConnected(true);
            console.log('✅ Realtime subscriptions active for admin dashboard');
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            setRealtimeConnected(false);
            console.log('❌ Realtime connection closed');
          }
        });

      subscriptionRef.current = channel;
    };

    setupRealtimeSubscriptions();
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Unsubscribe from realtime
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [fetchDashboardData, fetchRecentActivities]);

  // Handle realtime database changes
  const handleRealtimeChange = useCallback((tableName, payload) => {
    console.log(`🔄 Realtime update: ${tableName}`, payload.eventType, payload);
    
    // Show visual indicator of which section updated
    setRealtimeUpdate(tableName);
    
    // Clear cache to force fresh data
    dashboardCache.data = null;
    dashboardCache.timestamp = null;
    
    // Show toast notification for important changes
    if (tableName === 'Users') {
      if (payload.eventType === 'INSERT') {
        toast.success('New user created!', { icon: '👤', autoClose: 3000 });
      } else if (payload.eventType === 'UPDATE') {
        const newData = payload.new;
        const oldData = payload.old;
        // Check if status changed
        if (newData && oldData && newData.is_active !== oldData.is_active) {
          if (newData.is_active) {
            toast.success(`User activated!`, { icon: '✅', autoClose: 3000 });
          } else {
            toast.info(`User deactivated`, { icon: '🔒', autoClose: 3000 });
          }
        } else {
          toast.info('User updated', { autoClose: 2000 });
        }
      } else if (payload.eventType === 'DELETE') {
        toast.info('User deleted', { icon: '🗑️', autoClose: 3000 });
      }
    } else if (tableName === 'Clients') {
      toast.info(`Clients ${payload.eventType.toLowerCase()}`, { autoClose: 2000 });
    } else if (tableName === 'Jobs') {
      toast.info(`Job posting ${payload.eventType.toLowerCase()}`, { autoClose: 2000 });
    } else if (tableName === 'Messages') {
      if (payload.eventType === 'INSERT') {
        toast.info('New contact message received!', { icon: '📬', autoClose: 3000 });
      }
    }
    
    // Fetch fresh data immediately
    fetchDashboardData(true);
    fetchRecentActivities();
    
    // Clear the update indicator after 3 seconds
    setTimeout(() => {
      setRealtimeUpdate(null);
    }, 3000);
  }, [fetchDashboardData, fetchRecentActivities]);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchDashboardData(true);
  };


  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-sm border border-blue-500/30 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Stat card component with update animation
  const StatCard = ({ title, value, subtitle, icon: Icon, color, highlightType }) => {
    // Determine if this card should be highlighted based on recent update
    const isHighlighted = realtimeUpdate && (
      (highlightType === 'users' && realtimeUpdate === 'Users') ||
      (highlightType === 'clients' && realtimeUpdate === 'Clients') ||
      (highlightType === 'timecards' && realtimeUpdate === 'Timecards') ||
      (highlightType === 'jobs' && realtimeUpdate === 'Jobs') ||
      (highlightType === 'messages' && realtimeUpdate === 'Messages')
    );

    // Color classes based on prop
    const colorClasses = {
      blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500', ring: 'ring-blue-500/50' },
      green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500', ring: 'ring-green-500/50' },
      purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500', ring: 'ring-purple-500/50' },
      cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500', ring: 'ring-cyan-500/50' },
      orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500', ring: 'ring-orange-500/50' },
      pink: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500', ring: 'ring-pink-500/50' }
    };
    
    const colors = colorClasses[color] || colorClasses.blue;

    return (
      <div className={`bg-white/10 backdrop-blur-xl border rounded-2xl p-6 flex items-start justify-between transition-all duration-500 hover:scale-105 ${
        isHighlighted 
          ? `${colors.border} bg-gradient-to-br from-${color}-500/30 to-${color}-600/10 ring-2 ${colors.ring}` 
          : 'border-white/20 hover:bg-white/15'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-200">{title}</p>
            {isHighlighted && (
              <span className="flex items-center gap-1 text-xs text-green-400 animate-pulse">
                <CheckCircle size={12} />
                Updated
              </span>
            )}
          </div>
          <p className={`text-4xl font-bold mt-2 transition-all duration-500 ${
            isHighlighted ? `${colors.text} scale-110 transform` : 'text-white'
          }`}>
            {value}
          </p>
          <p className="text-xs text-slate-300 mt-1">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center transition-all duration-300 ${
          isHighlighted ? 'animate-bounce scale-110' : ''
        }`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with refresh button and realtime status */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
            <div className="flex items-center gap-4 mt-2">
              {lastUpdated && (
                <p className="text-sm text-slate-400">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
              {/* Realtime connection status */}
              <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                realtimeConnected 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {realtimeConnected ? (
                  <>
                    <Wifi size={12} />
                    <span>Live</span>
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  </>
                ) : (
                  <>
                    <WifiOff size={12} />
                    <span>Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Real-time update indicator */}
            {realtimeUpdate && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-400 rounded-xl text-sm border border-green-500/30 shadow-lg animate-pulse">
                <CheckCircle size={16} className="animate-bounce" />
                <span className="font-medium">{realtimeUpdate} updated!</span>
              </div>
            )}
            {/* Refreshing indicator */}
            {refreshing && !realtimeUpdate && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                <RefreshCw size={14} className="animate-spin" />
                <span>Syncing...</span>
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-lg transition-all hover:scale-105"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid with Skeleton Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            // Show 6 skeleton cards while loading
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            // Show actual stat cards with highlight types for realtime updates
            <>
              <StatCard title="Total Users" value={stats.totalUsers} subtitle="All system users" icon={Users} color="blue" highlightType="users" />
              <StatCard title="Total Clients" value={stats.totalClients} subtitle="Active clients" icon={Briefcase} color="green" highlightType="clients" />
              <StatCard title="Hours Tracked" value={stats.totalHours} subtitle="This month" icon={Clock} color="purple" highlightType="timecards" />
              <StatCard title="Active Employees" value={stats.activeEmployees} subtitle="Currently active" icon={UserCheck} color="cyan" highlightType="users" />
              <StatCard title="Job Postings" value={stats.jobPostings} subtitle="Open positions" icon={Briefcase} color="orange" highlightType="jobs" />
              <StatCard title="Contact Messages" value={stats.contactMessages} subtitle="Unread messages" icon={Mail} color="pink" highlightType="messages" />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/admin/users')}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 hover:scale-105 text-left cursor-pointer"
            >
              <Users className="w-8 h-8 text-blue-400 mb-2" />
              <p className="font-semibold text-white">Manage Users</p>
              <p className="text-xs text-slate-300 mt-1">Create and edit users</p>
            </button>
            <button 
              onClick={() => navigate('/admin/clients')}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 hover:scale-105 text-left cursor-pointer"
            >
              <Briefcase className="w-8 h-8 text-green-400 mb-2" />
              <p className="font-semibold text-white">Manage Clients</p>
              <p className="text-xs text-slate-300 mt-1">View client list</p>
            </button>
            <button 
              onClick={() => navigate('/admin/reports')}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 hover:scale-105 text-left cursor-pointer"
            >
              <Activity className="w-8 h-8 text-purple-400 mb-2" />
              <p className="font-semibold text-white">View Reports</p>
              <p className="text-xs text-slate-300 mt-1">Analytics & insights</p>
            </button>
            <button 
              onClick={() => navigate('/admin/contact-messages')}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 hover:scale-105 text-left cursor-pointer"
            >
              <Mail className="w-8 h-8 text-pink-400 mb-2" />
              <p className="font-semibold text-white">Contact Messages</p>
              <p className="text-xs text-slate-300 mt-1">View inquiries</p>
            </button>
          </div>
        </div>

        {/* Charts Section - Lazy Loaded */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        ) : (
          <Suspense fallback={
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          }>
            <LazyCharts 
              hoursTrendData={hoursTrendData} 
              userDistributionData={userDistributionData}
              CustomTooltip={CustomTooltip}
            />
          </Suspense>
        )}

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            <div className="flex items-center gap-2">
              {realtimeConnected && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Live
                </span>
              )}
              <Activity className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="space-y-3">
            {activitiesLoading ? (
              // Skeleton loading
              [...Array(5)].map((_, idx) => (
                <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10 animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-white/10 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-white/5 rounded w-20"></div>
                    </div>
                    <div className="h-3 bg-white/5 rounded w-16"></div>
                  </div>
                </div>
              ))
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              recentActivities.map((item) => {
                // Map icon string to actual component
                const iconMap = {
                  'Users': Users,
                  'Clock': Clock,
                  'Mail': Mail,
                  'Briefcase': Briefcase
                };
                const Icon = iconMap[item.icon] || Activity;
                
                // Map color to Tailwind classes
                const colorClasses = {
                  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
                  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
                  pink: { bg: 'bg-pink-500/20', text: 'text-pink-400' },
                  green: { bg: 'bg-green-500/20', text: 'text-green-400' },
                  orange: { bg: 'bg-orange-500/20', text: 'text-orange-400' }
                };
                const colors = colorClasses[item.color] || colorClasses.blue;
                
                return (
                  <div key={item.id} className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm">{item.action}</p>
                        <p className="text-slate-300 text-xs mt-0.5 truncate">{item.user}</p>
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">{formatTimeAgo(item.time)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

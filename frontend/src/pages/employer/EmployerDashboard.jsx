import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/index.js';
import { useAuthStore } from '../../store/index.js';
import { timeCardAPI } from '../../api/endpoints.js';
import { supabase } from '../../config/supabase.js';
import { toast } from 'react-toastify';
import { Calendar, Users, Clock, ChevronLeft, ChevronRight, BarChart3, ArrowLeft, LogOut, Home, ClipboardList, Wifi, WifiOff } from 'lucide-react';
import { formatUSDateRange } from '../../utils/dateUtils.js';

/**
 * Employer Dashboard
 * Weekly view of employee timecards
 * Features:
 * - See all employees and their hours
 * - Weekly totals per employee
 * - Daily breakdown
 * - Week navigation
 * - Employee filter
 * - Read-only (cannot edit entries)
 */
export const EmployerDashboard = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [employees, setEmployees] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  const [loading, setLoading] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const subscriptionRef = useRef(null);

  // Get Monday of current week
  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  // Fetch employees
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch weekly summary when week changes
  useEffect(() => {
    fetchWeeklySummary();
  }, [currentWeekStart, selectedEmployee]);

  // Setup real-time subscriptions (only once on mount)
  useEffect(() => {
    const setupRealtimeSubscriptions = () => {
      // Create a channel for real-time updates
      const channel = supabase
        .channel('employer-dashboard-realtime')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'time_cards' },
          (payload) => {
            console.log('🔄 Timecard updated:', payload.eventType);
            // Refresh data when timecards change
            fetchWeeklySummary();
            fetchEmployees();
            if (payload.eventType === 'INSERT') {
              toast.info('New timecard entry added', { autoClose: 2000 });
            } else if (payload.eventType === 'UPDATE') {
              toast.info('Timecard entry updated', { autoClose: 2000 });
            } else if (payload.eventType === 'DELETE') {
              toast.info('Timecard entry deleted', { autoClose: 2000 });
            }
          }
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'users' },
          (payload) => {
            console.log('🔄 User updated:', payload.eventType);
            // Refresh employees list when users change
            fetchEmployees();
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setRealtimeConnected(true);
            console.log('✅ Realtime subscriptions active for employer dashboard');
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
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, []); // Empty dependency array - setup once on mount

  const fetchEmployees = async () => {
    try {
      const response = await timeCardAPI.getEmployees();
      setEmployees(response.data.employees);
    } catch (error) {
      toast.error('Failed to fetch employees');
    }
  };

  const fetchWeeklySummary = async () => {
    setLoading(true);
    try {
      const startDate = currentWeekStart.toISOString().split('T')[0];
      const response = await timeCardAPI.getWeeklySummary(startDate);
      
      // Filter by selected employee if needed
      let summary = response.data.summary;
      if (selectedEmployee) {
        summary = summary.filter(s => s.employee.id === selectedEmployee);
      }
      
      setWeeklySummary(summary);
    } catch (error) {
      toast.error('Failed to fetch weekly summary');
    } finally {
      setLoading(false);
    }
  };

  const changeWeek = (increment) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (increment * 7));
    setCurrentWeekStart(newDate);
  };

  // Generate week days array
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Get hours for specific employee and date
  const getHoursForDate = (employeeData, date) => {
    const entry = employeeData.entries.find(e => {
      const entryDate = new Date(e.date);
      return entryDate.toDateString() === date.toDateString();
    });
    return entry ? entry.hoursWorked : 0;
  };

  const formatDateRange = () => {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 6);
    return formatUSDateRange(currentWeekStart, endDate);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Navigation */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors border border-blue-500/30 text-sm"
              >
                <Home size={18} />
                <span className="font-medium">Home</span>
              </button>
              <button
                onClick={() => navigate('/employer/timecards')}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors border border-green-500/30 text-sm"
              >
                <ClipboardList size={18} />
                <span className="font-medium">My Timecards</span>
              </button>
            </div>
            <div className="flex items-center justify-between lg:justify-end gap-4">
              <div className="text-left lg:text-right">
                <div className="text-xs md:text-sm text-slate-400">Welcome back,</div>
                <div className="font-semibold text-sm md:text-base">{user?.name || 'Manager'}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors border border-red-500/30 text-sm"
              >
                <LogOut size={18} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">
                  Employer Dashboard
                </h1>
                {realtimeConnected && (
                  <span className="text-xs text-green-400 flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
                    <Wifi size={12} />
                    Live
                  </span>
                )}
                {!realtimeConnected && (
                  <span className="text-xs text-slate-500 flex items-center gap-1 px-2 py-1 bg-slate-500/10 border border-slate-500/30 rounded-full">
                    <WifiOff size={12} />
                    Offline
                  </span>
                )}
              </div>
              <p className="text-slate-400">
                View your employees' weekly timecards
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-[#1a2942]/50 backdrop-blur-sm border border-blue-900/30 rounded-xl p-6 shadow-lg mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Week Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => changeWeek(-1)}
                className="p-2 rounded-lg hover:bg-blue-600/20 transition-colors"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
              
              <div className="text-center">
                <div className="font-bold text-white">
                  {formatDateRange()}
                </div>
                <div className="text-sm text-slate-400">
                  Week {(() => {
                    const date = new Date(currentWeekStart);
                    const startOfYear = new Date(date.getFullYear(), 0, 1);
                    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
                    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
                  })()}
                </div>
              </div>
              
              <button
                onClick={() => changeWeek(1)}
                className="p-2 rounded-lg hover:bg-blue-600/20 transition-colors"
              >
                <ChevronRight size={24} className="text-white" />
              </button>
            </div>

            {/* Employee Filter */}
            <div className="flex items-center gap-3">
              <Users size={20} className="text-slate-400" />
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="px-4 py-2 rounded-lg border bg-slate-800 border-blue-900/50 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer"
              >
                <option value="" className="bg-slate-800">All Employees</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id} className="bg-slate-800">
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Weekly Grid */}
        {loading ? (
          <div className="bg-[#1a2942]/50 backdrop-blur-sm border border-blue-900/30 rounded-xl p-12 shadow-lg text-center">
            <div className="text-lg text-white">
              Loading timecard data...
            </div>
          </div>
        ) : weeklySummary.length === 0 ? (
          <div className="bg-[#1a2942]/50 backdrop-blur-sm border border-blue-900/30 rounded-xl p-12 shadow-lg text-center">
            <Users size={48} className="mx-auto mb-4 text-slate-600" />
            <div className="text-lg text-white">
              No timecard entries for this week
            </div>
            <p className="mt-2 text-slate-400">
              Employees haven't submitted any hours yet
            </p>
          </div>
        ) : (
          <div className="bg-[#1a2942]/50 backdrop-blur-sm border border-blue-900/30 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-white">
                      Employee
                    </th>
                    {weekDays.map((day, idx) => (
                      <th key={idx} className="px-4 py-4 text-center font-semibold text-white">
                        <div>{dayNames[idx]}</div>
                        <div className="text-xs font-normal text-slate-400">
                          {day.getMonth() + 1}/{day.getDate()}
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4 text-center font-semibold text-white">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {weeklySummary.map((empData, empIdx) => (
                    <tr key={empIdx} className="hover:bg-blue-600/10 transition-colors">
                      <td className="px-6 py-4 text-white">
                        <div className="font-semibold">{empData.employee.name}</div>
                        <div className="text-sm text-slate-400">
                          {empData.employee.designation || 'Employee'}
                        </div>
                      </td>
                      {weekDays.map((day, dayIdx) => {
                        const hours = getHoursForDate(empData, day);
                        return (
                          <td key={dayIdx} className="px-4 py-4 text-center">
                            {hours > 0 ? (
                              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg font-bold bg-blue-600/30 text-white border border-blue-500/50">
                                {hours}
                              </div>
                            ) : (
                              <div className="text-slate-600">-</div>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-12 rounded-lg font-bold bg-blue-600 text-white shadow-lg">
                          {empData.totalHours}h
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {weeklySummary.length > 0 && (() => {
          const totalHours = weeklySummary.reduce((sum, emp) => sum + emp.totalHours, 0);
          const avgHours = totalHours / weeklySummary.length;
          
          return (
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="bg-[#1a2942]/50 backdrop-blur-sm border border-blue-900/30 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Clock size={24} className="text-blue-400" />
                  <div className="text-sm text-slate-400">
                    Total Hours This Week
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">
                  {totalHours.toFixed(1)}
                </div>
              </div>

              <div className="bg-[#1a2942]/50 backdrop-blur-sm border border-blue-900/30 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Users size={24} className="text-blue-400" />
                  <div className="text-sm text-slate-400">
                    Active Employees
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">
                  {weeklySummary.length}
                </div>
              </div>

              <div className="bg-[#1a2942]/50 backdrop-blur-sm border border-blue-900/30 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 size={24} className="text-blue-400" />
                  <div className="text-sm text-slate-400">
                    Avg Hours/Employee
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">
                  {avgHours.toFixed(1)}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

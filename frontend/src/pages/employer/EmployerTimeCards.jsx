import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore, useAuthStore } from '../../store/index.js';
import { timeCardAPI, clientAPI } from '../../api/endpoints.js';
import { toast } from 'react-toastify';
import { Calendar, Clock, Save, Trash2, ChevronLeft, ChevronRight, ArrowLeft, LogOut, Home } from 'lucide-react';

/**
 * Employer TimeCard Page
 * Calendar-based interface for logging daily working hours
 * Similar to employee timecard but for employers
 */
export const EmployerTimeCards = () => {
  const navigate = useNavigate();
  const isDark = useThemeStore((state) => state.isDark);
  const { logout, user } = useAuthStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeCards, setTimeCards] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoursWorked, setHoursWorked] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');

  // Define fetch functions before using them in useEffect
  const fetchClients = async () => {
    try {
      const response = await clientAPI.getActive();
      const clientsData = response?.data?.clients || response?.data?.data || response?.data || [];
      setClients(Array.isArray(clientsData) ? clientsData : []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        toast.error('Cannot connect to server. Please check if the backend is running.');
      } else {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch clients';
        toast.error(errorMsg);
      }
      setClients([]);
    }
  };

  const fetchTimeCards = async () => {
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Format dates in YYYY-MM-DD format (local date, not UTC)
      const formatDate = (date) => {
        if (!date || isNaN(date.getTime())) {
          console.error('Invalid date:', date);
          return null;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const startDateStr = formatDate(startDate);
      const endDateStr = formatDate(endDate);
      
      if (!startDateStr || !endDateStr) {
        throw new Error('Invalid date range');
      }
      
      const response = await timeCardAPI.getMyEntries({
        startDate: startDateStr,
        endDate: endDateStr
      });
      
      // Handle different response structures
      const cards = response?.data?.timeCards || response?.data?.data || response?.data || [];
      setTimeCards(Array.isArray(cards) ? cards : []);
    } catch (error) {
      console.error('Fetch timecards error:', error);
      console.error('Error response:', error.response);
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        toast.error('Cannot connect to server. Please check if the backend is running on port 5001.');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        logout();
        navigate('/login/employer');
      } else {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch time entries';
        toast.error(errorMsg);
      }
      // Set empty array on error to prevent UI crashes
      setTimeCards([]);
    }
  };

  // Check if user is authenticated
  useEffect(() => {
    const { token: authToken, user: authUser } = useAuthStore.getState();
    if (!authToken || !authUser) {
      toast.error('Please log in to access this page');
      navigate('/login/employer');
      return;
    }
  }, [navigate]);

  // Fetch clients and time entries for current month
  useEffect(() => {
    const { token: authToken } = useAuthStore.getState();
    if (!authToken) {
      setLoadingData(false);
      return; // Don't fetch if no token
    }

    let isMounted = true;
    
    const loadData = async () => {
      setLoadingData(true);
      try {
        await Promise.all([fetchClients(), fetchTimeCards()]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        if (isMounted) {
          setLoadingData(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const handleSubmitHours = async (e) => {
    e.preventDefault();
    if (!selectedDate || !hoursWorked) {
      toast.error('Please enter hours worked');
      return;
    }

    if (!selectedClientId) {
      toast.error('Please select a client');
      return;
    }

    const hours = parseFloat(hoursWorked);
    if (isNaN(hours) || hours <= 0 || hours > 24) {
      toast.error('Hours must be between 0 and 24');
      return;
    }

    setLoading(true);
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      const payload = {
        date: formattedDate,
        hoursWorked: hours,
        clientId: selectedClientId,
        notes: ''
      };
      
      console.log('Submitting hours payload:', payload);
      const response = await timeCardAPI.submitHours(payload);
      console.log('Submit hours response:', response);
      
      // Check if response indicates success
      if (response?.data?.success === false) {
        const errorMsg = response.data.message || response.data.error || 'Failed to submit hours';
        console.error('Backend returned success: false', response.data);
        throw new Error(errorMsg);
      }
      
      // Success case
      toast.success(editingEntryId ? 'Hours updated successfully!' : 'Hours submitted successfully!');
      setShowModal(false);
      setHoursWorked('');
      setSelectedClientId('');
      setEditingEntryId(null);
      await fetchTimeCards();
    } catch (error) {
      console.error('Submit hours error:', error);
      console.error('Error response:', error.response);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        toast.error('Cannot connect to server. Please check if the backend is running on port 5001.');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        logout();
        navigate('/login/employer');
      } else if (error.response?.status === 400) {
        // Validation errors or bad request
        const errorData = error.response?.data;
        let errorMsg = errorData?.message || errorData?.error || error.message || 'Failed to submit hours';
        
        // Handle validation errors array
        if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          errorMsg = errorData.errors.map(e => e.msg || e.message).join(', ');
        }
        
        toast.error(errorMsg);
      } else if (error.response?.status === 403) {
        // Forbidden (e.g., locked entry)
        const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Operation not allowed';
        toast.error(errorMsg);
      } else if (error.response?.status === 404) {
        // Not found (e.g., user, client not found)
        const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Resource not found';
        toast.error(errorMsg);
      } else if (error.response?.status === 409) {
        // Conflict (e.g., duplicate entry)
        const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Entry already exists';
        toast.error(errorMsg);
      } else if (error.response?.status === 503) {
        // Service unavailable (database connection)
        const errorMsg = error.response?.data?.message || 'Service temporarily unavailable. Please try again later.';
        toast.error(errorMsg);
      } else {
        // Generic error - try to extract detailed message
        const errorData = error.response?.data;
        const errorMsg = errorData?.message || 
                         errorData?.error ||
                         error.message ||
                         'Failed to submit hours';
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this time entry?')) {
      return;
    }

    setDeleting(true);
    try {
      await timeCardAPI.deleteEntry(entryId);
      toast.success('Time entry deleted successfully');
      await fetchTimeCards();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete entry';
      toast.error(errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  const handleDateClick = (date) => {
    if (!date) return;
    
    setSelectedDate(date);
    
    const existingEntry = timeCards.find(tc => {
      if (!tc || !tc.date) return false;
      try {
        const tcDate = new Date(tc.date);
        return tcDate.toDateString() === date.toDateString();
      } catch (e) {
        console.error('Error parsing date:', e, tc);
        return false;
      }
    });

    if (existingEntry) {
      if (existingEntry.isLocked || existingEntry.is_locked) {
        toast.warning('This entry is locked and cannot be edited');
        return;
      }
      const hours = existingEntry.hoursWorked || existingEntry.hours_worked || 0;
      setHoursWorked(hours.toString());
      const clientId = existingEntry.clientId?._id || existingEntry.clientId?.id || existingEntry.clientId || existingEntry.client_id || '';
      setSelectedClientId(clientId);
      setEditingEntryId(existingEntry._id || existingEntry.id);
    } else {
      setHoursWorked('');
      setSelectedClientId('');
      setEditingEntryId(null);
    }
    
    setShowModal(true);
  };

  const changeMonth = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getHoursForDate = (date) => {
    if (!date) return null;
    const entry = timeCards.find(tc => {
      if (!tc || !tc.date) return false;
      try {
        const tcDate = new Date(tc.date);
        return tcDate.toDateString() === date.toDateString();
      } catch (e) {
        console.error('Error parsing date in getHoursForDate:', e, tc);
        return false;
      }
    });
    return entry;
  };

  const getTotalHours = () => {
    return timeCards.reduce((sum, tc) => {
      const hours = tc?.hoursWorked || tc?.hours_worked || 0;
      return sum + (parseFloat(hours) || 0);
    }, 0);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Navigation */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <button
                onClick={() => navigate('/employer/dashboard')}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors border border-blue-500/30 text-sm"
              >
                <ArrowLeft size={18} />
                <span className="font-medium hidden sm:inline">Back to Dashboard</span>
                <span className="font-medium sm:hidden">Back</span>
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors border border-blue-500/30 text-sm"
              >
                <Home size={18} />
                <span className="font-medium">Home</span>
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            My Time Cards
          </h1>
          <p className="text-slate-400">
            Track your working hours
          </p>
        </div>

        {/* Stats Card */}
        {!loadingData && (
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-[#1a2942]/50 backdrop-blur-sm border border-blue-900/30 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={24} className="text-blue-400" />
              <div className="text-sm text-slate-400">Total Hours This Month</div>
            </div>
            <div className="text-3xl font-bold text-white">
              {getTotalHours().toFixed(1)}
            </div>
          </div>

          <div className="bg-[#1a2942]/50 backdrop-blur-sm border border-blue-900/30 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={24} className="text-blue-400" />
              <div className="text-sm text-slate-400">Days Logged</div>
            </div>
            <div className="text-3xl font-bold text-white">
              {timeCards.length}
            </div>
          </div>

          <div className="bg-[#1a2942]/50 backdrop-blur-sm border border-blue-900/30 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={24} className="text-blue-400" />
              <div className="text-sm text-slate-400">Avg Hours/Day</div>
            </div>
            <div className="text-3xl font-bold text-white">
              {timeCards.length > 0 ? (getTotalHours() / timeCards.length).toFixed(1) : '0.0'}
            </div>
          </div>
        </div>
        )}

        {/* Loading State */}
        {loadingData && (
          <div className="bg-[#1a2942]/50 backdrop-blur-sm border border-blue-900/30 rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading timecards...</p>
          </div>
        )}

        {/* Calendar Card */}
        {!loadingData && (
        <div className="bg-[#1a2942]/50 backdrop-blur-sm border border-blue-900/30 rounded-xl shadow-lg overflow-hidden">
          {/* Calendar Header */}
          <div className="bg-slate-900/50 p-6 flex items-center justify-between border-b border-blue-900/30">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-lg hover:bg-blue-600/20 transition-colors"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </div>
            </div>
            
            <button
              onClick={() => changeMonth(1)}
              className="p-2 rounded-lg hover:bg-blue-600/20 transition-colors"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {dayNames.map(day => (
                <div key={day} className="text-center text-[10px] font-semibold py-1 text-slate-400">
                  {day.slice(0, 1)}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth().map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="h-12" />;
                }

                const entry = getHoursForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isFuture = date > new Date();

                return (
                  <button
                    key={index}
                    onClick={() => !isFuture && handleDateClick(date)}
                    disabled={isFuture}
                    className={`
                      h-12 p-1 rounded-md transition-all relative text-center
                      ${isFuture ? 'opacity-40 cursor-not-allowed' : 'hover:bg-blue-600/40 cursor-pointer'}
                      ${isToday ? 'ring-1 ring-blue-500' : ''}
                      ${entry ? 'bg-blue-600/30 border border-blue-500/50' : 'bg-slate-700/50 border border-slate-600/30'}
                    `}
                  >
                    <div className="text-[10px] font-medium text-white">
                      {date.getDate()}
                    </div>
                    {entry && (
                      <div className="text-[9px] font-bold text-blue-400">
                        {(entry.hoursWorked || entry.hours_worked || 0)}h
                      </div>
                    )}
                    {(entry?.isLocked || entry?.is_locked) && (
                      <div className="absolute top-0 right-0 text-[8px]">
                        🔒
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        )}

        {/* Modal for Adding/Editing Hours */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a2942] border border-blue-900/30 rounded-xl p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingEntryId ? 'Edit Hours' : 'Log Hours'}
              </h2>
              
              <form onSubmit={handleSubmitHours}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Date
                  </label>
                  <div className="text-lg font-semibold text-white">
                    {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
                      timeZone: 'America/New_York',
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : ''}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Client *
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border bg-slate-800 border-blue-900/50 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    required
                  >
                    <option value="" className="bg-slate-800">Select a client</option>
                    {clients.map((client) => (
                      <option key={client._id || client.id} value={client._id || client.id} className="bg-slate-800">
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Hours Worked *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border bg-slate-800 border-blue-900/50 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    placeholder="8.0"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Save size={20} />
                    {loading ? 'Saving...' : editingEntryId ? 'Update' : 'Save'}
                  </button>
                  
                  {editingEntryId && (
                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(editingEntryId)}
                      disabled={deleting}
                      className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setHoursWorked('');
                      setSelectedClientId('');
                      setEditingEntryId(null);
                    }}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerTimeCards;

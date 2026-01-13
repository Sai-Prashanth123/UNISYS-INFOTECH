import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore, useAuthStore } from '../../store/index.js';
import { timeCardAPI, clientAPI } from '../../api/endpoints.js';
import { toast } from 'react-toastify';
import { Calendar, Clock, Save, Trash2, ChevronLeft, ChevronRight, ArrowLeft, LogOut, Home } from 'lucide-react';
import { formatUSDate } from '../../utils/dateUtils.js';

/**
 * Employee TimeCard Page
 * Calendar-based interface for logging daily working hours
 * Features:
 * - Monthly calendar view
 * - Click date to add/edit hours
 * - View existing entries
 * - Cannot edit locked entries
 */
export const EmployeeTimeCards = () => {
  const navigate = useNavigate();
  const isDark = useThemeStore((state) => state.isDark);
  const { logout, user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeCards, setTimeCards] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoursWorked, setHoursWorked] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');

  // Fetch clients and time entries for current month
  useEffect(() => {
    fetchClients();
    fetchTimeCards();
  }, [currentDate]);

  const fetchClients = async () => {
    try {
      const response = await clientAPI.getActive();
      setClients(response.data.clients || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to fetch clients');
    }
  };

  const fetchTimeCards = async () => {
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await timeCardAPI.getMyEntries({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
      
      console.log('Fetched timecards:', response.data.timeCards);
      const cards = (response.data.timeCards || []).map(tc => ({
        ...tc,
        _id: tc._id || tc.id,
        id: tc.id || tc._id,
        hoursWorked: tc.hoursWorked !== undefined ? tc.hoursWorked : (tc.hours_worked || 0),
        isLocked: tc.isLocked !== undefined ? tc.isLocked : (tc.is_locked || false)
      }));
      setTimeCards(cards);
      
      // Calculate and log totals
      const totalHours = cards.reduce((sum, tc) => sum + (tc.hoursWorked || 0), 0);
      console.log('Total hours:', totalHours, 'Days:', cards.length);
    } catch (error) {
      console.error('Fetch timecards error:', error);
      toast.error('Failed to fetch time entries');
    }
  };

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
      // Format date in local timezone to prevent day shift
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      const payload = {
        date: formattedDate,
        hoursWorked: hours,
        clientId: selectedClientId,
        notes: '' // Backend expects notes field even if empty
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
      await fetchTimeCards(); // Wait for data refresh to complete
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
        // Handle logout if needed
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

  const handleDeleteEntry = async () => {
    if (!editingEntryId) return;
    
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    setDeleting(true);
    try {
      await timeCardAPI.deleteEntry(editingEntryId);
      toast.success('Entry deleted successfully!');
      setShowModal(false);
      setHoursWorked('');
      setEditingEntryId(null);
      fetchTimeCards();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete entry');
    } finally {
      setDeleting(false);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    
    // Check if entry exists for this date
    const existing = timeCards.find(tc => {
      const tcDate = new Date(tc.date);
      return tcDate.toDateString() === date.toDateString();
    });
    
    if (existing) {
      if (existing.isLocked) {
        toast.warning('This entry is locked and cannot be edited');
        return;
      }
      setEditingEntryId(existing._id || existing.id);
      setHoursWorked((existing.hoursWorked || existing.hours_worked || 0).toString());
      setSelectedClientId(existing.clientId?._id || existing.clientId || existing.client_id || '');
    } else {
      setEditingEntryId(null);
      setHoursWorked('');
      setSelectedClientId('');
    }
    
    setShowModal(true);
  };

  // Calendar generation
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getHoursForDate = (date) => {
    if (!date) return null;
    const entry = timeCards.find(tc => {
      const tcDate = new Date(tc.date);
      return tcDate.toDateString() === date.toDateString();
    });
    return entry;
  };

  const changeMonth = (increment) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors border border-blue-500/30 text-sm"
              >
                <Home size={18} />
                <span className="font-medium">Home</span>
              </button>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="text-left sm:text-right">
                <div className="text-xs md:text-sm text-slate-400">Welcome back,</div>
                <div className="font-semibold text-sm md:text-base">{user?.name || 'Employee'}</div>
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
            My TimeCards
          </h1>
          <p className="text-slate-400">
            Click on a date to log your working hours
          </p>
        </div>

        {/* Calendar Controls */}
        <div className="bg-[#1a2942]/50 backdrop-blur-sm border border-blue-900/30 rounded-xl p-4 md:p-6 shadow-lg mb-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-lg hover:bg-blue-600/20 transition-colors"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            
            <h2 className="text-lg md:text-xl font-bold text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <button
              onClick={() => changeMonth(1)}
              className="p-2 rounded-lg hover:bg-blue-600/20 transition-colors"
            >
              <ChevronRight size={20} className="text-white" />
            </button>
          </div>

          {/* Calendar Grid - Compact */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {dayNames.map(day => (
              <div key={day} className="text-center text-[10px] font-semibold py-1 text-slate-400">
                {day.slice(0, 1)}
              </div>
            ))}
            
            {/* Calendar days */}
            {getDaysInMonth().map((date, idx) => {
              const entry = getHoursForDate(date);
              const isToday = date && date.toDateString() === new Date().toDateString();
              
              return (
                <button
                  key={idx}
                  onClick={() => date && handleDateClick(date)}
                  disabled={!date}
                  className={`
                    h-12 p-1 rounded-md transition-all relative text-center
                    ${!date ? 'invisible' : ''}
                    ${isToday ? 'ring-1 ring-blue-500' : ''}
                    ${entry ? 'bg-blue-600/30 hover:bg-blue-600/40 border border-blue-500/50' : 'bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/30'}
                    ${(entry?.isLocked || entry?.is_locked) ? 'opacity-60 cursor-not-allowed' : ''}
                  `}
                >
                  {date && (
                    <>
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
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-[#1a2942]/50 backdrop-blur-sm border border-blue-900/30 rounded-xl p-4 md:p-6 shadow-lg">
          <h3 className="text-lg md:text-xl font-bold mb-4 text-white">
            Monthly Summary
          </h3>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="p-3 md:p-4 rounded-lg bg-blue-600/20 border border-blue-500/30">
              <div className="text-xs md:text-sm text-slate-400">Total Hours</div>
              <div className="text-xl md:text-2xl font-bold text-white">
                {timeCards.reduce((sum, tc) => sum + tc.hoursWorked, 0).toFixed(1)}
              </div>
            </div>
            <div className="p-3 md:p-4 rounded-lg bg-blue-600/20 border border-blue-500/30">
              <div className="text-xs md:text-sm text-slate-400">Days Worked</div>
              <div className="text-xl md:text-2xl font-bold text-white">
                {timeCards.length}
              </div>
            </div>
            <div className="p-3 md:p-4 rounded-lg bg-blue-600/20 border border-blue-500/30">
              <div className="text-xs md:text-sm text-slate-400">Avg Hours/Day</div>
              <div className="text-xl md:text-2xl font-bold text-white">
                {timeCards.length > 0 ? (timeCards.reduce((sum, tc) => sum + tc.hoursWorked, 0) / timeCards.length).toFixed(1) : '0.0'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hours Entry Modal */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a2942] border border-blue-900/50 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-white">
              {editingEntryId ? 'Edit Hours' : 'Log Hours'} - {formatUSDate(selectedDate)}
            </h3>
            
            <form onSubmit={handleSubmitHours} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  Client *
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border bg-slate-800 border-blue-900/50 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  required
                  autoFocus
                >
                  <option value="" className="bg-slate-800">Select a client</option>
                  {clients.map((client) => (
                    <option key={client._id || client.id} value={client._id || client.id} className="bg-slate-800">
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  Hours Worked *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={hoursWorked}
                  onChange={(e) => setHoursWorked(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border bg-slate-800 border-blue-900/50 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-lg"
                  placeholder="8.0"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : (editingEntryId ? 'Update' : 'Save')}
                </button>
                
                {editingEntryId && (
                  <button
                    type="button"
                    onClick={handleDeleteEntry}
                    disabled={deleting}
                    className="px-4 py-3 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEntryId(null);
                    setHoursWorked('');
                    setSelectedClientId('');
                  }}
                  className="px-6 py-3 rounded-lg font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-colors"
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

import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../store/index.js';
import { timeCardAPI, adminAPI } from '../../api/endpoints.js';
import { toast } from 'react-toastify';
import { Clock, Search, Filter, Calendar, User, Users, Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatUSDateLong, formatUSMonthYear } from '../../utils/dateUtils.js';

export const TimecardsManagement = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const [timecards, setTimecards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalHours: 0, totalEntries: 0, uniqueEmployees: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchTimecards();
  }, [selectedMonth]);

  const fetchTimecards = async () => {
    setLoading(true);
    try {
      // Get month and year from selectedMonth (format: "2026-01")
      const [year, month] = selectedMonth.split('-');
      
      const timecardsRes = await timeCardAPI.getMonthlySummary({
        month: parseInt(month),
        year: parseInt(year)
      });

      setTimecards(timecardsRes.data.timecards || []);
      setStats({
        totalHours: timecardsRes.data.totalHours || 0,
        totalEntries: timecardsRes.data.count || 0,
        uniqueEmployees: timecardsRes.data.count || 0
      });
    } catch (error) {
      console.error('Error fetching timecards:', error);
      toast.error('Failed to fetch timecards');
    } finally {
      setLoading(false);
    }
  };

  // Filter timecards by search term
  const filteredTimecards = timecards.filter(tc => {
    const name = tc.name?.toLowerCase() || '';
    const email = tc.email?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  // Pagination
  const totalPages = Math.ceil(filteredTimecards.length / itemsPerPage);
  const paginatedTimecards = filteredTimecards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Export to CSV
  const exportToCSV = () => {
    const monthName = getMonthName();
    const headers = ['Month/Year', 'Name of the Employee', 'Working Hours', 'Hourly Pay', 'Total Pay'];
    
    const csvData = filteredTimecards.map(tc => {
      // Ensure hourly pay defaults to 25 if 0 or missing
      const hourlyPay = parseFloat(tc.hourlyPay || 0) || 25;
      const totalPay = hourlyPay * (tc.totalHours || 0);
      
      return [
        monthName,
        tc.name || 'Unknown',
        (tc.totalHours || 0).toFixed(2),
        hourlyPay.toFixed(2),
        totalPay.toFixed(2)
      ];
    });

    // Calculate totals
    const totalHours = filteredTimecards.reduce((sum, tc) => sum + (tc.totalHours || 0), 0);
    const totalPay = filteredTimecards.reduce((sum, tc) => {
      const hourlyPay = parseFloat(tc.hourlyPay || 0) || 25;
      return sum + (hourlyPay * (tc.totalHours || 0));
    }, 0);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      '',
      `"TOTAL","",${totalHours.toFixed(2)},,"${totalPay.toFixed(2)}"`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `monthly_timecards_${selectedMonth}.csv`;
    link.click();
    toast.success('Monthly timecards exported successfully!');
  };

  const formatDate = (dateStr) => {
    return formatUSDateLong(dateStr);
  };

  const getMonthName = () => {
    const [year, month] = selectedMonth.split('-');
    const date = new Date(year, month - 1);
    return formatUSMonthYear(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Timecard Management</h1>
          <p className="text-slate-300">View and manage all employee timecards</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Hours</p>
                <p className="text-2xl font-bold text-white">{stats.totalHours?.toFixed(1) || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Entries</p>
                <p className="text-2xl font-bold text-white">{stats.totalEntries || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Employees</p>
                <p className="text-2xl font-bold text-white">{stats.uniqueEmployees || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 backdrop-blur-sm border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Avg Hours/Entry</p>
                <p className="text-2xl font-bold text-white">
                  {stats.totalEntries > 0 ? (stats.totalHours / stats.totalEntries).toFixed(1) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center flex-wrap">
              {/* Month Selector */}
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-400" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-slate-800/50 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-800/50 border border-slate-600 text-white rounded-lg pl-10 pr-4 py-2 w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchTimecards}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Month Title */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">
            Timecards for {getMonthName()}
          </h2>
          <span className="text-slate-400">
            Showing {paginatedTimecards.length} of {filteredTimecards.length} entries
          </span>
        </div>

        {/* Timecards Table */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : paginatedTimecards.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No timecard entries found</p>
              <p className="text-slate-500 text-sm mt-2">
                {searchTerm ? 'Try adjusting your search' : 'No entries for the selected month'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="text-left text-slate-300 font-semibold px-6 py-4">Employee</th>
                      <th className="text-center text-slate-300 font-semibold px-6 py-4">Hours</th>
                      <th className="text-center text-slate-300 font-semibold px-6 py-4">Hourly Pay</th>
                      <th className="text-center text-slate-300 font-semibold px-6 py-4">Total Pay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {paginatedTimecards.map((tc) => {
                      const hourlyPay = parseFloat(tc.hourlyPay || 0) || 25;
                      const totalPay = hourlyPay * (tc.totalHours || 0);
                      
                      return (
                        <tr key={tc.userId} className="hover:bg-white/5 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600/30 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-400" />
                              </div>
                              <div>
                                <p className="text-white font-medium">{tc.name || 'Unknown'}</p>
                                <p className="text-slate-400 text-sm">{tc.email || 'N/A'}</p>
                                <p className="text-slate-500 text-xs mt-0.5 capitalize">{tc.role || ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center justify-center min-w-[60px] px-3 py-1 rounded-full font-bold ${
                              tc.totalHours >= 160 
                                ? 'bg-green-600/30 text-green-400' 
                                : tc.totalHours >= 80 
                                  ? 'bg-yellow-600/30 text-yellow-400'
                                  : 'bg-slate-600/30 text-slate-300'
                            }`}>
                              {(tc.totalHours || 0).toFixed(2)}h
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-white font-semibold">
                              ${hourlyPay.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-green-400 font-bold">
                              ${totalPay.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    
                    {/* Total Row */}
                    {filteredTimecards.length > 0 && (
                      <tr className="bg-slate-800/70 border-t-2 border-slate-600 font-bold">
                        <td className="px-6 py-4 text-white">TOTAL</td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-white font-bold">
                            {filteredTimecards.reduce((sum, tc) => sum + (tc.totalHours || 0), 0).toFixed(2)}h
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-slate-400">-</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-green-400 font-bold">
                            ${filteredTimecards.reduce((sum, tc) => {
                              const hourlyPay = parseFloat(tc.hourlyPay || 0) || 25;
                              return sum + (hourlyPay * (tc.totalHours || 0));
                            }, 0).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-slate-800/30 border-t border-slate-700/50">
                  <p className="text-slate-400 text-sm">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};


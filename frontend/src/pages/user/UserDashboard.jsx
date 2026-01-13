import React from 'react';
import { useThemeStore } from '../../store/index.js';
import { useAuthStore } from '../../store/index.js';
import { hoursAPI, reportsAPI } from '../../api/endpoints.js';
import { toast } from 'react-toastify';
import { Clock, TrendingUp, Calendar } from 'lucide-react';

export const UserDashboard = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const { user } = useAuthStore();
  const [weeklyHours, setWeeklyHours] = React.useState(0);
  const [monthlyHours, setMonthlyHours] = React.useState(0);
  const [recentLogs, setRecentLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [weeklyRes, monthlyRes, hoursRes] = await Promise.all([
        reportsAPI.getWeeklySummary(),
        reportsAPI.getMonthlySummary(),
        hoursAPI.getAll({ limit: 5 })
      ]);

      setWeeklyHours(weeklyRes.data.totalHours);
      setMonthlyHours(monthlyRes.data.totalHours);
      setRecentLogs(hoursRes.data.logs);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isDark ? 'bg-gray-950' : 'bg-gray-50'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name}!</h1>
        <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {user?.designation} • {user?.department}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${isDark ? 'card-dark' : 'card'} p-6 flex items-start justify-between`}>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>This Week</p>
              <p className="text-4xl font-bold mt-2">{weeklyHours.toFixed(1)}h</p>
            </div>
            <Clock className="w-12 h-12 text-secondary opacity-20" />
          </div>

          <div className={`${isDark ? 'card-dark' : 'card'} p-6 flex items-start justify-between`}>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>This Month</p>
              <p className="text-4xl font-bold mt-2">{monthlyHours.toFixed(1)}h</p>
            </div>
            <TrendingUp className="w-12 h-12 text-secondary opacity-20" />
          </div>

          <div className={`${isDark ? 'card-dark' : 'card'} p-6 flex items-start justify-between`}>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Entries</p>
              <p className="text-4xl font-bold mt-2">{recentLogs.length}</p>
            </div>
            <Calendar className="w-12 h-12 text-secondary opacity-20" />
          </div>
        </div>

        {/* Recent Logs */}
        <div className={`${isDark ? 'card-dark' : 'card'} p-6`}>
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          {loading ? (
            <p className="text-center py-8">Loading...</p>
          ) : recentLogs.length > 0 ? (
            <div className="space-y-4">
              {recentLogs.map((log) => (
                <div key={log._id} className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-lg flex justify-between items-start`}>
                  <div>
                    <p className="font-medium">{log.category}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(log.date).toLocaleDateString()} • {log.hoursWorked}h
                    </p>
                    {log.taskDescription && (
                      <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {log.taskDescription}
                      </p>
                    )}
                  </div>
                  {log.clientId && (
                    <span className="text-secondary font-medium">{log.clientId.name}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No hours logged yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

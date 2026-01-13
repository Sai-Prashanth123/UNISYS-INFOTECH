import React from 'react';
import { useThemeStore } from '../../store/index.js';
import { hoursAPI } from '../../api/endpoints.js';
import { toast } from 'react-toastify';
import { Calendar, Edit2, Trash2 } from 'lucide-react';

export const HoursHistory = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().toISOString().slice(0, 7));

  React.useEffect(() => {
    fetchLogs();
  }, [selectedMonth]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const startDate = new Date(selectedMonth + '-01').toISOString();
      const endDate = new Date(selectedMonth + '-31').toISOString();

      const response = await hoursAPI.getAll({
        startDate,
        endDate,
        limit: 100
      });

      setLogs(response.data.logs);
    } catch (error) {
      toast.error('Failed to fetch hours history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await hoursAPI.delete(id);
        toast.success('Entry deleted');
        fetchLogs();
      } catch (error) {
        toast.error('Failed to delete entry');
      }
    }
  };

  const totalHours = logs.reduce((sum, log) => sum + log.hoursWorked, 0);

  return (
    <div className={isDark ? 'bg-gray-950' : 'bg-gray-50'}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
          <Calendar className="w-10 h-10 text-secondary" />
          Hours History
        </h1>

        {/* Month Selector */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">Select Month</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={isDark ? 'input-field-dark max-w-xs' : 'input-field max-w-xs'}
          />
        </div>

        {/* Summary Card */}
        <div className={`${isDark ? 'card-dark' : 'card'} p-6 mb-8`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Hours</p>
              <p className="text-3xl font-bold mt-2 text-secondary">{totalHours.toFixed(1)}h</p>
            </div>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Entries</p>
              <p className="text-3xl font-bold mt-2">{logs.length}</p>
            </div>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Average Per Day</p>
              <p className="text-3xl font-bold mt-2">{logs.length > 0 ? (totalHours / logs.length).toFixed(1) : 0}h</p>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className={`${isDark ? 'card-dark' : 'card'} p-6`}>
          {loading ? (
            <p className="text-center py-8">Loading...</p>
          ) : logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="text-left p-4 font-semibold">Date</th>
                    <th className="text-left p-4 font-semibold">Category</th>
                    <th className="text-left p-4 font-semibold">Hours</th>
                    <th className="text-left p-4 font-semibold">Task Description</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="p-4 font-medium">{new Date(log.date).toLocaleDateString()}</td>
                      <td className="p-4">{log.category}</td>
                      <td className="p-4 font-bold text-secondary">{log.hoursWorked}h</td>
                      <td className={`p-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {log.taskDescription || '-'}
                      </td>
                      <td className="p-4 flex gap-2">
                        <button className="p-2 text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(log._id)}
                          className="p-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No entries for this month</p>
          )}
        </div>
      </div>
    </div>
  );
};

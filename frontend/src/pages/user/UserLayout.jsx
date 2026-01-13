import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/index.js';
import { useAuthStore } from '../../store/index.js';
import { LayoutDashboard, Clock, Calendar, LogOut, ArrowLeft } from 'lucide-react';

const UserLayout = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname.includes(path);

  const handleLogout = () => {
    logout();
    navigate('/role-selection');
  };

  const handleBack = () => {
    navigate('/role-selection');
  };

  return (
    <div className={`flex h-screen ${isDark ? 'bg-gray-950 text-white' : 'bg-white'}`}>
      {/* Sidebar */}
      <div className={`w-64 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'} border-r p-6 flex flex-col`}>
        <button
          onClick={handleBack}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-4 transition text-sm ${isDark ? 'hover:bg-gray-800 text-slate-300' : 'hover:bg-gray-200 text-slate-700'}`}
        >
          <ArrowLeft size={20} />
          Back to Role Selection
        </button>
        <div className="mb-8">
          <h2 className={`text-2xl font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>EMPLOYEE PANEL</h2>
        </div>

        <nav className="space-y-2 flex-1">
          <Link
            to="/user/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive('/user/dashboard')
                ? 'bg-indigo-600 text-white'
                : `${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`
            }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>

          <Link
            to="/user/log-hours"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive('/user/log-hours')
                ? 'bg-indigo-600 text-white'
                : `${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`
            }`}
          >
            <Clock size={20} />
            Log Hours
          </Link>

          <Link
            to="/user/history"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive('/user/history')
                ? 'bg-indigo-600 text-white'
                : `${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`
            }`}
          >
            <Calendar size={20} />
            History
          </Link>
        </nav>

        <div className={`pt-6 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="mb-4">
            <p className="text-sm text-gray-500">Logged in as:</p>
            <p className="font-medium">{user?.name || 'User'}</p>
            {user?.designation && (
              <p className="text-sm text-gray-500 mt-1">{user.designation}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default UserLayout;

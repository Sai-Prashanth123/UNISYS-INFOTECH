import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/index.js';
import { useAuthStore } from '../../store/index.js';
import { LayoutDashboard, Users, BarChart3, LogOut, Image, Briefcase, UserCog, ArrowLeft, Mail, Receipt, Menu, X, Clock, FileText } from 'lucide-react';

const AdminLayout = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname.includes(path);

  const handleLogout = () => {
    logout();
    navigate('/role-selection');
  };

  const handleBack = () => {
    navigate('/role-selection');
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628]">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-3 left-3 sm:top-4 sm:left-4 z-50 p-2.5 sm:p-2 bg-blue-600 text-white rounded-lg shadow-lg active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        {sidebarOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={20} className="sm:w-6 sm:h-6" />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 p-4 lg:p-6 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg mb-4 transition text-xs sm:text-sm text-slate-300 hover:bg-white/10 active:scale-95 min-h-[44px]"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Back to Role Selection</span>
          <span className="sm:hidden">Back</span>
        </button>
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white">ADMIN PANEL</h2>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto">
          <Link
            to="/admin/dashboard"
            onClick={closeSidebar}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition active:scale-95 min-h-[44px] ${
              isActive('/admin/dashboard')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <LayoutDashboard size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-sm lg:text-base">Dashboard</span>
          </Link>

          <Link
            to="/admin/users"
            onClick={closeSidebar}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive('/admin/users')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <UserCog size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-sm lg:text-base">User Management</span>
          </Link>

          <Link
            to="/admin/clients"
            onClick={closeSidebar}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition active:scale-95 min-h-[44px] ${
              isActive('/admin/clients')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Users size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-sm lg:text-base">Clients</span>
          </Link>

          <Link
            to="/admin/reports"
            onClick={closeSidebar}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition active:scale-95 min-h-[44px] ${
              isActive('/admin/reports')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <BarChart3 size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-sm lg:text-base">Reports</span>
          </Link>

          <Link
            to="/admin/timecards"
            onClick={closeSidebar}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition active:scale-95 min-h-[44px] ${
              isActive('/admin/timecards')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Clock size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-sm lg:text-base">Timecards</span>
          </Link>

          <Link
            to="/admin/client-logos"
            onClick={closeSidebar}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition active:scale-95 min-h-[44px] ${
              isActive('/admin/client-logos')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Image size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-sm lg:text-base">Client Logos</span>
          </Link>

          <Link
            to="/admin/jobs"
            onClick={closeSidebar}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition active:scale-95 min-h-[44px] ${
              isActive('/admin/jobs') && !isActive('/admin/job-applications')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Briefcase size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-sm lg:text-base">Jobs</span>
          </Link>

          <Link
            to="/admin/job-applications"
            onClick={closeSidebar}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition active:scale-95 min-h-[44px] ${
              isActive('/admin/job-applications')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <FileText size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-sm lg:text-base">Job Applications</span>
          </Link>

          <Link
            to="/admin/contact-messages"
            onClick={closeSidebar}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition active:scale-95 min-h-[44px] ${
              isActive('/admin/contact-messages')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Mail size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-sm lg:text-base">Contact Messages</span>
          </Link>

          <Link
            to="/admin/invoices"
            onClick={closeSidebar}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition active:scale-95 min-h-[44px] ${
              isActive('/admin/invoices')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Receipt size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-sm lg:text-base">Invoice</span>
          </Link>
        </nav>

        <div className="pt-6 border-t border-white/10">
          <div className="mb-4">
            <p className="text-sm text-slate-400">Logged in as:</p>
            <p className="font-medium text-white">{user?.name || 'Admin'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition active:scale-95 min-h-[44px]"
          >
            <LogOut size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-14 sm:pt-16 lg:pt-0">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;

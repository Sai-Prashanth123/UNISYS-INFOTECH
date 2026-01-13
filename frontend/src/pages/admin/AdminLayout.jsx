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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
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
          className="flex items-center gap-2 px-4 py-2 rounded-lg mb-4 transition text-sm text-slate-300 hover:bg-white/10"
        >
          <ArrowLeft size={20} />
          Back to Role Selection
        </button>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">ADMIN PANEL</h2>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto">
          <Link
            to="/admin/dashboard"
            onClick={closeSidebar}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive('/admin/dashboard')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <LayoutDashboard size={20} />
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
            <UserCog size={20} />
            <span className="text-sm lg:text-base">User Management</span>
          </Link>

          <Link
            to="/admin/clients"
            onClick={closeSidebar}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive('/admin/clients')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Users size={20} />
            <span className="text-sm lg:text-base">Clients</span>
          </Link>

          <Link
            to="/admin/reports"
            onClick={closeSidebar}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive('/admin/reports')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <BarChart3 size={20} />
            <span className="text-sm lg:text-base">Reports</span>
          </Link>

          <Link
            to="/admin/timecards"
            onClick={closeSidebar}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive('/admin/timecards')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Clock size={20} />
            <span className="text-sm lg:text-base">Timecards</span>
          </Link>

          <Link
            to="/admin/client-logos"
            onClick={closeSidebar}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive('/admin/client-logos')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Image size={20} />
            <span className="text-sm lg:text-base">Client Logos</span>
          </Link>

          <Link
            to="/admin/jobs"
            onClick={closeSidebar}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive('/admin/jobs') && !isActive('/admin/job-applications')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Briefcase size={20} />
            <span className="text-sm lg:text-base">Jobs</span>
          </Link>

          <Link
            to="/admin/job-applications"
            onClick={closeSidebar}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive('/admin/job-applications')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <FileText size={20} />
            <span className="text-sm lg:text-base">Job Applications</span>
          </Link>

          <Link
            to="/admin/contact-messages"
            onClick={closeSidebar}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive('/admin/contact-messages')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Mail size={20} />
            <span className="text-sm lg:text-base">Contact Messages</span>
          </Link>

          <Link
            to="/admin/invoices"
            onClick={closeSidebar}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive('/admin/invoices')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Receipt size={20} />
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-16 lg:pt-0">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;

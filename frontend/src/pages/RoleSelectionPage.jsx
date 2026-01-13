import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore, useAuthStore } from '../store/index.js';
import { Briefcase, Users, Shield, Home } from 'lucide-react';

/**
 * Role Selection Page
 * User selects their role before proceeding to login
 * Ensures role-based authentication flow
 */
export const RoleSelectionPage = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const roles = [
    {
      id: 'employer',
      title: 'Login as Employer',
      description: 'View employee timecards and manage your team',
      icon: Briefcase,
      colorClass: 'bg-indigo-600 hover:bg-indigo-700',
      path: '/login/employer',
      dashboardPath: '/employer/dashboard',
      demoUser: { name: 'Demo Employer', email: 'employer@demo.com', role: 'employer' }
    },
    {
      id: 'employee',
      title: 'Login as Employee',
      description: 'Submit your working hours and manage timecards',
      icon: Users,
      colorClass: 'bg-blue-600 hover:bg-blue-700',
      path: '/login/employee',
      dashboardPath: '/employee/timecards',
      demoUser: { name: 'Demo Employee', email: 'employee@demo.com', role: 'employee' }
    },
    {
      id: 'admin',
      title: 'Admin Portal',
      description: 'Full system access and user management',
      icon: Shield,
      colorClass: 'bg-purple-600 hover:bg-purple-700',
      path: '/login/admin',
      dashboardPath: '/admin/dashboard',
      demoUser: { name: 'Demo Admin', email: 'admin@demo.com', role: 'admin' }
    }
  ];

  const handleRoleSelect = (path) => {
    navigate(path);
  };

  const handleDirectLogin = (role) => {
    // Direct login without password
    login({
      user: role.demoUser,
      token: 'demo-token-' + role.id
    });
    navigate(role.dashboardPath);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Welcome to UNISYS INFOTECH
          </h1>
          <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Select your role to continue
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                className={`group relative p-8 rounded-2xl transition-all duration-300 ${
                  isDark 
                    ? 'bg-slate-800 border border-slate-700' 
                    : 'bg-white border border-slate-200 shadow-lg'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-full ${role.colorClass.split(' ')[0]} flex items-center justify-center mb-4 transition-transform`}>
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {role.title}
                  </h3>
                  <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {role.description}
                  </p>
                  
                  {/* Direct Login Button */}
                  <button
                    onClick={() => handleDirectLogin(role)}
                    className={`mt-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${role.colorClass} text-white shadow-md hover:shadow-lg`}
                  >
                    Quick Login (No Password)
                  </button>
                  
                  {/* Regular Login Button */}
                  <button
                    onClick={() => handleRoleSelect(role.path)}
                    className={`mt-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }`}
                  >
                    Login with Credentials
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-md hover:shadow-lg'
            }`}
          >
            <Home size={20} />
            Back to Homepage
          </button>
        </div>

        <div className={`mt-12 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
          <p>Don't have an account? Contact your administrator to create one.</p>
        </div>
      </div>
    </div>
  );
};

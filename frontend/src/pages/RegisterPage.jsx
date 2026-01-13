import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/index.js';
import { Shield, ArrowLeft } from 'lucide-react';

/**
 * Register Page - DISABLED
 * Self-registration is disabled. Only admin can create accounts.
 * This page shows a message directing users to contact administrator.
 */
export const RegisterPage = () => {
  const navigate = useNavigate();
  const isDark = useThemeStore((state) => state.isDark);

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-50'} p-4 animate-fade-in`}>
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-2xl w-full max-w-md p-8 text-center shadow-xl`}>
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center">
            <Shield size={40} className="text-white" />
          </div>
        </div>

        <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Registration Disabled
        </h1>

        <p className={`text-lg mb-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Self-registration is currently disabled for security purposes.
        </p>

        <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
          <p className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            To create an account, please contact your system administrator. Only administrators can create new user accounts for Employers and Employees.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Go to Login
          </button>

          <button
            onClick={() => navigate('/')}
            className={`w-full flex items-center justify-center gap-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'} font-semibold py-3 rounded-lg transition-colors`}
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
        </div>

        <div className={`mt-6 text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
          <p>Need assistance? Contact your IT department or system administrator.</p>
        </div>
      </div>
    </div>
  );
};

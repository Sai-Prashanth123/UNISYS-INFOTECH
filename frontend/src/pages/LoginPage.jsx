import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useThemeStore } from '../store/index.js';
import { authAPI } from '../api/endpoints.js';
import { toast } from 'react-toastify';
import { Lock, Mail } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const isDark = useThemeStore((state) => state.isDark);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      setToken(response.data.token);
      setUser(response.data.user);
      toast.success('Logged in successfully!');
      navigate(response.data.user.role === 'admin' ? '/admin' : '/user');
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        toast.error('Cannot connect to server. Please ensure the backend server is running on port 5001.');
      } else {
        toast.error(error.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-[calc(100vh-64px)] flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-100'} p-4 animate-fade-in`}>
      <div className={`${isDark ? 'glass-effect-dark' : 'glass-effect'} rounded-2xl w-full max-w-md p-8 animate-scale-in backdrop-blur-2xl`}>
        <h1 className={`text-3xl font-bold mb-2 text-center ${isDark ? 'text-white' : 'text-slate-900'} animate-slide-up`}>Welcome Back</h1>
        <p className={`text-center mb-8 animate-slide-up ${isDark ? 'text-white' : 'text-slate-700'}`} style={{animationDelay: '0.1s'}}>Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="animate-slide-up" style={{animationDelay: '0.2s'}}>
            <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'} mb-2`}>Email Address</label>
            <div className={`flex items-center gap-2 ${isDark ? 'bg-slate-800/40' : 'bg-white/40'} backdrop-blur-sm border ${isDark ? 'border-slate-700' : 'border-slate-300'} rounded-lg px-4 py-3 focus-within:border-indigo-600 transition-colors duration-300`}>
              <Mail size={18} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`flex-1 bg-transparent outline-none text-lg ${isDark ? 'text-white placeholder-slate-400' : 'text-slate-900 placeholder-slate-500'}`}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div className="animate-slide-up" style={{animationDelay: '0.3s'}}>
            <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'} mb-2`}>Password</label>
            <div className={`flex items-center gap-2 ${isDark ? 'bg-slate-800/40' : 'bg-white/40'} backdrop-blur-sm border ${isDark ? 'border-slate-700' : 'border-slate-300'} rounded-lg px-4 py-3 focus-within:border-indigo-600 transition-colors duration-300`}>
              <Lock size={18} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`flex-1 bg-transparent outline-none text-lg ${isDark ? 'text-white placeholder-slate-400' : 'text-slate-900 placeholder-slate-500'}`}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 mt-8 animate-slide-up shadow-lg hover:shadow-2xl"
            style={{animationDelay: '0.4s'}}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <p className={`text-center mt-8 text-lg ${isDark ? 'text-white' : 'text-slate-700'}`}>
          Don't have an account? <a href="/register" className={`font-semibold transition-colors duration-300 ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}>Sign up</a>
        </p>
      </div>
    </div>
  );
};

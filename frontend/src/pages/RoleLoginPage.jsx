import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuthStore, useThemeStore } from '../store/index.js';
import { authAPI } from '../api/endpoints.js';
import { toast } from 'react-toastify';
import { Lock, Mail, Briefcase, Users, Shield, Home, KeyRound, AlertCircle, UserX, Ban, Phone, HelpCircle } from 'lucide-react';

/**
 * Role-Specific Login Component
 * Handles login for Employer, Employee, and Admin roles
 * Validates credentials against selected role
 */
export const RoleLoginPage = () => {
  const { role } = useParams(); // 'employer', 'employee', or 'admin'
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [errorCode, setErrorCode] = React.useState('');
  const navigate = useNavigate();
  const { logout, setUser, setToken } = useAuthStore();
  const isDark = useThemeStore((state) => state.isDark);

  // Clear any existing auth state when login page loads
  // This ensures user starts fresh when they visit login page
  React.useEffect(() => {
    logout();
  }, [logout]);

  // Role configuration
  const roleConfig = {
    employer: {
      title: 'Manager Login',
      description: 'Access your team dashboard',
      icon: Briefcase,
      color: 'indigo',
      redirectPath: '/employer/dashboard'
    },
    employee: {
      title: 'Employee Login',
      description: 'Manage your timecards',
      icon: Users,
      color: 'blue',
      redirectPath: '/employee/timecards'
    },
    admin: {
      title: 'Admin/Manager Portal',
      description: 'System administration',
      icon: Shield,
      color: 'purple',
      redirectPath: '/admin/dashboard'
    }
  };

  const config = roleConfig[role] || roleConfig.admin;
  const Icon = config.icon;

  // Clear error when user types
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
      setErrorCode('');
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) {
      setError('');
      setErrorCode('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send selected role to backend for validation
      const response = await authAPI.login({ 
        email, 
        password, 
        selectedRole: role 
      });

      setToken(response.data.token);
      setUser(response.data.user);
      toast.success(`Welcome back, ${response.data.user.name}!`);
      
      // Navigate based on user's actual role
      if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (response.data.user.role === 'employer') {
        navigate('/employer/dashboard');
      } else if (response.data.user.role === 'employee') {
        navigate('/employee/timecards');
      } else {
        navigate('/user/dashboard'); // Fallback for legacy users
      }
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        setError('Cannot connect to server. Please try again later.');
        setErrorCode('NETWORK_ERROR');
      } else {
        const errorResponse = err.response?.data;
        setError(errorResponse?.message || 'Invalid email or password. Please try again.');
        setErrorCode(errorResponse?.errorCode || 'UNKNOWN_ERROR');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in relative overflow-hidden bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl w-full max-w-md p-8 animate-scale-in shadow-2xl">
        {/* Header with icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Icon size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-slate-900">
            {config.title}
          </h1>
          <p className="text-slate-600">
            {config.description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message - Different styles based on error type */}
          {error && (
            <>
              {/* Account Deactivated Error */}
              {errorCode === 'ACCOUNT_DEACTIVATED' && (
                <div className="bg-orange-50 border border-orange-300 rounded-xl p-5 animate-shake">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Ban className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-orange-800 font-bold text-base">Account Deactivated</h4>
                      <p className="text-orange-700 text-sm mt-1">{error}</p>
                      <div className="mt-3 p-3 bg-orange-100 rounded-lg">
                        <p className="text-orange-800 text-xs font-medium mb-2">Need Help?</p>
                        <div className="flex flex-col gap-1">
                          <a 
                            href="mailto:admin@unisys.com" 
                            className="text-orange-600 hover:text-orange-800 text-sm flex items-center gap-2 transition-colors"
                          >
                            <Mail size={14} />
                            admin@unisys.com
                          </a>
                          <a 
                            href="tel:+1234567890" 
                            className="text-orange-600 hover:text-orange-800 text-sm flex items-center gap-2 transition-colors"
                          >
                            <Phone size={14} />
                            Contact Support
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Not Found Error */}
              {errorCode === 'ACCOUNT_NOT_FOUND' && (
                <div className="bg-slate-50 border border-slate-300 rounded-xl p-5 animate-shake">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <UserX className="w-6 h-6 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-slate-800 font-bold text-base">Account Not Found</h4>
                      <p className="text-slate-600 text-sm mt-1">{error}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-slate-500 text-xs flex items-center gap-1">
                          <HelpCircle size={12} />
                          Make sure you're using the correct email
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Invalid Password Error */}
              {errorCode === 'INVALID_PASSWORD' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-shake">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-700 font-medium text-sm">{error}</p>
                      <p className="text-red-600 text-xs mt-2">
                        <Link to="/forgot-password" className="underline hover:text-red-800 font-medium">
                          Forgot your password? Click here to reset
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Generic/Other Errors */}
              {!['ACCOUNT_DEACTIVATED', 'ACCOUNT_NOT_FOUND', 'INVALID_PASSWORD'].includes(errorCode) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-medium text-sm">{error}</p>
                    <p className="text-red-600 text-xs mt-1">
                      Please check your credentials or <Link to="/forgot-password" className="underline hover:text-red-800">reset your password</Link>
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <div className={`flex items-center gap-2 bg-slate-50 border rounded-lg px-4 py-3 focus-within:ring-2 transition-all duration-300 ${
              error ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500/20' : 'border-slate-300 focus-within:border-blue-500 focus-within:ring-blue-500/20'
            }`}>
              <Mail size={18} className={error ? 'text-red-400' : 'text-slate-500'} />
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className="flex-1 bg-transparent outline-none text-slate-900 placeholder-slate-500"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
              >
                <KeyRound size={14} />
                Forgot / Reset Password
              </Link>
            </div>
            <div className={`flex items-center gap-2 bg-slate-50 border rounded-lg px-4 py-3 focus-within:ring-2 transition-all duration-300 ${
              error ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500/20' : 'border-slate-300 focus-within:border-blue-500 focus-within:ring-blue-500/20'
            }`}>
              <Lock size={18} className={error ? 'text-red-400' : 'text-slate-500'} />
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                className="flex-1 bg-transparent outline-none text-slate-900 placeholder-slate-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900/90 backdrop-blur-lg hover:bg-slate-900 text-white font-bold py-3.5 rounded-lg transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl border border-white/10"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-sm flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Home size={16} />
            Back to Homepage
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Need help? Contact your administrator.</p>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/index.js';
import { supabase } from '../config/supabase.js';
import { authAPI } from '../api/endpoints.js';
import { toast } from 'react-toastify';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Loader2, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';

/**
 * Reset Password Page
 * Handles Supabase Auth password reset callback
 * When user clicks the reset link from email, Supabase redirects here with token in URL hash
 */
export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const isDark = useThemeStore((state) => state.isDark);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Supabase Auth callback on mount
  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      setVerifying(true);

      // Supabase Auth sends the recovery token in the URL hash
      // The hash format is: #access_token=xxx&type=recovery&...
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      const errorParam = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');

      // Check for error in URL
      if (errorParam) {
        console.error('Auth callback error:', errorParam, errorDescription);
        setErrorMessage(decodeURIComponent(errorDescription || errorParam));
        setSessionValid(false);
        setVerifying(false);
        return;
      }

      // If we have a recovery type, Supabase has authenticated the user
      if (type === 'recovery' && accessToken) {
        // Set the session using the access token from URL
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || '',
        });

        if (error) {
          console.error('Session error:', error);
          setErrorMessage(error.message);
          setSessionValid(false);
        } else if (data.session) {
          setSessionValid(true);
          setUserEmail(data.session.user?.email || '');
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname);
        }
        setVerifying(false);
        return;
      }

      // Check if there's an existing session (user might refresh the page)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        setErrorMessage(sessionError.message);
        setSessionValid(false);
        setVerifying(false);
        return;
      }

      if (session) {
        // Check if this is a recovery session
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setSessionValid(true);
          setUserEmail(user.email || '');
        } else {
          setSessionValid(false);
          setErrorMessage('Invalid or expired reset link. Please request a new one.');
        }
      } else {
        // No session and no token in URL - invalid access
        setSessionValid(false);
        setErrorMessage('Invalid or expired reset link. Please request a new one.');
      }

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth event:', event);
        if (event === 'PASSWORD_RECOVERY' && session) {
          setSessionValid(true);
          setUserEmail(session.user?.email || '');
          setVerifying(false);
        }
      });

      setVerifying(false);

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('Auth callback error:', error);
      setSessionValid(false);
      setErrorMessage('An error occurred. Please try again.');
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Update password using Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        toast.error(updateError.message || 'Failed to reset password');
        return;
      }

      // Also sync the password to the custom users table
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          await authAPI.resetPassword({
            email: user.email,
            password: password,
            confirmPassword: confirmPassword,
            supabaseSync: true
          });
        }
      } catch (syncError) {
        // Log but don't fail - Supabase Auth password is already updated
        console.warn('Backend sync warning:', syncError);
      }

      // Sign out from Supabase Auth session
      await supabase.auth.signOut();
      
      setResetSuccess(true);
      toast.success('Password reset successful!');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'Medium', color: 'bg-yellow-500' };
    return { strength, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  // Loading state while verifying
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid session state
  if (!sessionValid && !verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#1a2942]/80 backdrop-blur-xl border border-red-900/30 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Invalid Reset Link</h2>
            <p className="text-slate-400 mb-6">
              {errorMessage || 'This password reset link is invalid or has expired. Please request a new one.'}
            </p>
            <div className="space-y-3">
              <Link
                to="/forgot-password"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Request New Link
              </Link>
              <Link
                to="/login/employee"
                className="block w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#1a2942]/80 backdrop-blur-xl border border-green-900/30 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Password Reset Successful!</h2>
            <p className="text-slate-400 mb-6">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            <Link
              to="/login/employee"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link 
          to="/login/employee" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Login</span>
        </Link>

        <div className="bg-[#1a2942]/80 backdrop-blur-xl border border-blue-900/30 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Reset Your Password</h1>
            {userEmail && (
              <p className="text-slate-400">
                for <span className="text-white font-medium">{userEmail}</span>
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-blue-900/50 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          level <= passwordStrength.strength
                            ? passwordStrength.color
                            : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${
                    passwordStrength.strength <= 2 ? 'text-red-400' :
                    passwordStrength.strength <= 3 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {passwordStrength.label} password
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-red-500 focus:border-red-500'
                      : confirmPassword && password === confirmPassword
                      ? 'border-green-500 focus:border-green-500'
                      : 'border-blue-900/50 focus:border-blue-500'
                  }`}
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-green-400 text-xs mt-1">Passwords match ✓</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || password !== confirmPassword || password.length < 6}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/25 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Resetting...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </form>

          {/* Password Requirements */}
          <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <p className="text-sm font-medium text-slate-300 mb-2">Password Requirements:</p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li className={password.length >= 6 ? 'text-green-400' : ''}>
                • At least 6 characters
              </li>
              <li className={/[A-Z]/.test(password) ? 'text-green-400' : ''}>
                • One uppercase letter (recommended)
              </li>
              <li className={/[0-9]/.test(password) ? 'text-green-400' : ''}>
                • One number (recommended)
              </li>
              <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-400' : ''}>
                • One special character (recommended)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

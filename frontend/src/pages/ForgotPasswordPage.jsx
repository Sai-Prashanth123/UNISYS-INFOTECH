import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../store/index.js';
import { supabase } from '../config/supabase.js';
import { toast } from 'react-toastify';
import { Mail, ArrowLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

/**
 * Forgot Password Page
 * Uses Supabase Auth directly for password reset
 * Supabase handles sending the reset email automatically
 */
export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const isDark = useThemeStore((state) => state.isDark);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use Supabase Auth to send password reset email
      // Supabase handles the email delivery automatically
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        console.error('Password reset error:', resetError);
        // Check for specific errors
        if (resetError.message.includes('User not found') || resetError.message.includes('Email not confirmed')) {
          // Still show success to prevent email enumeration
          setSubmitted(true);
          toast.success('If an account exists, a reset link has been sent!');
        } else {
          setError(resetError.message);
          toast.error(resetError.message);
        }
      } else {
        setSubmitted(true);
        toast.success('Password reset email sent!');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An error occurred. Please try again.');
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] p-4">
      <div className="w-full max-w-md">
        {/* Back to Login Link */}
        <Link 
          to="/login/employee" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Login</span>
        </Link>

        <div className="bg-[#1a2942]/80 backdrop-blur-xl border border-blue-900/30 rounded-2xl p-8 shadow-2xl">
          {!submitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Forgot / Reset Password</h1>
                <p className="text-slate-400">
                  Enter your email address to reset your password. Use this if you forgot your password or want to change your default password.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-600/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3 mb-5">
                  <AlertCircle size={20} />
                  <p>{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-blue-900/50 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder="Enter your email"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/25"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-slate-400 text-sm">
                  Remember your password?{' '}
                  <Link to="/login/employee" className="text-blue-400 hover:text-blue-300 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-slate-400 mb-6">
                If an account exists with <span className="text-white font-medium">{email}</span>, 
                you will receive a password reset link shortly.
              </p>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6 text-left">
                <p className="text-blue-300 text-sm">
                  <strong>📧 Check your inbox</strong>
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  The reset link will expire in 1 hour. If you don't see the email, check your spam folder.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                    setError('');
                  }}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Try Different Email
                </button>
                <Link
                  to="/login/employee"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Need help? Contact your administrator.
        </p>
      </div>
    </div>
  );
};

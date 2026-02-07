import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../store/index.js';
import { authAPI } from '../api/endpoints.js';
import { toast } from 'react-toastify';
import { Mail, ArrowLeft, CheckCircle, Loader2, AlertCircle, Shield, ShieldCheck } from 'lucide-react';

/**
 * Admin Forgot Password Page
 * 1. Admin enters their email
 * 2. Backend verifies the email belongs to an admin account
 * 3. If verified, sends Supabase Auth password reset email
 * 4. All links redirect back to admin login
 */
export const AdminForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('email'); // 'email' | 'sent'
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call backend endpoint that verifies admin email and sends reset
      const response = await authAPI.adminForgotPassword({ email: email.trim().toLowerCase() });

      if (response.data.success) {
        setStep('sent');
        toast.success('Password reset email sent!');
      }
    } catch (err) {
      console.error('Admin password reset error:', err);
      const errorMsg = err.response?.data?.message || 'An error occurred. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] p-4">
      <div className="w-full max-w-md">
        {/* Back to Admin Login Link */}
        <Link 
          to="/login/admin" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Admin Login</span>
        </Link>

        <div className="bg-[#1a2942]/80 backdrop-blur-xl border border-purple-900/30 rounded-2xl p-8 shadow-2xl">
          {step === 'email' ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Admin Password Reset</h1>
                <p className="text-slate-400">
                  Enter your admin email address. We'll verify it belongs to an admin account and send you a secure reset link.
                </p>
              </div>

              {/* Security Notice */}
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <ShieldCheck size={18} className="text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-purple-300">
                    For security, this only works for verified admin accounts. The reset link will be sent to your registered admin email.
                  </p>
                </div>
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
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-purple-900/50 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                      placeholder="Enter your admin email"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/25"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying & Sending...</span>
                    </>
                  ) : (
                    <>
                      <Shield size={18} />
                      <span>Verify & Send Reset Link</span>
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-slate-400 text-sm">
                  Remember your password?{' '}
                  <Link to="/login/admin" className="text-purple-400 hover:text-purple-300 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          ) : (
            /* Success State — Email Sent */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-slate-400 mb-6">
                A password reset link has been sent to{' '}
                <span className="text-white font-medium">{email}</span>.
              </p>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-6 text-left">
                <p className="text-purple-300 text-sm">
                  <strong>📧 Check your inbox</strong>
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  The reset link will expire in 1 hour. If you don't see the email, check your spam folder.
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  After resetting, you'll be redirected back to the <strong className="text-white">Admin Login</strong> page.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setStep('email');
                    setEmail('');
                    setError('');
                  }}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Try Different Email
                </button>
                <Link
                  to="/login/admin"
                  className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center"
                >
                  Back to Admin Login
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <p className="text-center text-slate-500 text-sm mt-6">
          This page is only for admin accounts.{' '}
          <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300">
            Employee / Manager reset →
          </Link>
        </p>
      </div>
    </div>
  );
};

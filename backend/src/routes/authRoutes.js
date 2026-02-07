import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { protect } from '../middleware/auth.js';
import supabase from '../config/supabase.js';
import { sendPasswordResetEmail, isEmailConfigured } from '../utils/emailService.js';
import { authLimiter, passwordResetLimiter } from '../middleware/security.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Admin email – single source of truth for the admin account
const ADMIN_EMAIL = 'bhanu.kilaru@unisysinfotech.com';

// Helper: check if an email belongs to the admin account
const isAdminEmail = (email) => {
  return email && email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase();
};

// Production frontend URL – only this link is used in production (no localhost)
const PRODUCTION_FRONTEND_URL = 'https://www.unisysinfotech.com';
const getFrontendUrl = () => {
  if (process.env.NODE_ENV === 'production') return PRODUCTION_FRONTEND_URL;
  const env = process.env.FRONTEND_URL || 'http://localhost:5173';
  if (env.includes('azurestaticapps.net')) return PRODUCTION_FRONTEND_URL;
  return env;
};

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Generate secure reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Register - DISABLED (Admin creates users only)
// This endpoint is kept for backward compatibility but returns 403
router.post('/register', authLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('designation').optional().trim(),
  body('department').optional().trim()
], async (req, res) => {
  // Self-registration is disabled
  // Only admin can create user accounts
  return res.status(403).json({ 
    message: 'Self-registration is disabled. Please contact your administrator to create an account.' 
  });
});

// Login - Role-based authentication
// Frontend sends selectedRole to validate against user's actual role
router.post('/login', authLimiter, [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  body('selectedRole').optional().isIn(['admin', 'employer', 'employee']).withMessage('Invalid role selection')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, selectedRole } = req.body;

    // Find user in Supabase by email (case-insensitive)
    // Note: Supabase stores emails as lowercase in our schema
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    if (fetchError) {
      console.error('Supabase query error:', fetchError);
      return res.status(500).json({ message: 'Server error', error: fetchError.message });
    }

    if (!users || users.length === 0) {
      // Account doesn't exist - return specific error code
      return res.status(404).json({ 
        message: 'No account found with this email address. Please check your email or contact your administrator.',
        errorCode: 'ACCOUNT_NOT_FOUND'
      });
    }

    const user = users[0];

    // Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Invalid password. Please try again or reset your password.',
        errorCode: 'INVALID_PASSWORD'
      });
    }

    // Check if account is deactivated
    if (user.is_active === false) {
      return res.status(403).json({ 
        message: 'Your account has been deactivated. Please contact your administrator to reactivate your account.',
        errorCode: 'ACCOUNT_DEACTIVATED',
        supportEmail: 'admin@unisys.com'
      });
    }

    // Admin login restriction: only the designated admin email can log in as admin
    if (user.role === 'admin') {
      if (!isAdminEmail(user.email)) {
        return res.status(403).json({
          message: 'Admin access is restricted. You do not have permission to log in as administrator.',
          errorCode: 'ADMIN_ACCESS_RESTRICTED'
        });
      }
    }

    // Role validation: ensure selected role matches user's actual role
    if (selectedRole && selectedRole !== user.role) {
      return res.status(403).json({ 
        message: `You cannot login as ${selectedRole}. Your account role is ${user.role}.` 
      });
    }

    // Use the public.users table ID (not supabase_auth_id) for JWT
    const token = generateToken(user.id, user.role);
    logger.info('User logged in', { userId: user.id, email: user.email, role: user.role });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation || '',
        department: user.department || '',
        employerId: user.employer_id || null,
        mustResetPassword: user.must_reset_password === true
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, designation, department, employer_id, is_active, must_reset_password, created_at, updated_at')
      .eq('id', req.user.id)
      .limit(1);

    if (error) {
      logger.error('Error fetching current user', { error: error.message, userId: req.user.id });
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    if (!users || users.length === 0) {
      // User ID from JWT no longer exists - stale session
      return res.status(401).json({ 
        message: 'Your session is invalid. Please log in again.',
        errorCode: 'SESSION_INVALID'
      });
    }

    const user = users[0];

    // Transform to match expected format (camelCase and remove password)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation || '',
      department: user.department || '',
      employerId: user.employer_id || null,
      mustResetPassword: user.must_reset_password === true,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };

    res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Logout (client-side: remove token)
router.post('/logout', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * FORGOT PASSWORD - Request password reset
 * POST /api/auth/forgot-password
 * Public endpoint - no auth required
 */
router.post('/forgot-password', passwordResetLimiter, [
  body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, is_active, supabase_auth_id')
      .eq('email', normalizedEmail)
      .limit(1);

    if (fetchError) {
      console.error('Supabase query error:', fetchError);
      return res.status(500).json({ message: 'Server error' });
    }

    // Always return success to prevent email enumeration attacks
    if (!users || users.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      });
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      });
    }

    // SECURITY: Block password reset for admin accounts via public forgot-password flow.
    // Admin password can only be changed by the admin themselves while logged in.
    if (user.role === 'admin') {
      logger.warn('Blocked password reset attempt for admin account', { email: normalizedEmail });
      // Return same generic message to prevent email/role enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      });
    }

    logger.info('Password reset requested', { email: user.email });

    // OPTION 1: Use Supabase Auth for password reset (if user is synced)
    if (user.supabase_auth_id) {
      logger.info('Using Supabase Auth for password reset', { email: user.email });
      
      const frontendUrl = getFrontendUrl();
      const redirectUrl = `${frontendUrl}/reset-password`;

      // Log the redirect URL being used (for debugging)
      logger.info('Password reset redirect URL', { redirectUrl, frontendUrl, envVar: process.env.FRONTEND_URL });
      
      // Use Supabase Auth to send password reset email
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo: redirectUrl
        }
      );

      if (authError) {
        logger.error('Supabase Auth reset error', { error: authError.message, email: user.email });
        // Fall through to legacy method below
      } else {
        logger.info('Password reset email sent via Supabase Auth', { email: user.email });
        return res.status(200).json({
          success: true,
          message: 'If an account exists with this email, you will receive a password reset link.'
        });
      }
    }

    // OPTION 2: Legacy method (for users not synced to Supabase Auth)
    logger.info('Using legacy method for password reset', { email: user.email });

    // Delete any existing reset tokens for this user
    await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('user_id', user.id);

    // Generate new reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store reset token in database
    const { error: insertError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
        used: false
      });

    if (insertError) {
      console.error('Error storing reset token:', insertError);
      return res.status(500).json({ message: 'Server error' });
    }

    // Build reset URL (frontend URL)
    const frontendUrl = getFrontendUrl();
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // Send password reset email using Resend
    if (isEmailConfigured()) {
      const emailResult = await sendPasswordResetEmail(user.email, user.name, resetUrl);
      
      if (emailResult.success) {
        logger.info('Password reset email sent successfully', { email: user.email });
      } else {
        logger.error('Failed to send password reset email', { error: emailResult.error, email: user.email });
        // Don't expose email failures to user - still return success
      }
    } else {
      // Development mode - log the reset URL for testing
      logger.info('Email service not configured - development mode', {
        resetUrl,
        email: user.email,
        expiresAt: expiresAt.toISOString(),
      });
    }

    // Always return the same response to prevent email enumeration
    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * VERIFY RESET TOKEN - Check if token is valid
 * GET /api/auth/verify-reset-token/:token
 * Public endpoint
 */
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find token in database
    const { data: resetToken, error } = await supabase
      .from('password_reset_tokens')
      .select('*, users:user_id(id, name, email)')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (error || !resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Check if token has expired
    if (new Date(resetToken.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired. Please request a new one.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: {
        email: resetToken.users?.email || ''
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * RESET PASSWORD - Set new password
 * POST /api/auth/reset-password
 * Supports both:
 * 1. Token-based reset (legacy custom tokens)
 * 2. Supabase Auth sync (when supabaseSync flag is true)
 * Public endpoint
 */
router.post('/reset-password', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { token, email, password, supabaseSync } = req.body;

    // Supabase Auth sync mode - update password by email
    // SECURITY: Requires a valid Supabase Auth access token to prove the caller
    // actually completed the email-verified password recovery flow.
    if (supabaseSync && email) {
      const { supabaseAccessToken } = req.body;

      if (!supabaseAccessToken) {
        logger.warn('Password sync attempt without Supabase access token', { email });
        return res.status(401).json({
          success: false,
          message: 'Authentication required for password sync'
        });
      }

      // Verify the Supabase Auth token and ensure the email matches
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(supabaseAccessToken);

      if (authError || !authUser) {
        logger.warn('Invalid Supabase access token for password sync', { email, error: authError?.message });
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired authentication token'
        });
      }

      // Ensure the token's email matches the email being synced
      if (authUser.email?.toLowerCase() !== email.toLowerCase().trim()) {
        logger.warn('Token email mismatch in password sync', {
          tokenEmail: authUser.email,
          requestEmail: email
        });
        return res.status(403).json({
          success: false,
          message: 'Token does not match the requested email'
        });
      }

      // SECURITY: Block Supabase Auth sync for admin accounts.
      // Even with a valid token, admin password cannot be changed via this flow.
      if (isAdminEmail(email)) {
        logger.warn('Blocked Supabase Auth password sync for admin account', { email });
        return res.status(403).json({
          success: false,
          message: 'Admin password cannot be reset via this method. Please use the change password option while logged in.'
        });
      }

      // Find user by email
      const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email.toLowerCase().trim())
        .limit(1);

      if (fetchError || !users || users.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = users[0];

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update user's password in custom users table
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password: hashedPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating password (Supabase sync):', updateError);
        return res.status(500).json({ message: 'Failed to sync password' });
      }

      logger.info('Password synced successfully (Supabase Auth, verified token)', { email });

      return res.status(200).json({
        success: true,
        message: 'Password synced successfully.'
      });
    }

    // Legacy token-based reset
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token or email is required'
      });
    }

    // Find token in database
    const { data: resetToken, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (tokenError || !resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Check if token has expired
    if (new Date(resetToken.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired. Please request a new one.'
      });
    }

    // SECURITY: Block legacy token-based reset for admin accounts
    const { data: tokenUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', resetToken.user_id)
      .single();

    if (tokenUser && tokenUser.role === 'admin') {
      logger.warn('Blocked legacy token password reset for admin account', { userId: resetToken.user_id });
      // Invalidate the token
      await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('id', resetToken.id);
      return res.status(403).json({
        success: false,
        message: 'Admin password cannot be reset via this method. Please use the change password option while logged in.'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user's password
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', resetToken.user_id);

    if (updateError) {
      console.error('Error updating password:', updateError);
      return res.status(500).json({ message: 'Failed to update password' });
    }

    // Mark token as used
    await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', resetToken.id);

    // Delete all reset tokens for this user (cleanup)
    await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('user_id', resetToken.user_id);

    logger.info('Password reset successful (legacy method)', { userId: resetToken.user_id });

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * CHANGE PASSWORD (Immediate)
 * POST /api/auth/change-password
 * Protected endpoint - updates password immediately (no admin approval)
 * Clears must_reset_password flag on success.
 */
router.post('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { currentPassword, newPassword } = req.body;

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'New password must be different from current password' });
    }

    // Fetch user with password + auth id
    // Use .limit(1) instead of .single() to avoid PostgREST 406 errors
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, password, supabase_auth_id')
      .eq('id', req.user.id)
      .limit(1);

    if (userError) {
      logger.error('Error fetching user for password change', { error: userError.message, userId: req.user.id });
      return res.status(500).json({ message: 'Server error', error: userError.message });
    }

    if (!users || users.length === 0) {
      // User ID from JWT no longer exists in DB (deleted & recreated account)
      logger.warn('User not found for password change - stale session', { userId: req.user.id });
      return res.status(401).json({ 
        message: 'Your session is invalid. Your account may have been recreated. Please log in again.',
        errorCode: 'SESSION_INVALID'
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password + clear must_reset_password
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        must_reset_password: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      return res.status(500).json({ message: 'Failed to update password', error: updateError.message });
    }

    // Best-effort: also update Supabase Auth password if linked
    if (user.supabase_auth_id) {
      try {
        await supabase.auth.admin.updateUserById(user.supabase_auth_id, { password: newPassword });
      } catch (authErr) {
        // Non-fatal; keep going
        logger.warn('Failed to update Supabase Auth password (non-fatal)', { error: authErr.message, userId: user.id });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

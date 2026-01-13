import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { protect } from '../middleware/auth.js';
import supabase from '../config/supabase.js';
import { sendPasswordResetEmail, isEmailConfigured } from '../utils/emailService.js';

const router = express.Router();

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
router.post('/register', [
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
router.post('/login', [
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

    // Role validation: ensure selected role matches user's actual role
    if (selectedRole && selectedRole !== user.role) {
      return res.status(403).json({ 
        message: `You cannot login as ${selectedRole}. Your account role is ${user.role}.` 
      });
    }

    const token = generateToken(user.id, user.role);

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
        employerId: user.employer_id || null
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
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, designation, department, employer_id, is_active, created_at, updated_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found', error: error?.message });
    }

    // Transform to match expected format (camelCase and remove password)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation || '',
      department: user.department || '',
      employerId: user.employer_id || null,
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
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;

    // Find user by email
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, is_active')
      .eq('email', email.toLowerCase().trim())
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
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // Log for server monitoring
    console.log(`[PASSWORD_RESET] Reset requested for user: ${user.email} at ${new Date().toISOString()}`);

    // Send password reset email using Resend
    if (isEmailConfigured()) {
      const emailResult = await sendPasswordResetEmail(user.email, user.name, resetUrl);
      
      if (emailResult.success) {
        console.log('✅ Password reset email sent successfully to:', user.email);
      } else {
        console.error('❌ Failed to send password reset email:', emailResult.error);
        // Don't expose email failures to user - still return success
      }
    } else {
      // Development mode - log the reset URL for testing
      console.log('=================================================');
      console.log('⚠️  RESEND_API_KEY not configured');
      console.log('📧 In production, set RESEND_API_KEY environment variable');
      console.log('🔗 Development Reset Link:');
      console.log(`   ${resetUrl}`);
      console.log(`⏰ Token expires: ${expiresAt.toLocaleString()}`);
      console.log('=================================================');
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
    if (supabaseSync && email) {
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

      console.log('=================================================');
      console.log('PASSWORD SYNC SUCCESSFUL (Supabase Auth)');
      console.log(`User: ${email}`);
      console.log('=================================================');

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

    console.log('=================================================');
    console.log('PASSWORD RESET SUCCESSFUL');
    console.log(`User ID: ${resetToken.user_id}`);
    console.log('=================================================');

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

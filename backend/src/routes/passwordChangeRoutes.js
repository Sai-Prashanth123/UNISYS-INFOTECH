import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { protect as auth } from '../middleware/auth.js';
import supabase from '../config/supabase.js';

const router = express.Router();

const toUiRequest = (row) => ({
  _id: row.id,
  id: row.id,
  status: row.status,
  requestedAt: row.requested_at,
  reviewedAt: row.reviewed_at || null,
  reviewedBy: row.reviewedBy
    ? { _id: row.reviewedBy.id, id: row.reviewedBy.id, name: row.reviewedBy.name, email: row.reviewedBy.email }
    : null,
  reason: row.reason || null,
  user: row.user
    ? { _id: row.user.id, id: row.user.id, name: row.user.name, email: row.user.email, role: row.user.role }
    : null
});

// @route   POST /api/password-change/admin-direct
// @desc    Admin changes their own password directly (no approval needed)
// @access  Protected (Admin only)
router.post('/admin-direct',
  auth,
  [
    body('currentPassword', 'Current password is required').notEmpty(),
    body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Only admin can use this endpoint
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }

      const { currentPassword, newPassword } = req.body;

      // Get user with password field
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, password, email')
        .eq('id', req.user.id)
        .single();

      if (userError || !user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);

      // Update password directly (no approval needed for admin)
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password: newPasswordHash,
          must_reset_password: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', req.user.id);

      if (updateError) throw updateError;

      // Also update Supabase Auth password if the user is synced
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('supabase_auth_id')
          .eq('id', req.user.id)
          .single();

        if (userData?.supabase_auth_id) {
          await supabase.auth.admin.updateUserById(userData.supabase_auth_id, {
            password: newPassword
          });
        }
      } catch (authErr) {
        // Non-critical: Supabase Auth sync is best-effort
        console.error('Failed to sync password to Supabase Auth:', authErr.message);
      }

      res.json({
        success: true,
        message: 'Password changed successfully.'
      });
    } catch (error) {
      console.error('Admin direct password change error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   POST /api/password-change/request
// @desc    Request password change (All authenticated users)
// @access  Protected
router.post('/request',
  auth,
  [
    body('currentPassword', 'Current password is required').notEmpty(),
    body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { currentPassword, newPassword } = req.body;

      // Get user with password field
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, password')
        .eq('id', req.user.id)
        .single();

      if (userError || !user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Check if there's already a pending request
      const { data: existingRequest } = await supabase
        .from('password_change_requests')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('status', 'Pending')
        .maybeSingle();

      if (existingRequest) {
        return res.status(400).json({ message: 'You already have a pending password change request' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);

      // Create password change request
      const { data: passwordChangeRequest, error: createError } = await supabase
        .from('password_change_requests')
        .insert({
          user_id: req.user.id,
          new_password_hash: newPasswordHash,
          status: 'Pending'
        })
        .select()
        .single();

      if (createError) throw createError;

      res.status(201).json({
        success: true,
        message: 'Password change request submitted successfully. Waiting for admin approval.',
        data: {
          requestId: passwordChangeRequest.id,
          status: passwordChangeRequest.status,
          requestedAt: passwordChangeRequest.requested_at
        }
      });
    } catch (error) {
      console.error('Password change request error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/password-change/requests
// @desc    Get all password change requests (Admin only)
// @access  Protected (Admin)
router.get('/requests', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { status } = req.query;
    let query = supabase
      .from('password_change_requests')
      .select('id, user_id, status, requested_at, reviewed_at, reviewed_by, reason, user:user_id(id, name, email, role), reviewedBy:reviewed_by(id, name, email)')
      .order('requested_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    const requests = (data || []).map(toUiRequest);

    return res.json({
      success: true,
      data: { requests, count: requests.length }
    });
  } catch (error) {
    console.error('Get password change requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/password-change/my-requests
// @desc    Get current user's password change requests
// @access  Protected
router.get('/my-requests', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('password_change_requests')
      .select('id, user_id, status, requested_at, reviewed_at, reviewed_by, reason, reviewedBy:reviewed_by(id, name, email)')
      .eq('user_id', req.user.id)
      .order('requested_at', { ascending: false });

    if (error) throw error;

    const requests = (data || []).map((row) => toUiRequest({ ...row, user: null }));

    return res.json({
      success: true,
      data: { requests, count: requests.length }
    });
  } catch (error) {
    console.error('Get my password change requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/password-change/approve/:id
// @desc    Approve password change request (Admin only)
// @access  Protected (Admin)
router.put('/approve/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { data: request, error: reqError } = await supabase
      .from('password_change_requests')
      .select('id, user_id, new_password_hash, status')
      .eq('id', req.params.id)
      .single();

    if (reqError || !request) {
      return res.status(404).json({ message: 'Password change request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }

    // Update user's password in custom users table + clear must_reset_password
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        password: request.new_password_hash,
        must_reset_password: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', request.user_id);

    if (userUpdateError) throw userUpdateError;

    const now = new Date().toISOString();
    const { data: updatedRequest, error: updErr } = await supabase
      .from('password_change_requests')
      .update({
        status: 'Approved',
        reviewed_by: req.user.id,
        reviewed_at: now,
        reason: null
      })
      .eq('id', req.params.id)
      .select('id, user_id, status, requested_at, reviewed_at, reviewed_by, reason, user:user_id(id, name, email, role), reviewedBy:reviewed_by(id, name, email)')
      .single();

    if (updErr) throw updErr;

    return res.json({
      success: true,
      message: 'Password change approved',
      data: { request: toUiRequest(updatedRequest) }
    });
  } catch (error) {
    console.error('Approve password change error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/password-change/reject/:id
// @desc    Reject password change request (Admin only)
// @access  Protected (Admin)
router.put('/reject/:id',
  auth,
  [
    body('reason', 'Reason for rejection is required').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }

      const { reason } = req.body;

      const { data: request, error: reqError } = await supabase
        .from('password_change_requests')
        .select('id, status')
        .eq('id', req.params.id)
        .single();

      if (reqError || !request) {
        return res.status(404).json({ message: 'Password change request not found' });
      }

      if (request.status !== 'Pending') {
        return res.status(400).json({ message: 'This request has already been processed' });
      }

      const now = new Date().toISOString();
      const { data: updatedRequest, error: updErr } = await supabase
        .from('password_change_requests')
        .update({
          status: 'Rejected',
          reviewed_by: req.user.id,
          reviewed_at: now,
          reason: reason
        })
        .eq('id', req.params.id)
        .select('id, user_id, status, requested_at, reviewed_at, reviewed_by, reason, user:user_id(id, name, email, role), reviewedBy:reviewed_by(id, name, email)')
        .single();

      if (updErr) throw updErr;

      return res.json({
        success: true,
        message: 'Password change request rejected',
        data: { request: toUiRequest(updatedRequest) }
      });
    } catch (error) {
      console.error('Reject password change error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   DELETE /api/password-change/cancel/:id
// @desc    Cancel own password change request
// @access  Protected
router.delete('/cancel/:id', auth, async (req, res) => {
  try {
    const { data: request, error: reqError } = await supabase
      .from('password_change_requests')
      .select('id, user_id, status')
      .eq('id', req.params.id)
      .single();

    if (reqError || !request) {
      return res.status(404).json({ message: 'Password change request not found' });
    }

    if (request.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this request' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Can only cancel pending requests' });
    }

    const { error: delErr } = await supabase
      .from('password_change_requests')
      .delete()
      .eq('id', req.params.id);

    if (delErr) throw delErr;

    return res.json({
      success: true,
      message: 'Password change request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel password change request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

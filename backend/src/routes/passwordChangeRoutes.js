import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { protect as auth } from '../middleware/auth.js';
import supabase from '../config/supabase.js';

const router = express.Router();

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
    const filter = {};
    
    if (status) {
      filter.status = status;
    }

    const requests = await PasswordChangeRequest.find(filter)
      .populate('userId', 'name email role')
      .populate('reviewedBy', 'name email')
      .sort({ requestedAt: -1 });

    res.json({
      success: true,
      data: {
        requests,
        count: requests.length
      }
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
    const requests = await PasswordChangeRequest.find({ userId: req.user.id })
      .populate('reviewedBy', 'name email')
      .sort({ requestedAt: -1 });

    res.json({
      success: true,
      data: {
        requests,
        count: requests.length
      }
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

    const request = await PasswordChangeRequest.findById(req.params.id)
      .populate('userId', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Password change request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }

    // Update user's password
    const user = await User.findById(request.userId._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = request.newPasswordHash;
    await user.save();

    // Update request status
    request.status = 'Approved';
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    await request.save();

    res.json({
      success: true,
      message: `Password change approved for ${user.name}`,
      data: {
        request
      }
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

      const request = await PasswordChangeRequest.findById(req.params.id)
        .populate('userId', 'name email');

      if (!request) {
        return res.status(404).json({ message: 'Password change request not found' });
      }

      if (request.status !== 'Pending') {
        return res.status(400).json({ message: 'This request has already been processed' });
      }

      // Update request status
      request.status = 'Rejected';
      request.reviewedBy = req.user.id;
      request.reviewedAt = new Date();
      request.reason = reason;
      await request.save();

      res.json({
        success: true,
        message: `Password change request rejected for ${request.userId.name}`,
        data: {
          request
        }
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
    const request = await PasswordChangeRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Password change request not found' });
    }

    // Check if request belongs to user
    if (request.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this request' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Can only cancel pending requests' });
    }

    await PasswordChangeRequest.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Password change request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel password change request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

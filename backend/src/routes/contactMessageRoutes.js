import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import supabase from '../config/supabase.js';

const router = express.Router();

// Transform message from DB format to frontend format
const transformMessage = (msg) => ({
  _id: msg.id,
  id: msg.id,
  name: msg.name,
  email: msg.email,
  phone: msg.phone,
  message: msg.message,
  status: msg.status,
  submittedAt: msg.submitted_at,
  createdAt: msg.created_at,
  updatedAt: msg.updated_at
});

// @route   POST /api/contact-messages
// @desc    Submit a new contact message (PUBLIC)
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Create new contact message in Supabase
    const { data: contactMessage, error } = await supabase
      .from('contact_messages')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        message: message.trim(),
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating contact message:', error);
      return res.status(500).json({
        success: false,
        message: 'Error submitting contact form. Please try again.',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: transformMessage(contactMessage),
    });
  } catch (error) {
    console.error('Error creating contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting contact form. Please try again.',
    });
  }
});

// @route   GET /api/contact-messages
// @desc    Get all contact messages (admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 50, sort = '-submitted_at' } = req.query;
    
    // Build count query separately
    let countQuery = supabase.from('contact_messages').select('*', { count: 'exact', head: true });
    if (status) {
      countQuery = countQuery.eq('status', status);
    }
    const { count } = await countQuery;
    
    // Build data query
    let query = supabase.from('contact_messages').select('*');
    
    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    // Handle sorting (default: newest first)
    const isDescending = sort.startsWith('-');
    let sortField = sort.replace('-', '');
    // Map camelCase to snake_case for DB
    if (sortField === 'submittedAt') sortField = 'submitted_at';
    if (sortField === 'createdAt') sortField = 'created_at';
    
    query = query.order(sortField, { ascending: !isDescending });
    
    // Pagination
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const offset = (pageNum - 1) * limitNum;
    query = query.range(offset, offset + limitNum - 1);
    
    const { data: messages, error } = await query;

    if (error) {
      console.error('Error fetching contact messages:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching contact messages',
      });
    }

    // Transform all messages to frontend format
    const transformedMessages = (messages || []).map(transformMessage);

    res.json({
      success: true,
      data: transformedMessages,
      totalPages: Math.ceil((count || 0) / limitNum),
      currentPage: pageNum,
      total: count || 0,
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact messages',
    });
  }
});

// @route   GET /api/contact-messages/:id
// @desc    Get single contact message by ID (admin only)
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { data: message, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error || !message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
    }

    res.json({
      success: true,
      data: transformMessage(message),
    });
  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact message',
    });
  }
});

// @route   PUT /api/contact-messages/:id
// @desc    Update contact message status (admin only)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['new', 'read', 'replied', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: new, read, replied, archived',
      });
    }
    
    const { data: message, error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error || !message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
    }

    res.json({
      success: true,
      message: 'Contact message status updated',
      data: transformMessage(message),
    });
  } catch (error) {
    console.error('Error updating contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact message',
    });
  }
});

// @route   DELETE /api/contact-messages/:id
// @desc    Delete contact message (admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { data: message, error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error || !message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
    }

    res.json({
      success: true,
      message: 'Contact message deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting contact message',
    });
  }
});

// @route   GET /api/contact-messages/stats/summary
// @desc    Get contact message statistics (admin only)
// @access  Private/Admin
router.get('/stats/summary', protect, authorize('admin'), async (req, res) => {
  try {
    const { data: messages, error } = await supabase
      .from('contact_messages')
      .select('status');

    if (error) {
      console.error('Error fetching contact message stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching statistics',
      });
    }

    const stats = {
      total: messages.length,
      new: messages.filter(m => m.status === 'new').length,
      read: messages.filter(m => m.status === 'read').length,
      replied: messages.filter(m => m.status === 'replied').length,
      archived: messages.filter(m => m.status === 'archived').length,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching contact message stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
    });
  }
});

export default router;

import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import supabase from '../config/supabase.js';

const router = express.Router();

// @route   POST /api/contacts
// @desc    Submit a new contact form
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      jobTitle,
      workEmail,
      company,
      employees,
      phone,
      country,
      productInterest,
      questionsComments,
    } = req.body;

    // Check if contact with this email already exists
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('*')
      .eq('work_email', workEmail.toLowerCase().trim())
      .maybeSingle();
    
    if (existingContact) {
      // Update existing contact instead of creating duplicate
      const { data: updatedContact, error: updateError } = await supabase
        .from('contacts')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          job_title: jobTitle.trim(),
          company: company.trim(),
          employees,
          phone: phone.trim(),
          country: country || 'India',
          product_interest: productInterest,
          questions_comments: questionsComments || '',
          submitted_at: new Date().toISOString()
        })
        .eq('id', existingContact.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      return res.status(200).json({
        success: true,
        message: 'Thank you for your interest! We have updated your information and will contact you within 24 hours.',
        data: updatedContact,
      });
    }

    // Create new contact
    const { data: contact, error: createError } = await supabase
      .from('contacts')
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        job_title: jobTitle.trim(),
        work_email: workEmail.toLowerCase().trim(),
        company: company.trim(),
        employees,
        phone: phone.trim(),
        country: country || 'India',
        product_interest: productInterest,
        questions_comments: questionsComments || '',
        status: 'new'
      })
      .select()
      .single();
    
    if (createError) throw createError;

    res.status(201).json({
      success: true,
      message: 'Thank you for your interest! We will contact you within 24 hours.',
      data: contact,
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting contact form. Please try again.',
      error: error.message
    });
  }
});

// @route   GET /api/contacts
// @desc    Get all contacts (admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sort = '-submitted_at' } = req.query;
    
    // Count query
    let countQuery = supabase.from('contacts').select('*', { count: 'exact', head: true });
    if (status) {
      countQuery = countQuery.eq('status', status);
    }
    const { count } = await countQuery;
    
    // Data query
    let query = supabase.from('contacts').select('*');
    
    if (status) {
      query = query.eq('status', status);
    }
    
    // Handle sorting
    const sortField = sort.replace('-', '').replace('submittedAt', 'submitted_at');
    const sortOrder = sort.startsWith('-') ? 'desc' : 'asc';
    query = query.order(sortField, { ascending: sortOrder === 'asc' });
    
    // Pagination
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const offset = (pageNum - 1) * limitNum;
    query = query.range(offset, offset + limitNum - 1);
    
    const { data: contacts, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: contacts || [],
      totalPages: Math.ceil((count || 0) / limitNum),
      currentPage: pageNum,
      total: count || 0,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts',
      error: error.message
    });
  }
});

// @route   GET /api/contacts/:id
// @desc    Get single contact by ID (admin only)
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { data: contact, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error || !contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact',
      error: error.message
    });
  }
});

// @route   PUT /api/contacts/:id
// @desc    Update contact status (admin only)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    const { data: contact, error } = await supabase
      .from('contacts')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error || !contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    res.json({
      success: true,
      message: 'Contact status updated',
      data: contact,
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact',
      error: error.message
    });
  }
});

// @route   DELETE /api/contacts/:id
// @desc    Delete contact (admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { data: contact, error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error || !contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    res.json({
      success: true,
      message: 'Contact deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting contact',
      error: error.message
    });
  }
});

export default router;

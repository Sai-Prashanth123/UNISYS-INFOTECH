import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import supabase from '../config/supabase.js';

const router = express.Router();

// Get active clients for dropdown (employees and employers)
router.get('/active', protect, authorize('employee', 'employer', 'admin'), async (req, res) => {
  try {
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, name, email')
      .eq('status', 'active')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching active clients:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    const transformedClients = (clients || []).map(client => ({
      _id: client.id,
      id: client.id,
      name: client.name,
      email: client.email
    }));

    res.status(200).json({
      success: true,
      clients: transformedClients
    });
  } catch (error) {
    console.error('Error fetching active clients:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all clients (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, industry } = req.query;
    
    // Count query
    let countQuery = supabase.from('clients').select('*', { count: 'exact', head: true });
    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (industry) {
      countQuery = countQuery.eq('industry', industry);
    }
    const { count } = await countQuery;
    
    // Data query
    let query = supabase.from('clients').select('*');
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    if (industry) {
      query = query.eq('industry', industry);
    }
    
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const offset = (pageNum - 1) * limitNum;
    
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);
    
    const { data: clients, error } = await query;
    
    if (error) {
      console.error('Error fetching clients:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    const transformedClients = (clients || []).map(transformClient);

    res.status(200).json({
      success: true,
      count: transformedClients.length,
      total: count || 0,
      pages: Math.ceil((count || 0) / limitNum),
      currentPage: pageNum,
      clients: transformedClients
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Transform helper function
const transformClient = (client) => ({
  _id: client.id,
  id: client.id,
  name: client.name,
  email: client.email,
  industry: client.industry,
  contactPerson: client.contact_person,
  phone: client.phone,
  address: client.address,
  technology: client.technology,
  onboardingDate: client.onboarding_date,
  offboardingDate: client.offboarding_date,
  status: client.status,
  createdAt: client.created_at,
  updatedAt: client.updated_at
});

// Get single client (admin only)
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', req.params.id)
      .single();
      
    if (error || !client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.status(200).json({
      success: true,
      client: transformClient(client)
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create client (admin only)
router.post('/', protect, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Client name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('industry').trim().notEmpty().withMessage('Industry is required'),
  body('contactPerson').trim().notEmpty().withMessage('Contact person is required'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('technology').optional().trim(),
  body('onboardingDate').optional().isISO8601().toDate(),
  body('offboardingDate').optional().isISO8601().toDate(),
  body('status').optional().isIn(['active', 'inactive'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, industry, contactPerson, phone, address, technology, onboardingDate, offboardingDate, status } = req.body;

    // Check if client with same email exists
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
      
    if (existingClient) {
      return res.status(400).json({ message: 'Client with this email already exists' });
    }

    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        industry: industry.trim(),
        contact_person: contactPerson.trim(),
        phone: phone?.trim() || '',
        address: address?.trim() || '',
        technology: technology?.trim() || '',
        onboarding_date: onboardingDate || null,
        offboarding_date: offboardingDate || null,
        status: status || 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      client: transformClient(client)
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update client (admin only)
router.put('/:id', protect, authorize('admin'), [
  body('name').optional().trim(),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('industry').optional().trim(),
  body('contactPerson').optional().trim(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('technology').optional().trim(),
  body('onboardingDate').optional().isISO8601().toDate(),
  body('offboardingDate').optional().isISO8601().toDate(),
  body('status').optional().isIn(['active', 'inactive'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, industry, contactPerson, phone, address, technology, onboardingDate, offboardingDate, status } = req.body;
    
    // Check if client exists
    const { data: existingClient } = await supabase
      .from('clients')
      .select('email')
      .eq('id', req.params.id)
      .single();
      
    if (!existingClient) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check for email uniqueness if email is being updated
    if (email && email.toLowerCase().trim() !== existingClient.email) {
      const { data: emailCheck } = await supabase
        .from('clients')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();
        
      if (emailCheck) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Build update object
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (industry !== undefined) updateData.industry = industry.trim();
    if (contactPerson !== undefined) updateData.contact_person = contactPerson.trim();
    if (phone !== undefined) updateData.phone = phone?.trim() || '';
    if (address !== undefined) updateData.address = address?.trim() || '';
    if (technology !== undefined) updateData.technology = technology?.trim() || '';
    if (onboardingDate !== undefined) updateData.onboarding_date = onboardingDate || null;
    if (offboardingDate !== undefined) updateData.offboarding_date = offboardingDate || null;
    if (status !== undefined) updateData.status = status;

    const { data: client, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      client: transformClient(client)
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete client (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { data: client, error } = await supabase
      .from('clients')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();
      
    if (error || !client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

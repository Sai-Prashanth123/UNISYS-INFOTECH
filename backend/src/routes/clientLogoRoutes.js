import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import supabase from '../config/supabase.js';

const router = express.Router();

/**
 * Transform Supabase snake_case to frontend camelCase
 * Also adds _id alias for compatibility
 */
const transformLogo = (logo) => ({
  _id: logo.id,
  id: logo.id,
  name: logo.name,
  industry: logo.industry,
  logoUrl: logo.logo_url,
  description: logo.description || '',
  founded: logo.founded || '',
  headquarters: logo.headquarters || '',
  trustSignal: logo.trust_signal || '',
  displayOrder: logo.display_order || 0,
  isActive: logo.is_active,
  createdAt: logo.created_at,
  updatedAt: logo.updated_at
});

// Get all active client logos (public)
router.get('/', async (req, res) => {
  try {
    const { data: logos, error } = await supabase
      .from('client_logos')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching logos:', error);
      return res.status(500).json({ message: 'Error fetching client logos', error: error.message });
    }
    
    // Transform to camelCase for frontend
    const transformedLogos = (logos || []).map(transformLogo);
    res.json(transformedLogos);
  } catch (error) {
    console.error('Error fetching logos:', error);
    res.status(500).json({ message: 'Error fetching client logos', error: error.message });
  }
});

// Get all client logos including inactive (admin only)
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { data: logos, error } = await supabase
      .from('client_logos')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching logos:', error);
      return res.status(500).json({ message: 'Error fetching client logos', error: error.message });
    }
    
    // Transform to camelCase for frontend
    const transformedLogos = (logos || []).map(transformLogo);
    res.json(transformedLogos);
  } catch (error) {
    console.error('Error fetching logos:', error);
    res.status(500).json({ message: 'Error fetching client logos', error: error.message });
  }
});

// Get single client logo
router.get('/:id', async (req, res) => {
  try {
    const { data: logo, error } = await supabase
      .from('client_logos')
      .select('*')
      .eq('id', req.params.id)
      .single();
      
    if (error || !logo) {
      return res.status(404).json({ message: 'Client logo not found' });
    }
    
    res.json(transformLogo(logo));
  } catch (error) {
    console.error('Error fetching logo:', error);
    res.status(500).json({ message: 'Error fetching client logo', error: error.message });
  }
});

// Create new client logo (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { data: logo, error } = await supabase
      .from('client_logos')
      .insert({
        name: req.body.name,
        industry: req.body.industry,
        logo_url: req.body.logoUrl || req.body.logo_url,
        description: req.body.description || '',
        founded: req.body.founded || '',
        headquarters: req.body.headquarters || '',
        trust_signal: req.body.trustSignal || req.body.trust_signal || '',
        display_order: req.body.displayOrder || req.body.display_order || 0,
        is_active: req.body.isActive !== undefined ? req.body.isActive : true
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating logo:', error);
      return res.status(400).json({ message: 'Error creating client logo', error: error.message });
    }
    
    res.status(201).json(transformLogo(logo));
  } catch (error) {
    console.error('Error creating logo:', error);
    res.status(400).json({ message: 'Error creating client logo', error: error.message });
  }
});

// Update client logo (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const updateData = { updated_at: new Date().toISOString() };
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.industry !== undefined) updateData.industry = req.body.industry;
    if (req.body.logoUrl !== undefined) updateData.logo_url = req.body.logoUrl;
    if (req.body.logo_url !== undefined) updateData.logo_url = req.body.logo_url;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.founded !== undefined) updateData.founded = req.body.founded;
    if (req.body.headquarters !== undefined) updateData.headquarters = req.body.headquarters;
    if (req.body.trustSignal !== undefined) updateData.trust_signal = req.body.trustSignal;
    if (req.body.trust_signal !== undefined) updateData.trust_signal = req.body.trust_signal;
    if (req.body.displayOrder !== undefined) updateData.display_order = req.body.displayOrder;
    if (req.body.display_order !== undefined) updateData.display_order = req.body.display_order;
    if (req.body.isActive !== undefined) updateData.is_active = req.body.isActive;

    const { data: logo, error } = await supabase
      .from('client_logos')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !logo) {
      return res.status(404).json({ message: 'Client logo not found' });
    }

    res.json(transformLogo(logo));
  } catch (error) {
    console.error('Error updating logo:', error);
    res.status(400).json({ message: 'Error updating client logo', error: error.message });
  }
});

// Delete client logo (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { data: logo, error } = await supabase
      .from('client_logos')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();
      
    if (error || !logo) {
      return res.status(404).json({ message: 'Client logo not found' });
    }

    res.json({ message: 'Client logo deleted successfully', logo: transformLogo(logo) });
  } catch (error) {
    console.error('Error deleting logo:', error);
    res.status(500).json({ message: 'Error deleting client logo', error: error.message });
  }
});

export default router;

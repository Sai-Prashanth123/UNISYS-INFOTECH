import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import supabase from '../config/supabase.js';

const router = express.Router();
const SOW_BUCKET = 'client-onboarding-sows';

function normalizeBase64(input) {
  if (!input) return '';
  // Support both raw base64 and data URLs
  const str = String(input);
  const commaIdx = str.indexOf(',');
  if (str.startsWith('data:') && commaIdx !== -1) return str.slice(commaIdx + 1);
  return str;
}

function safeFileName(name) {
  return String(name || 'document')
    .trim()
    .replace(/[^\w.\- ]+/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 120);
}

function getExt(name) {
  const n = String(name || '').toLowerCase();
  const idx = n.lastIndexOf('.');
  return idx === -1 ? '' : n.slice(idx + 1);
}

function isAllowedSowType({ fileName, contentType }) {
  const ext = getExt(fileName);
  const allowedExt = new Set(['pdf', 'doc', 'docx']);
  if (!allowedExt.has(ext)) return false;

  // Accept common MIME types (browsers can vary). We'll still enforce ext above.
  const ct = String(contentType || '').toLowerCase();
  const allowedMime = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]);
  return !ct || allowedMime.has(ct);
}

// Get active clients for dropdown (employees and employers)
router.get('/active', protect, authorize('employee', 'employer', 'admin'), async (req, res) => {
  try {
    // Admin can see all active clients
    if (req.user.role === 'admin') {
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

      return res.status(200).json({
        success: true,
        clients: transformedClients
      });
    }

    // Employees/Employers: only show assigned clients
    const [{ data: assignments, error: assignError }, { data: userRow, error: userError }] = await Promise.all([
      supabase
        .from('user_client_assignments')
        .select('client_id')
        .eq('user_id', req.user.id),
      // Backward compatibility fallback (older records may only have users.client_id)
      supabase
        .from('users')
        .select('client_id')
        .eq('id', req.user.id)
        .maybeSingle()
    ]);

    if (assignError) {
      console.error('Error fetching user client assignments:', assignError);
      return res.status(500).json({ message: 'Server error', error: assignError.message });
    }
    if (userError && userError.code !== 'PGRST116') {
      console.error('Error fetching user client_id:', userError);
      return res.status(500).json({ message: 'Server error', error: userError.message });
    }

    const assignedClientIds = new Set(
      (assignments || [])
        .map(a => a.client_id)
        .filter(Boolean)
    );

    if (userRow?.client_id) {
      assignedClientIds.add(userRow.client_id);
    }

    const ids = Array.from(assignedClientIds);

    if (ids.length === 0) {
      return res.status(200).json({
        success: true,
        clients: []
      });
    }

    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, name, email')
      .eq('status', 'active')
      .in('id', ids)
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
    const { page = 1, limit = 20, search, industry, sowName, resourceName } = req.query;
    
    // Count query
    let countQuery = supabase.from('clients').select('*', { count: 'exact', head: true });
    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%,industry.ilike.%${search}%,resource_name.ilike.%${search}%`);
    }
    const sowFilter = (sowName || industry || '').trim();
    if (sowFilter) {
      countQuery = countQuery.eq('industry', sowFilter);
    }
    if (resourceName) {
      countQuery = countQuery.eq('resource_name', resourceName.trim());
    }
    const { count } = await countQuery;
    
    // Data query
    let query = supabase.from('clients').select('*');
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,industry.ilike.%${search}%,resource_name.ilike.%${search}%`);
    }
    
    if (sowFilter) {
      query = query.eq('industry', sowFilter);
    }
    if (resourceName) {
      query = query.eq('resource_name', resourceName.trim());
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
  sowName: client.industry,
  industry: client.industry, // backward compatibility
  resourceName: client.resource_name,
  contactPerson: client.contact_person,
  phone: client.phone,
  address: client.address,
  technology: client.technology,
  onboardingDate: client.onboarding_date,
  offboardingDate: client.offboarding_date,
  status: client.status,
  billingRatePerHr: client.billing_rate_per_hr,
  share1Name: client.share_1_name,
  share1HrRate: client.share_1_hr_rate,
  share2Name: client.share_2_name,
  share2HrRate: client.share_2_hr_rate,
  share3Name: client.share_3_name,
  share3HrRate: client.share_3_hr_rate,
  unisysHold: client.unisys_hold,
  unisysShareHrRate: client.unisys_share_hr_rate,
  sowDocumentPath: client.sow_document_path,
  sowDocumentName: client.sow_document_name,
  sowDocumentMime: client.sow_document_mime,
  sowDocumentUploadedAt: client.sow_document_uploaded_at,
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

    // Include assigned users + hr rates for edit screen
    const { data: assignments, error: assignError } = await supabase
      .from('user_client_assignments')
      .select('user_id, hr_rate, user:user_id(id, name, email, role)')
      .eq('client_id', req.params.id);

    if (assignError) {
      console.error('Error fetching client assignments:', assignError);
      // Non-fatal: still return client
    }

    const assignedUsers = (assignments || []).map(a => ({
      userId: a.user_id,
      hrRate: a.hr_rate,
      user: a.user ? { _id: a.user.id, id: a.user.id, name: a.user.name, email: a.user.email, role: a.user.role } : null
    }));

    // Provide a public URL if SOW exists (bucket is expected to be public)
    let sowDocumentUrl = null;
    if (client.sow_document_path) {
      const { data } = supabase.storage.from(SOW_BUCKET).getPublicUrl(client.sow_document_path);
      sowDocumentUrl = data?.publicUrl || null;
    }
    
    res.status(200).json({
      success: true,
      client: { ...transformClient(client), sowDocumentUrl, assignedUsers }
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload SOW document (admin only)
// POST /api/clients/:id/sow-upload
// Body: { fileName, contentType, base64Data }
router.post('/:id/sow-upload', protect, authorize('admin'), async (req, res) => {
  try {
    const clientId = req.params.id;
    const { fileName, contentType, base64Data } = req.body || {};

    if (!fileName || !base64Data) {
      return res.status(400).json({ message: 'fileName and base64Data are required' });
    }

    if (!isAllowedSowType({ fileName, contentType })) {
      return res.status(400).json({ message: 'Only .pdf, .doc, .docx files are allowed' });
    }

    // Ensure client exists
    const { data: existingClient, error: existErr } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .maybeSingle();
    if (existErr) {
      return res.status(500).json({ message: 'Server error', error: existErr.message });
    }
    if (!existingClient) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const base64 = normalizeBase64(base64Data);
    const buffer = Buffer.from(base64, 'base64');
    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ message: 'Invalid file data' });
    }
    if (buffer.length > maxBytes) {
      return res.status(400).json({ message: 'File too large (max 10MB)' });
    }

    const ext = getExt(fileName);
    const safeName = safeFileName(fileName);
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const path = `${clientId}/${ts}-${safeName || `sow.${ext}`}`;

    const { error: uploadErr } = await supabase.storage
      .from(SOW_BUCKET)
      .upload(path, buffer, {
        contentType: contentType || undefined,
        upsert: true,
      });

    if (uploadErr) {
      console.error('SOW upload error:', uploadErr);
      return res.status(500).json({ message: 'Failed to upload SOW document', error: uploadErr.message });
    }

    // Persist metadata on client
    const { data: updated, error: updErr } = await supabase
      .from('clients')
      .update({
        sow_document_path: path,
        sow_document_name: safeName,
        sow_document_mime: contentType || null,
        sow_document_uploaded_at: new Date().toISOString(),
      })
      .eq('id', clientId)
      .select('*')
      .single();

    if (updErr) {
      return res.status(500).json({ message: 'Failed to save SOW metadata', error: updErr.message });
    }

    const { data: pub } = supabase.storage.from(SOW_BUCKET).getPublicUrl(path);
    return res.status(200).json({
      success: true,
      message: 'SOW document uploaded',
      sowDocumentUrl: pub?.publicUrl || null,
      client: transformClient(updated),
    });
  } catch (error) {
    console.error('Error uploading SOW:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create client (admin only)
router.post('/', protect, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Client name is required'),
  // Allow multiple contracts for same client/email; email is optional
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Please provide a valid email'),
  // UI: "SOW Name *" maps to industry (backward compatibility)
  body('sowName').optional().trim(),
  body('industry').optional().trim(),
  body('resourceName').trim().notEmpty().withMessage('Resource name is required'),
  body('contactPerson').optional().trim(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('technology').optional().trim(),
  // Allow empty string from UI for optional dates
  body('onboardingDate').optional({ nullable: true, checkFalsy: true }).isISO8601().toDate(),
  body('offboardingDate').optional({ nullable: true, checkFalsy: true }).isISO8601().toDate(),
  body('status').optional().isIn(['active', 'inactive']),
  body('billingRatePerHr').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage('Billing rate must be a valid number'),
  body('share1Name').optional().trim(),
  body('share1HrRate').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage('Share-1 HR rate must be a valid number'),
  body('share2Name').optional().trim(),
  body('share2HrRate').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage('Share-2 HR rate must be a valid number'),
  body('share3Name').optional().trim(),
  body('share3HrRate').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage('Share-3 HR rate must be a valid number'),
  body('unisysHold').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage('Unisys hold must be a valid number'),
  body('unisysShareHrRate').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage('Unisys share HR rate must be a valid number'),
  body('assignedUsers').optional().isArray().withMessage('assignedUsers must be an array')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      email,
      sowName,
      industry,
      resourceName,
      contactPerson,
      phone,
      address,
      technology,
      onboardingDate,
      offboardingDate,
      status,
      billingRatePerHr,
      share1Name,
      share1HrRate,
      share2Name,
      share2HrRate,
      share3Name,
      share3HrRate,
      unisysHold,
      unisysShareHrRate,
      assignedUsers
    } = req.body;

    const normalizedSowName = (sowName || industry || '').trim();
    if (!normalizedSowName) {
      return res.status(400).json({ message: 'SOW Name is required' });
    }

    // Allow same email for multiple contracts; optional "duplicate contract" guard:
    // if email is present, prevent duplicates for same (email + sow + resource)
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const { data: existingContracts, error: existingError } = await supabase
        .from('clients')
        .select('id')
        .eq('email', normalizedEmail)
        .eq('industry', normalizedSowName)
        .eq('resource_name', resourceName.trim())
        .limit(1);

      if (existingError) {
        return res.status(500).json({ message: 'Server error', error: existingError.message });
      }

      if (existingContracts && existingContracts.length > 0) {
        return res.status(400).json({ message: 'This contract already exists for this client (email + SOW + Resource)' });
      }
    }

    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        name: name.trim(),
        email: email ? email.toLowerCase().trim() : null,
        industry: normalizedSowName,
        resource_name: resourceName.trim(),
        contact_person: contactPerson?.trim() || '',
        phone: phone?.trim() || '',
        address: address?.trim() || '',
        technology: technology?.trim() || '',
        onboarding_date: onboardingDate || null,
        offboarding_date: offboardingDate || null,
        status: status || 'active',
        billing_rate_per_hr: billingRatePerHr !== undefined && billingRatePerHr !== null && billingRatePerHr !== '' ? parseFloat(billingRatePerHr) : null,
        share_1_name: share1Name?.trim() || '',
        share_1_hr_rate: share1HrRate !== undefined && share1HrRate !== null && share1HrRate !== '' ? parseFloat(share1HrRate) : null,
        share_2_name: share2Name?.trim() || '',
        share_2_hr_rate: share2HrRate !== undefined && share2HrRate !== null && share2HrRate !== '' ? parseFloat(share2HrRate) : null,
        share_3_name: share3Name?.trim() || '',
        share_3_hr_rate: share3HrRate !== undefined && share3HrRate !== null && share3HrRate !== '' ? parseFloat(share3HrRate) : null,
        unisys_hold: unisysHold !== undefined && unisysHold !== null && unisysHold !== '' ? parseFloat(unisysHold) : null,
        unisys_share_hr_rate: unisysShareHrRate !== undefined && unisysShareHrRate !== null && unisysShareHrRate !== '' ? parseFloat(unisysShareHrRate) : null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    // Optional: assign employees/employers with hr rate
    if (Array.isArray(assignedUsers) && assignedUsers.length > 0) {
      const rows = assignedUsers
        .filter(a => a && a.userId)
        .map(a => ({
          user_id: a.userId,
          client_id: client.id,
          hr_rate: a.hrRate !== undefined && a.hrRate !== null && a.hrRate !== '' ? parseFloat(a.hrRate) : null
        }));

      if (rows.length > 0) {
        const { error: assignError } = await supabase
          .from('user_client_assignments')
          .upsert(rows, { onConflict: 'user_id,client_id' });

        if (assignError) {
          console.error('Error assigning users to client:', assignError);
          // Non-fatal
        }
      }
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
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Please provide a valid email'),
  body('sowName').optional().trim(),
  body('industry').optional().trim(),
  body('resourceName').optional({ nullable: true, checkFalsy: true }).trim(),
  body('contactPerson').optional().trim(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('technology').optional().trim(),
  body('onboardingDate').optional({ nullable: true, checkFalsy: true }).isISO8601().toDate(),
  body('offboardingDate').optional({ nullable: true, checkFalsy: true }).isISO8601().toDate(),
  body('status').optional().isIn(['active', 'inactive']),
  body('billingRatePerHr').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage('Billing rate must be a valid number'),
  body('share1Name').optional().trim(),
  body('share1HrRate').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage('Share-1 HR rate must be a valid number'),
  body('share2Name').optional().trim(),
  body('share2HrRate').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage('Share-2 HR rate must be a valid number'),
  body('share3Name').optional().trim(),
  body('share3HrRate').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage('Share-3 HR rate must be a valid number'),
  body('unisysHold').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage('Unisys hold must be a valid number'),
  body('unisysShareHrRate').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage('Unisys share HR rate must be a valid number'),
  body('assignedUsers').optional().isArray().withMessage('assignedUsers must be an array')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      email,
      sowName,
      industry,
      resourceName,
      contactPerson,
      phone,
      address,
      technology,
      onboardingDate,
      offboardingDate,
      status,
      billingRatePerHr,
      share1Name,
      share1HrRate,
      share2Name,
      share2HrRate,
      share3Name,
      share3HrRate,
      unisysHold,
      unisysShareHrRate,
      assignedUsers
    } = req.body;
    
    // Check if client exists
    const { data: existingClient } = await supabase
      .from('clients')
      .select('email, industry, resource_name')
      .eq('id', req.params.id)
      .single();
      
    if (!existingClient) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const normalizedSowName = (sowName || industry || '').trim();
    const normalizedResourceName = resourceName !== undefined ? resourceName.trim() : undefined;

    // Optional duplicate-contract guard if email present and any of (sow/resource/email) changed
    if (email !== undefined || normalizedSowName || normalizedResourceName !== undefined) {
      const nextEmail = email !== undefined ? (email ? email.toLowerCase().trim() : null) : (existingClient.email || null);
      const nextSow = normalizedSowName || existingClient.industry || '';
      const nextRes = normalizedResourceName !== undefined ? normalizedResourceName : (existingClient.resource_name || '');

      if (nextEmail) {
        const { data: dup, error: dupErr } = await supabase
          .from('clients')
          .select('id')
          .eq('email', nextEmail)
          .eq('industry', nextSow)
          .eq('resource_name', nextRes)
          .neq('id', req.params.id)
          .limit(1);

        if (dupErr) {
          return res.status(500).json({ message: 'Server error', error: dupErr.message });
        }
        if (dup && dup.length > 0) {
          return res.status(400).json({ message: 'This contract already exists for this client (email + SOW + Resource)' });
        }
      }
    }

    // Build update object
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email ? email.toLowerCase().trim() : null;
    if (normalizedSowName) updateData.industry = normalizedSowName;
    if (normalizedResourceName !== undefined) updateData.resource_name = normalizedResourceName;
    if (contactPerson !== undefined) updateData.contact_person = contactPerson?.trim() || '';
    if (phone !== undefined) updateData.phone = phone?.trim() || '';
    if (address !== undefined) updateData.address = address?.trim() || '';
    if (technology !== undefined) updateData.technology = technology?.trim() || '';
    if (onboardingDate !== undefined) updateData.onboarding_date = onboardingDate || null;
    if (offboardingDate !== undefined) updateData.offboarding_date = offboardingDate || null;
    if (status !== undefined) updateData.status = status;
    if (billingRatePerHr !== undefined) updateData.billing_rate_per_hr = billingRatePerHr === '' || billingRatePerHr === null ? null : parseFloat(billingRatePerHr);
    if (share1Name !== undefined) updateData.share_1_name = share1Name?.trim() || '';
    if (share1HrRate !== undefined) updateData.share_1_hr_rate = share1HrRate === '' || share1HrRate === null ? null : parseFloat(share1HrRate);
    if (share2Name !== undefined) updateData.share_2_name = share2Name?.trim() || '';
    if (share2HrRate !== undefined) updateData.share_2_hr_rate = share2HrRate === '' || share2HrRate === null ? null : parseFloat(share2HrRate);
    if (share3Name !== undefined) updateData.share_3_name = share3Name?.trim() || '';
    if (share3HrRate !== undefined) updateData.share_3_hr_rate = share3HrRate === '' || share3HrRate === null ? null : parseFloat(share3HrRate);
    if (unisysHold !== undefined) updateData.unisys_hold = unisysHold === '' || unisysHold === null ? null : parseFloat(unisysHold);
    if (unisysShareHrRate !== undefined) updateData.unisys_share_hr_rate = unisysShareHrRate === '' || unisysShareHrRate === null ? null : parseFloat(unisysShareHrRate);

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

    // Optional: assign employees/employers with hr rate (replace for this client)
    if (Array.isArray(assignedUsers)) {
      const { error: delErr } = await supabase
        .from('user_client_assignments')
        .delete()
        .eq('client_id', req.params.id);

      if (delErr) {
        console.error('Error clearing client assignments:', delErr);
        return;
      }

      const rows = assignedUsers
        .filter(a => a && a.userId)
        .map(a => ({
          user_id: a.userId,
          client_id: req.params.id,
          hr_rate: a.hrRate !== undefined && a.hrRate !== null && a.hrRate !== '' ? parseFloat(a.hrRate) : null
        }));

      if (rows.length > 0) {
        const { error: insErr } = await supabase
          .from('user_client_assignments')
          .insert(rows);
        if (insErr) {
          console.error('Error updating client assignments:', insErr);
        }
      }
    }

    // Refetch assigned users for response
    const { data: assignments } = await supabase
      .from('user_client_assignments')
      .select('user_id, hr_rate')
      .eq('client_id', req.params.id);

    const assignedUsersOut = (assignments || []).map(a => ({
      userId: a.user_id,
      hrRate: a.hr_rate
    }));

    return res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      client: { ...transformClient(client), assignedUsers: assignedUsersOut }
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

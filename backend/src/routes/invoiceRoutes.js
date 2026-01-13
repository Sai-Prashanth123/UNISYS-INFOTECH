import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import supabase from '../config/supabase.js';

const router = express.Router();

// Transform invoice from DB (snake_case) to frontend (camelCase)
const transformInvoice = (inv) => ({
  _id: inv.id,
  id: inv.id,
  name: inv.name,
  payrollMonth: inv.payroll_month,
  invoiceDate: inv.invoice_date,
  invoiceNumber: inv.invoice_number,
  invoiceAmount: inv.invoice_amount || 0,
  numberOfHours: inv.number_of_hours || 0,
  clientName: inv.client_name,
  endClient: inv.end_client || '',
  employmentType: inv.employment_type || 'W2',
  name1099: inv.name_1099 || '',
  status: inv.status,
  paymentReceivedDate: inv.payment_received_date,
  notes: inv.notes || '',
  createdAt: inv.created_at,
  updatedAt: inv.updated_at,
  createdBy: inv.users ? {
    _id: inv.users.id,
    id: inv.users.id,
    name: inv.users.name,
    email: inv.users.email
  } : null
});

// Transform deductions from DB (snake_case) to frontend (camelCase)
const transformDeductions = (ded) => {
  if (!ded) return null;
  return {
    _id: ded.id,
    id: ded.id,
    invoiceId: ded.invoice_id,
    amount1099: ded.amount_1099 || 0,
    amountW2: ded.amount_w2 || 0,
    unisysTax: ded.unisys_tax || 0,
    unisysCharges: ded.unisys_charges || 0,
    customDeduction1Name: ded.custom_deduction1_name || '',
    customDeduction1Amount: ded.custom_deduction1_amount || 0,
    customDeduction2Name: ded.custom_deduction2_name || '',
    customDeduction2Amount: ded.custom_deduction2_amount || 0,
    customDeduction3Name: ded.custom_deduction3_name || '',
    customDeduction3Amount: ded.custom_deduction3_amount || 0,
    isOverride: ded.is_override || false,
    overrideAmount: ded.override_amount || 0,
    netPayable: ded.net_payable || 0,
    createdAt: ded.created_at,
    updatedAt: ded.updated_at
  };
};

// Get all invoices (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { month, name, status, search } = req.query;
    
    let query = supabase
      .from('invoices')
      .select('*, users:created_by(id, name, email)');

    if (month) {
      query = query.eq('payroll_month', month);
    }
    if (name) {
      query = query.ilike('name', `%${name}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.ilike('invoice_number', `%${search}%`);
    }

    query = query.order('invoice_date', { ascending: false });

    const { data: invoices, error } = await query;

    if (error) throw error;

    // Transform all invoices to camelCase
    const transformedInvoices = (invoices || []).map(transformInvoice);

    res.status(200).json({
      success: true,
      count: transformedInvoices.length,
      invoices: transformedInvoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single invoice
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, users:created_by(id, name, email)')
      .eq('id', req.params.id)
      .single();

    if (invoiceError || !invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Get payroll deductions if they exist
    const { data: deductions } = await supabase
      .from('payroll_deductions')
      .select('*')
      .eq('invoice_id', req.params.id)
      .maybeSingle();

    res.status(200).json({
      success: true,
      invoice: transformInvoice(invoice),
      deductions: transformDeductions(deductions)
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create invoice
router.post('/', protect, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('payrollMonth').trim().notEmpty().withMessage('Payroll month is required'),
  body('invoiceDate').isISO8601().withMessage('Valid invoice date is required'),
  body('invoiceNumber').trim().notEmpty().withMessage('Invoice number is required'),
  body('invoiceAmount').isFloat({ min: 0 }).withMessage('Invoice amount must be a positive number'),
  body('numberOfHours').isFloat({ min: 0 }).withMessage('Number of hours must be a positive number'),
  body('clientName').trim().notEmpty().withMessage('Client name is required'),
  body('status').isIn(['Received', 'Pending', 'Waiting on Client']).withMessage('Invalid status')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      payrollMonth,
      invoiceDate,
      invoiceNumber,
      invoiceAmount,
      numberOfHours,
      clientName,
      endClient,
      employmentType,
      name1099,
      status,
      paymentReceivedDate,
      notes
    } = req.body;

    // Check if invoice number already exists
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('invoice_number', invoiceNumber.trim())
      .maybeSingle();

    if (existingInvoice) {
      return res.status(400).json({ message: 'Invoice number already exists' });
    }

    // Normalize invoice date
    const normalizedInvoiceDate = new Date(invoiceDate).toISOString().split('T')[0];

    const { data: invoice, error: createError } = await supabase
      .from('invoices')
      .insert({
        name: name.trim(),
        payroll_month: payrollMonth.trim(),
        invoice_date: normalizedInvoiceDate,
        invoice_number: invoiceNumber.trim(),
        invoice_amount: invoiceAmount,
        number_of_hours: numberOfHours,
        client_name: clientName.trim(),
        end_client: endClient || '',
        employment_type: employmentType || 'W2',
        name_1099: name1099 || '',
        status: status || 'Pending',
        payment_received_date: paymentReceivedDate ? new Date(paymentReceivedDate).toISOString().split('T')[0] : null,
        notes: notes || '',
        created_by: req.user.id
      })
      .select()
      .single();

    if (createError) throw createError;

    // Create default payroll deductions
    const { error: deductionsError } = await supabase
      .from('payroll_deductions')
      .insert({
        invoice_id: invoice.id
      })
      .select()
      .single();

    if (deductionsError && deductionsError.code !== '23505') {
      console.error('Error creating payroll deductions:', deductionsError);
    }

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      invoice: transformInvoice(invoice)
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update invoice
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      name,
      payrollMonth,
      invoiceDate,
      invoiceNumber,
      invoiceAmount,
      numberOfHours,
      clientName,
      endClient,
      employmentType,
      name1099,
      status,
      paymentReceivedDate,
      notes
    } = req.body;

    // Get existing invoice
    const { data: existingInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existingInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check if invoice number is being changed and if it already exists
    if (invoiceNumber && invoiceNumber.trim() !== existingInvoice.invoice_number) {
      const { data: duplicateInvoice } = await supabase
        .from('invoices')
        .select('id')
        .eq('invoice_number', invoiceNumber.trim())
        .maybeSingle();

      if (duplicateInvoice) {
        return res.status(400).json({ message: 'Invoice number already exists' });
      }
    }

    // Build update object
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (payrollMonth !== undefined) updateData.payroll_month = payrollMonth.trim();
    if (invoiceDate !== undefined) updateData.invoice_date = new Date(invoiceDate).toISOString().split('T')[0];
    if (invoiceNumber !== undefined) updateData.invoice_number = invoiceNumber.trim();
    if (invoiceAmount !== undefined) updateData.invoice_amount = invoiceAmount;
    if (numberOfHours !== undefined) updateData.number_of_hours = numberOfHours;
    if (clientName !== undefined) updateData.client_name = clientName.trim();
    if (endClient !== undefined) updateData.end_client = endClient || '';
    if (employmentType !== undefined) updateData.employment_type = employmentType;
    if (name1099 !== undefined) updateData.name_1099 = name1099 || '';
    if (status !== undefined) updateData.status = status;
    if (paymentReceivedDate !== undefined) {
      updateData.payment_received_date = paymentReceivedDate ? new Date(paymentReceivedDate).toISOString().split('T')[0] : null;
    }
    if (notes !== undefined) updateData.notes = notes || '';

    const { data: invoice, error: updateError } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      invoice: transformInvoice(invoice)
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete invoice
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    // Check if invoice exists
    const { data: invoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Delete associated payroll deductions
    await supabase
      .from('payroll_deductions')
      .delete()
      .eq('invoice_id', req.params.id);

    // Delete invoice
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pending invoices
router.get('/pending/tracker', protect, authorize('admin'), async (req, res) => {
  try {
    const { data: pendingInvoices, error } = await supabase
      .from('invoices')
      .select('*')
      .in('status', ['Pending', 'Waiting on Client'])
      .order('invoice_date', { ascending: false });

    if (error) throw error;

    // Group by person and transform data
    const groupedByPerson = {};
    
    (pendingInvoices || []).forEach(invoice => {
      if (!groupedByPerson[invoice.name]) {
        groupedByPerson[invoice.name] = {
          name: invoice.name,
          invoices: [],
          totalPending: 0
        };
      }
      // Transform each invoice in the pending list
      groupedByPerson[invoice.name].invoices.push(transformInvoice(invoice));
      groupedByPerson[invoice.name].totalPending += parseFloat(invoice.invoice_amount || 0);
    });

    const result = Object.values(groupedByPerson);

    res.status(200).json({
      success: true,
      count: result.length,
      pendingByPerson: result
    });
  } catch (error) {
    console.error('Error fetching pending invoices:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update payroll deductions
router.put('/:id/deductions', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      amount1099,
      amountW2,
      unisysTax,
      unisysCharges,
      customDeduction1Name,
      customDeduction1Amount,
      customDeduction2Name,
      customDeduction2Amount,
      customDeduction3Name,
      customDeduction3Amount,
      otherDeductions,
      isOverride,
      overrideAmount
    } = req.body;

    // Get or create deductions
    let { data: deductions } = await supabase
      .from('payroll_deductions')
      .select('*')
      .eq('invoice_id', req.params.id)
      .maybeSingle();

    // Build update data
    const updateData = {};
    if (amount1099 !== undefined) updateData.amount_1099 = amount1099;
    if (amountW2 !== undefined) updateData.amount_w2 = amountW2;
    if (unisysTax !== undefined) updateData.unisys_tax = unisysTax;
    if (unisysCharges !== undefined) updateData.unisys_charges = unisysCharges;
    
    // Handle individual custom deduction fields
    if (customDeduction1Name !== undefined) updateData.custom_deduction1_name = customDeduction1Name;
    if (customDeduction1Amount !== undefined) updateData.custom_deduction1_amount = customDeduction1Amount;
    if (customDeduction2Name !== undefined) updateData.custom_deduction2_name = customDeduction2Name;
    if (customDeduction2Amount !== undefined) updateData.custom_deduction2_amount = customDeduction2Amount;
    if (customDeduction3Name !== undefined) updateData.custom_deduction3_name = customDeduction3Name;
    if (customDeduction3Amount !== undefined) updateData.custom_deduction3_amount = customDeduction3Amount;
    
    // Legacy support for otherDeductions array
    if (otherDeductions !== undefined && Array.isArray(otherDeductions)) {
      if (otherDeductions[0]) {
        updateData.custom_deduction1_name = otherDeductions[0].name || '';
        updateData.custom_deduction1_amount = otherDeductions[0].amount || 0;
      }
      if (otherDeductions[1]) {
        updateData.custom_deduction2_name = otherDeductions[1].name || '';
        updateData.custom_deduction2_amount = otherDeductions[1].amount || 0;
      }
      if (otherDeductions[2]) {
        updateData.custom_deduction3_name = otherDeductions[2].name || '';
        updateData.custom_deduction3_amount = otherDeductions[2].amount || 0;
      }
    }
    
    if (isOverride !== undefined) updateData.is_override = isOverride;
    if (overrideAmount !== undefined) updateData.override_amount = overrideAmount;

    if (!deductions) {
      // Create if doesn't exist
      const { data: newDeductions, error: createError } = await supabase
        .from('payroll_deductions')
        .insert({
          invoice_id: req.params.id,
          ...updateData
        })
        .select()
        .single();
      
      if (createError) throw createError;
      deductions = newDeductions;
    } else {
      // Update existing
      const { data: updatedDeductions, error: updateError } = await supabase
        .from('payroll_deductions')
        .update(updateData)
        .eq('id', deductions.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      deductions = updatedDeductions;
    }

    res.status(200).json({
      success: true,
      message: 'Payroll deductions updated successfully',
      deductions: transformDeductions(deductions)
    });
  } catch (error) {
    console.error('Error updating payroll deductions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

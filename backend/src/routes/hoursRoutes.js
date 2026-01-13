import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import supabase from '../config/supabase.js';

const router = express.Router();

// Get user's hours logs
router.get('/', protect, async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 30 } = req.query;

    // Count query
    let countQuery = supabase
      .from('hours_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    if (startDate) {
      countQuery = countQuery.gte('date', new Date(startDate).toISOString().split('T')[0]);
    }
    if (endDate) {
      countQuery = countQuery.lte('date', new Date(endDate).toISOString().split('T')[0]);
    }

    const { count } = await countQuery;

    // Data query
    let query = supabase
      .from('hours_logs')
      .select('*')
      .eq('user_id', req.user.id);

    if (startDate) {
      query = query.gte('date', new Date(startDate).toISOString().split('T')[0]);
    }
    if (endDate) {
      query = query.lte('date', new Date(endDate).toISOString().split('T')[0]);
    }

    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const offset = (pageNum - 1) * limitNum;

    query = query
      .order('date', { ascending: false })
      .range(offset, offset + limitNum - 1);

    const { data: logs, error } = await query;

    if (error) throw error;

    // Populate client names if client_id exists
    const logsWithClients = await Promise.all(
      (logs || []).map(async (log) => {
        if (log.client_id) {
          const { data: client } = await supabase
            .from('clients')
            .select('id, name')
            .eq('id', log.client_id)
            .single();
          return {
            ...log,
            clientId: log.client_id ? { id: client?.id, name: client?.name } : null
          };
        }
        return { ...log, clientId: null };
      })
    );

    res.status(200).json({
      success: true,
      count: logsWithClients.length,
      total: count || 0,
      pages: Math.ceil((count || 0) / limitNum),
      currentPage: pageNum,
      logs: logsWithClients
    });
  } catch (error) {
    console.error('Error fetching hours logs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get hours for specific date
router.get('/:date', protect, async (req, res) => {
  try {
    const { date } = req.params;
    const normalizedDate = new Date(date).toISOString().split('T')[0];

    const { data: logs, error } = await supabase
      .from('hours_logs')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('date', normalizedDate)
      .limit(1);

    if (error) throw error;

    if (!logs || logs.length === 0) {
      return res.status(404).json({ message: 'No hours logged for this date' });
    }

    const log = logs[0];

    // Populate client if exists
    if (log.client_id) {
      const { data: client } = await supabase
        .from('clients')
        .select('id, name')
        .eq('id', log.client_id)
        .single();
      log.clientId = client ? { id: client.id, name: client.name } : null;
    } else {
      log.clientId = null;
    }

    res.status(200).json({
      success: true,
      log
    });
  } catch (error) {
    console.error('Error fetching hours log:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create hours log
router.post('/', protect, [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('hoursWorked').isFloat({ min: 0, max: 24 }).withMessage('Hours must be between 0 and 24'),
  body('taskDescription').optional().trim(),
  body('category').optional().isIn(['Development', 'Testing', 'Meeting', 'Documentation', 'Support', 'Other']),
  body('clientId').optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { date, hoursWorked, taskDescription, category, clientId } = req.body;
    const normalizedDate = new Date(date).toISOString().split('T')[0];

    // Check for duplicate entry
    const { data: existingLogs } = await supabase
      .from('hours_logs')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('date', normalizedDate)
      .limit(1);

    if (existingLogs && existingLogs.length > 0) {
      return res.status(400).json({ message: 'Hours already logged for this date' });
    }

    const { data: log, error } = await supabase
      .from('hours_logs')
      .insert({
        user_id: req.user.id,
        client_id: clientId || null,
        date: normalizedDate,
        hours_worked: hoursWorked,
        task_description: taskDescription || '',
        category: category || 'Development'
      })
      .select()
      .single();

    if (error) throw error;

    // Populate client if exists
    if (log.client_id) {
      const { data: client } = await supabase
        .from('clients')
        .select('id, name')
        .eq('id', log.client_id)
        .single();
      log.clientId = client ? { id: client.id, name: client.name } : null;
    } else {
      log.clientId = null;
    }

    res.status(201).json({
      success: true,
      message: 'Hours logged successfully',
      log
    });
  } catch (error) {
    console.error('Error creating hours log:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update hours log
router.put('/:id', protect, [
  body('hoursWorked').optional().isFloat({ min: 0, max: 24 }).withMessage('Hours must be between 0 and 24'),
  body('taskDescription').optional().trim(),
  body('category').optional().isIn(['Development', 'Testing', 'Meeting', 'Documentation', 'Support', 'Other'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { hoursWorked, taskDescription, category, clientId } = req.body;

    // Get existing log
    const { data: existingLog, error: fetchError } = await supabase
      .from('hours_logs')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existingLog) {
      return res.status(404).json({ message: 'Hours log not found' });
    }

    // Ensure user can only update their own logs
    if (existingLog.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this log' });
    }

    // Build update object
    const updateData = {};
    if (hoursWorked !== undefined) updateData.hours_worked = hoursWorked;
    if (taskDescription !== undefined) updateData.task_description = taskDescription;
    if (category !== undefined) updateData.category = category;
    if (clientId !== undefined) updateData.client_id = clientId || null;

    const { data: log, error } = await supabase
      .from('hours_logs')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Populate client if exists
    if (log.client_id) {
      const { data: client } = await supabase
        .from('clients')
        .select('id, name')
        .eq('id', log.client_id)
        .single();
      log.clientId = client ? { id: client.id, name: client.name } : null;
    } else {
      log.clientId = null;
    }

    res.status(200).json({
      success: true,
      message: 'Hours log updated successfully',
      log
    });
  } catch (error) {
    console.error('Error updating hours log:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete hours log
router.delete('/:id', protect, async (req, res) => {
  try {
    // Get existing log
    const { data: existingLog, error: fetchError } = await supabase
      .from('hours_logs')
      .select('user_id')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existingLog) {
      return res.status(404).json({ message: 'Hours log not found' });
    }

    // Ensure user can only delete their own logs
    if (existingLog.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this log' });
    }

    const { error } = await supabase
      .from('hours_logs')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Hours log deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting hours log:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

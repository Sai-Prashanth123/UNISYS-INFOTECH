import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import supabase from '../config/supabase.js';

const router = express.Router();

/**
 * EMPLOYEE & EMPLOYER: Submit or update hours for a specific date
 * POST /api/timecards
 */
router.post('/', protect, authorize('employee', 'employer'), [
  body('date').isISO8601().withMessage('Valid date is required (YYYY-MM-DD)'),
  body('hoursWorked').isFloat({ min: 0, max: 24 }).withMessage('Hours must be between 0 and 24'),
  body('clientId')
    .notEmpty()
    .withMessage('Client is required')
    .isString()
    .withMessage('Client ID must be a string'),
  body('notes').optional().trim()
], async (req, res) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  console.log(`[${requestId}] POST /api/timecards - Start`, {
    userId: req.user?.id,
    role: req.user?.role,
    body: { date: req.body.date, hoursWorked: req.body.hoursWorked, clientId: req.body.clientId }
  });

  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(`[${requestId}] Validation errors:`, errors.array());
    return res.status(400).json({ 
      success: false,
      message: 'Validation failed',
      errors: errors.array() 
    });
  }

  try {
    const { date, hoursWorked, clientId, notes } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Additional validation for clientId format
    if (!clientId || typeof clientId !== 'string' || clientId.trim() === '') {
      console.error(`[${requestId}] Invalid clientId format:`, clientId);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid client ID format',
        error: 'Client ID must be a valid UUID string'
      });
    }

    // Validate date format and normalize
    let normalizedDate;
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date format');
      }
      normalizedDate = dateObj.toISOString().split('T')[0];
      console.log(`[${requestId}] Date normalized: ${date} -> ${normalizedDate}`);
    } catch (dateError) {
      console.error(`[${requestId}] Date validation error:`, dateError);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid date format. Please use YYYY-MM-DD format.',
        error: dateError.message 
      });
    }

    // Validate hours worked
    const hours = parseFloat(hoursWorked);
    if (isNaN(hours) || hours < 0 || hours > 24) {
      console.error(`[${requestId}] Invalid hours: ${hoursWorked}`);
      return res.status(400).json({ 
        success: false,
        message: 'Hours must be a number between 0 and 24',
        error: `Invalid hours value: ${hoursWorked}`
      });
    }

    // Check database connection by testing a simple query
    try {
      const { error: dbTestError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .limit(1);
      
      if (dbTestError && dbTestError.code !== 'PGRST116') {
        console.error(`[${requestId}] Database connection error:`, dbTestError);
        throw new Error(`Database connection failed: ${dbTestError.message}`);
      }
    } catch (dbError) {
      console.error(`[${requestId}] Database connection check failed:`, dbError);
      return res.status(503).json({ 
        success: false,
        message: 'Database connection error. Please try again later.',
        error: dbError.message 
      });
    }

    // Get user details with error handling
    let user;
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, role, employer_id')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error(`[${requestId}] Error fetching user:`, userError);
        if (userError.code === 'PGRST116') {
          return res.status(404).json({ 
            success: false,
            message: 'User not found',
            error: `User with ID ${userId} does not exist`
          });
        }
        throw userError;
      }
      
      if (!userData) {
        console.error(`[${requestId}] User not found: ${userId}`);
        return res.status(404).json({ 
          success: false,
          message: 'User not found',
          error: `User with ID ${userId} does not exist`
        });
      }
      
      user = userData;
      console.log(`[${requestId}] User found:`, { id: user.id, role: user.role, employer_id: user.employer_id });
    } catch (userError) {
      console.error(`[${requestId}] Error in user lookup:`, userError);
      return res.status(500).json({ 
        success: false,
        message: 'Error retrieving user information',
        error: userError.message 
      });
    }

    // For employees, check if they have an employer
    if (userRole === 'employee' && !user.employer_id) {
      console.error(`[${requestId}] Employee ${userId} has no employer assigned`);
      return res.status(400).json({ 
        success: false,
        message: 'Employee must be assigned to an employer',
        error: 'Cannot create timecard entry without an assigned employer'
      });
    }

    // Validate client exists and is active
    try {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, name, email, status')
        .eq('id', clientId)
        .single();
      
      if (clientError) {
        console.error(`[${requestId}] Error fetching client:`, clientError);
        if (clientError.code === 'PGRST116') {
          return res.status(404).json({ 
            success: false,
            message: 'Client not found',
            error: `Client with ID ${clientId} does not exist`
          });
        }
        throw clientError;
      }
      
      if (!clientData) {
        console.error(`[${requestId}] Client not found: ${clientId}`);
        return res.status(404).json({ 
          success: false,
          message: 'Client not found',
          error: `Client with ID ${clientId} does not exist`
        });
      }
      
      if (clientData.status !== 'active') {
        console.error(`[${requestId}] Client is not active: ${clientId}, status: ${clientData.status}`);
        return res.status(400).json({ 
          success: false,
          message: 'Cannot use inactive client',
          error: `Client "${clientData.name}" is not active`
        });
      }
      
      console.log(`[${requestId}] Client validated:`, { id: clientData.id, name: clientData.name });
    } catch (clientError) {
      console.error(`[${requestId}] Error in client validation:`, clientError);
      return res.status(500).json({ 
        success: false,
        message: 'Error validating client',
        error: clientError.message 
      });
    }

    // Check if entry already exists for this date
    let existingEntry;
    try {
      const { data: existingData, error: existingError } = await supabase
        .from('time_cards')
        .select('*')
        .eq('employee_id', userId)
        .eq('date', normalizedDate)
        .maybeSingle();
      
      if (existingError && existingError.code !== 'PGRST116') {
        console.error(`[${requestId}] Error checking existing entry:`, existingError);
        throw existingError;
      }
      
      existingEntry = existingData;
      if (existingEntry) {
        console.log(`[${requestId}] Existing entry found:`, { id: existingEntry.id, is_locked: existingEntry.is_locked });
      }
    } catch (existingError) {
      console.error(`[${requestId}] Error in existing entry check:`, existingError);
      return res.status(500).json({ 
        success: false,
        message: 'Error checking for existing timecard entry',
        error: existingError.message 
      });
    }

    if (existingEntry) {
      // Check if entry is locked
      if (existingEntry.is_locked) {
        console.error(`[${requestId}] Attempt to modify locked entry: ${existingEntry.id}`);
        return res.status(403).json({ 
          success: false,
          message: 'This time entry is locked and cannot be modified',
          error: 'Timecard entry has been locked and cannot be edited or deleted'
        });
      }

      // Update existing entry
      console.log(`[${requestId}] Updating existing entry: ${existingEntry.id}`);
      try {
        const { data: timeCard, error: updateError } = await supabase
          .from('time_cards')
          .update({
            hours_worked: hours,
            client_id: clientId,
            notes: (notes || existingEntry.notes || '').trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEntry.id)
          .select()
          .single();

        if (updateError) {
          console.error(`[${requestId}] Error updating timecard:`, updateError);
          throw updateError;
        }

        if (!timeCard) {
          console.error(`[${requestId}] No data returned after update`);
          return res.status(500).json({ 
            success: false,
            message: 'Failed to update timecard entry',
            error: 'No data returned after update operation'
          });
        }

        console.log(`[${requestId}] Entry updated successfully:`, { id: timeCard.id });

        // Fetch client information
        let client = null;
        if (timeCard.client_id) {
          try {
            const { data: clientData } = await supabase
              .from('clients')
              .select('id, name, email')
              .eq('id', timeCard.client_id)
              .single();
            if (clientData) {
              client = {
                _id: clientData.id,
                id: clientData.id,
                name: clientData.name,
                email: clientData.email
              };
            }
          } catch (clientFetchError) {
            console.warn(`[${requestId}] Could not fetch client details:`, clientFetchError.message);
            // Non-critical error, continue without client details
          }
        }

        // Transform to camelCase
        const transformedTimeCard = {
          _id: timeCard.id,
          id: timeCard.id,
          employeeId: timeCard.employee_id,
          employerId: timeCard.employer_id,
          date: timeCard.date,
          hoursWorked: parseFloat(timeCard.hours_worked || 0),
          clientId: client || timeCard.client_id,
          client_id: timeCard.client_id,
          client: client,
          notes: timeCard.notes || '',
          isLocked: timeCard.is_locked || false,
          createdAt: timeCard.created_at,
          updatedAt: timeCard.updated_at
        };

        const duration = Date.now() - startTime;
        console.log(`[${requestId}] POST /api/timecards - Success (Update) - Duration: ${duration}ms`);

        return res.status(200).json({
          success: true,
          message: 'Time entry updated successfully',
          timeCard: transformedTimeCard
        });
      } catch (updateError) {
        console.error(`[${requestId}] Error during update operation:`, updateError);
        return res.status(500).json({ 
          success: false,
          message: 'Failed to update timecard entry',
          error: updateError.message,
          code: updateError.code,
          details: updateError.details
        });
      }
    }

    // Create new entry
    const employerId = userRole === 'employer' ? userId : user.employer_id;
    console.log(`[${requestId}] Creating new entry for employee: ${userId}, employer: ${employerId}`);
    
    try {
      const { data: timeCard, error: insertError } = await supabase
        .from('time_cards')
        .insert({
          employee_id: userId,
          employer_id: employerId,
          date: normalizedDate,
          hours_worked: hours,
          client_id: clientId,
          notes: (notes || '').trim()
        })
        .select()
        .single();

      if (insertError) {
        console.error(`[${requestId}] Error inserting timecard:`, insertError);
        
        // Handle specific Supabase errors
        if (insertError.code === '23505') {
          return res.status(409).json({ 
            success: false,
            message: 'Timecard entry already exists for this date',
            error: 'A timecard entry for this date already exists. Please update the existing entry instead.'
          });
        }
        
        if (insertError.code === '23503') {
          return res.status(400).json({ 
            success: false,
            message: 'Invalid foreign key reference',
            error: 'One or more referenced records (employee, employer, or client) do not exist'
          });
        }
        
        throw insertError;
      }

      if (!timeCard) {
        console.error(`[${requestId}] No data returned after insert`);
        return res.status(500).json({ 
          success: false,
          message: 'Failed to create timecard entry',
          error: 'No data returned after insert operation'
        });
      }

      console.log(`[${requestId}] Entry created successfully:`, { id: timeCard.id });

      // Fetch client information
      let client = null;
      if (timeCard.client_id) {
        try {
          const { data: clientData } = await supabase
            .from('clients')
            .select('id, name, email')
            .eq('id', timeCard.client_id)
            .single();
          if (clientData) {
            client = {
              _id: clientData.id,
              id: clientData.id,
              name: clientData.name,
              email: clientData.email
            };
          }
        } catch (clientFetchError) {
          console.warn(`[${requestId}] Could not fetch client details:`, clientFetchError.message);
          // Non-critical error, continue without client details
        }
      }

      // Transform to camelCase
      const transformedTimeCard = {
        _id: timeCard.id,
        id: timeCard.id,
        employeeId: timeCard.employee_id,
        employerId: timeCard.employer_id,
        date: timeCard.date,
        hoursWorked: parseFloat(timeCard.hours_worked || 0),
        clientId: client || timeCard.client_id,
        client_id: timeCard.client_id,
        client: client,
        notes: timeCard.notes || '',
        isLocked: timeCard.is_locked || false,
        createdAt: timeCard.created_at,
        updatedAt: timeCard.updated_at
      };

      const duration = Date.now() - startTime;
      console.log(`[${requestId}] POST /api/timecards - Success (Create) - Duration: ${duration}ms`);

      return res.status(201).json({
        success: true,
        message: 'Time entry created successfully',
        timeCard: transformedTimeCard
      });
    } catch (insertError) {
      console.error(`[${requestId}] Error during insert operation:`, insertError);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to create timecard entry',
        error: insertError.message,
        code: insertError.code,
        details: insertError.details
      });
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] POST /api/timecards - Error - Duration: ${duration}ms`, {
      error: error.message,
      stack: error.stack,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    
    // Determine appropriate status code
    let statusCode = 500;
    if (error.code === '23505') statusCode = 409; // Duplicate key
    if (error.code === '23503') statusCode = 400; // Foreign key violation
    if (error.code === 'PGRST116') statusCode = 404; // Not found
    
    return res.status(statusCode).json({ 
      success: false,
      message: 'Server error while processing timecard entry',
      error: error.message,
      code: error.code,
      details: error.details,
      requestId: requestId
    });
  }
});

/**
 * EMPLOYEE & EMPLOYER: Get own time entries
 * GET /api/timecards/my-entries
 */
router.get('/my-entries', protect, authorize('employee', 'employer'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const employeeId = req.user.id;

    let query = supabase
      .from('time_cards')
      .select('*')
      .eq('employee_id', employeeId);

    // Parse dates safely - if already in YYYY-MM-DD format, use directly
    if (startDate) {
      // Check if date is already in YYYY-MM-DD format
      const startDateStr = /^\d{4}-\d{2}-\d{2}$/.test(startDate) 
        ? startDate 
        : new Date(startDate).toISOString().split('T')[0];
      query = query.gte('date', startDateStr);
    }
    if (endDate) {
      // Check if date is already in YYYY-MM-DD format
      const endDateStr = /^\d{4}-\d{2}-\d{2}$/.test(endDate) 
        ? endDate 
        : new Date(endDate).toISOString().split('T')[0];
      query = query.lte('date', endDateStr);
    }

    query = query.order('date', { ascending: false });

    const { data: timeCards, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    // Fetch all unique client IDs
    const clientIds = [...new Set((timeCards || []).map(card => card.client_id).filter(Boolean))];
    const clientMap = {};
    
    if (clientIds.length > 0) {
      const { data: clients } = await supabase
        .from('clients')
        .select('id, name, email')
        .in('id', clientIds);
      
      (clients || []).forEach(client => {
        clientMap[client.id] = {
          _id: client.id,
          id: client.id,
          name: client.name,
          email: client.email
        };
      });
    }

    // Transform to camelCase to match frontend expectations
    const transformedTimeCards = (timeCards || []).map(card => {
      try {
        return {
          _id: card.id,
          id: card.id,
          employeeId: card.employee_id,
          employerId: card.employer_id,
          date: card.date,
          hoursWorked: parseFloat(card.hours_worked || 0),
          hours_worked: parseFloat(card.hours_worked || 0),
          clientId: card.client_id ? (clientMap[card.client_id] || card.client_id) : null,
          client_id: card.client_id,
          client: card.client_id ? clientMap[card.client_id] : null,
          notes: card.notes || '',
          isLocked: card.is_locked || false,
          is_locked: card.is_locked || false,
          createdAt: card.created_at,
          updatedAt: card.updated_at
        };
      } catch (err) {
        console.error('Error transforming timecard:', err, card);
        return null;
      }
    }).filter(Boolean);

    res.status(200).json({
      success: true,
      count: transformedTimeCards.length,
      timeCards: transformedTimeCards
    });
  } catch (error) {
    console.error('Error fetching timecards:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

/**
 * EMPLOYEE & EMPLOYER: Delete own time entry (if not locked)
 * DELETE /api/timecards/:id
 */
router.delete('/:id', protect, authorize('employee', 'employer'), async (req, res) => {
  try {
    const { data: timeCard } = await supabase
      .from('time_cards')
      .select('employee_id, is_locked')
      .eq('id', req.params.id)
      .single();

    if (!timeCard) {
      return res.status(404).json({ message: 'Time entry not found' });
    }

    // Ensure user owns this entry (employee_id should match user's id)
    if (timeCard.employee_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this entry' });
    }

    // Check if locked
    if (timeCard.is_locked) {
      return res.status(403).json({ message: 'This time entry is locked and cannot be deleted' });
    }

    const { error } = await supabase
      .from('time_cards')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Time entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting timecard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * EMPLOYER: Get all time entries for employees under them
 * GET /api/timecards/employer/entries
 */
router.get('/employer/entries', protect, authorize('employer'), async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    const employerId = req.user.id;

    let query = supabase
      .from('time_cards')
      .select('*')
      .eq('employer_id', employerId);

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    if (startDate) {
      query = query.gte('date', new Date(startDate).toISOString().split('T')[0]);
    }
    if (endDate) {
      query = query.lte('date', new Date(endDate).toISOString().split('T')[0]);
    }

    query = query.order('date', { ascending: false });

    const { data: timeCards, error } = await query;

    if (error) throw error;

    // Fetch employee info separately and transform to camelCase
    const timeCardsWithEmployees = await Promise.all(
      (timeCards || []).map(async (card) => {
        let employee = null;
        if (card.employee_id) {
          const { data: empData } = await supabase
            .from('users')
            .select('id, name, email, designation')
            .eq('id', card.employee_id)
            .single();
          employee = empData || null;
        }
        
        // Transform to camelCase
        return {
          _id: card.id,
          id: card.id,
          employeeId: card.employee_id,
          employerId: card.employer_id,
          date: card.date,
          hoursWorked: parseFloat(card.hours_worked || 0),
          notes: card.notes || '',
          isLocked: card.is_locked || false,
          createdAt: card.created_at,
          updatedAt: card.updated_at,
          employee: employee ? {
            _id: employee.id,
            id: employee.id,
            name: employee.name,
            email: employee.email,
            designation: employee.designation
          } : null
        };
      })
    );

    res.status(200).json({
      success: true,
      count: timeCardsWithEmployees.length,
      timeCards: timeCardsWithEmployees
    });
  } catch (error) {
    console.error('Error fetching employer timecards:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * EMPLOYER: Get list of employees under them
 * GET /api/timecards/employer/employees
 */
router.get('/employer/employees', protect, authorize('employer'), async (req, res) => {
  try {
    const employerId = req.user.id;

    const { data: employees, error } = await supabase
      .from('users')
      .select('id, name, email, designation')
      .eq('employer_id', employerId)
      .eq('role', 'employee')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;

    // Transform to match expected format
    const formattedEmployees = (employees || []).map(emp => ({
      _id: emp.id,
      id: emp.id,
      name: emp.name,
      email: emp.email,
      designation: emp.designation
    }));

    res.status(200).json({
      success: true,
      count: formattedEmployees.length,
      employees: formattedEmployees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * EMPLOYER: Get weekly summary for all employees
 * GET /api/timecards/employer/weekly-summary
 */
router.get('/employer/weekly-summary', protect, authorize('employer'), async (req, res) => {
  try {
    const { startDate } = req.query;
    const employerId = req.user.id;

    if (!startDate) {
      return res.status(400).json({ message: 'Start date is required' });
    }

    // Calculate week range (7 days from startDate)
    const weekStart = new Date(startDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const { data: timeCards, error } = await supabase
      .from('time_cards')
      .select('*')
      .eq('employer_id', employerId)
      .gte('date', weekStart.toISOString().split('T')[0])
      .lte('date', weekEnd.toISOString().split('T')[0])
      .order('employee_id', { ascending: true })
      .order('date', { ascending: true });

    if (error) throw error;

    // Fetch employee info for all unique employees
    const uniqueEmployeeIds = [...new Set((timeCards || []).map(c => c.employee_id))];
    const employeeMap = {};
    await Promise.all(
      uniqueEmployeeIds.map(async (empId) => {
        const { data: employee } = await supabase
          .from('users')
          .select('id, name, email, designation')
          .eq('id', empId)
          .single();
        if (employee) employeeMap[empId] = employee;
      })
    );

    // Group by employee
    const summary = {};
    (timeCards || []).forEach(card => {
      const empId = card.employee_id;
      if (!summary[empId]) {
        const emp = employeeMap[empId] || {};
        summary[empId] = {
          employee: {
            _id: emp.id || empId,
            id: emp.id || empId,
            name: emp.name || 'Unknown',
            email: emp.email || '',
            designation: emp.designation || ''
          },
          entries: [],
          totalHours: 0
        };
      }
      summary[empId].entries.push({
        _id: card.id,
        id: card.id,
        date: card.date,
        hoursWorked: parseFloat(card.hours_worked || 0),
        notes: card.notes || '',
        isLocked: card.is_locked || false
      });
      summary[empId].totalHours += parseFloat(card.hours_worked || 0);
    });

    // Round total hours
    Object.values(summary).forEach(emp => {
      emp.totalHours = Math.round(emp.totalHours * 10) / 10;
    });

    res.status(200).json({
      success: true,
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      summary: Object.values(summary)
    });
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * ADMIN: Get all time entries across the system
 * GET /api/timecards/admin/all-entries
 */
router.get('/admin/all-entries', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate, employeeId, employerId } = req.query;

    let query = supabase
      .from('time_cards')
      .select('*');

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    if (employerId) {
      query = query.eq('employer_id', employerId);
    }

    if (startDate) {
      query = query.gte('date', new Date(startDate).toISOString().split('T')[0]);
    }
    if (endDate) {
      query = query.lte('date', new Date(endDate).toISOString().split('T')[0]);
    }

    query = query.order('date', { ascending: false });

    const { data: timeCards, error } = await query;

    if (error) throw error;

    // Fetch employee and employer info separately
    const uniqueEmployeeIds = [...new Set((timeCards || []).map(c => c.employee_id).filter(Boolean))];
    const uniqueEmployerIds = [...new Set((timeCards || []).map(c => c.employer_id).filter(Boolean))];
    
    const employeeMap = {};
    const employerMap = {};
    
    await Promise.all([
      ...uniqueEmployeeIds.map(async (empId) => {
        const { data: employee } = await supabase
          .from('users')
          .select('id, name, email, designation, department, hourly_pay')
          .eq('id', empId)
          .single();
        if (employee) employeeMap[empId] = employee;
      }),
      ...uniqueEmployerIds.map(async (empId) => {
        const { data: employer } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('id', empId)
          .single();
        if (employer) employerMap[empId] = employer;
      })
    ]);

    // Transform to camelCase
    const timeCardsWithRelations = (timeCards || []).map(card => ({
      _id: card.id,
      id: card.id,
      employeeId: card.employee_id,
      employerId: card.employer_id,
      date: card.date,
      hoursWorked: parseFloat(card.hours_worked || 0),
      notes: card.notes || '',
      isLocked: card.is_locked || false,
      createdAt: card.created_at,
      updatedAt: card.updated_at,
      employee: employeeMap[card.employee_id] ? {
        _id: employeeMap[card.employee_id].id,
        id: employeeMap[card.employee_id].id,
        name: employeeMap[card.employee_id].name,
        email: employeeMap[card.employee_id].email,
        designation: employeeMap[card.employee_id].designation,
        department: employeeMap[card.employee_id].department,
        hourlyPay: parseFloat(employeeMap[card.employee_id].hourly_pay || 0)
      } : null,
      employer: employerMap[card.employer_id] ? {
        _id: employerMap[card.employer_id].id,
        id: employerMap[card.employer_id].id,
        name: employerMap[card.employer_id].name,
        email: employerMap[card.employer_id].email
      } : null
    }));

    // Calculate total hours
    const totalHours = timeCardsWithRelations.reduce((sum, card) => sum + parseFloat(card.hours_worked || 0), 0);

    res.status(200).json({
      success: true,
      count: timeCardsWithRelations.length,
      totalHours: Math.round(totalHours * 10) / 10,
      timeCards: timeCardsWithRelations
    });
  } catch (error) {
    console.error('Error fetching admin timecards:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * ADMIN: Get monthly aggregated timecards for employees and managers
 * GET /api/timecards/admin/monthly-summary
 */
router.get('/admin/monthly-summary', protect, authorize('admin'), async (req, res) => {
  try {
    const { month, year } = req.query; // Format: month="01", year="2026"
    
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    // Calculate date range for the selected month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Fetch all timecards for the month
    const { data: timeCards, error } = await supabase
      .from('time_cards')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    if (error) throw error;

    // Get unique user IDs (both employees and managers who logged time)
    const uniqueUserIds = [...new Set((timeCards || []).map(c => c.employee_id).filter(Boolean))];
    
    // Fetch user info for all users who have timecards (employees and managers)
    const userMap = {};
    await Promise.all(
      uniqueUserIds.map(async (userId) => {
        const { data: user } = await supabase
          .from('users')
          .select('id, name, email, role, designation, department, hourly_pay')
          .eq('id', userId)
          .single();
        if (user) userMap[userId] = user;
      })
    );

    // Aggregate hours by user (only for employees and managers, not admins)
    const monthlySummary = {};
    (timeCards || []).forEach(card => {
      const userId = card.employee_id;
      const user = userMap[userId];
      
      // Only include employees and managers
      if (user && (user.role === 'employee' || user.role === 'employer')) {
        if (!monthlySummary[userId]) {
          // Default to $25 if hourly pay is 0, null, or undefined
          const hourlyPay = parseFloat(user.hourly_pay || 0) || 25;
          monthlySummary[userId] = {
            userId: userId,
            name: user.name,
            email: user.email,
            role: user.role,
            designation: user.designation || '',
            department: user.department || '',
            hourlyPay: hourlyPay,
            totalHours: 0
          };
        }
        monthlySummary[userId].totalHours += parseFloat(card.hours_worked || 0);
      }
    });

    // Convert to array and calculate total pay
    const summaryArray = Object.values(monthlySummary).map(item => ({
      ...item,
      totalPay: item.hourlyPay * item.totalHours
    })).sort((a, b) => a.name.localeCompare(b.name));

    // Calculate totals
    const totalHours = summaryArray.reduce((sum, item) => sum + item.totalHours, 0);
    const totalPay = summaryArray.reduce((sum, item) => sum + item.totalPay, 0);

    res.status(200).json({
      success: true,
      month: `${year}-${String(month).padStart(2, '0')}`,
      count: summaryArray.length,
      totalHours: Math.round(totalHours * 100) / 100,
      totalPay: Math.round(totalPay * 100) / 100,
      timecards: summaryArray
    });
  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * ADMIN: Get timecard statistics and summaries
 * GET /api/timecards/admin/stats
 */
router.get('/admin/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = supabase.from('time_cards').select('*');

    if (startDate) {
      query = query.gte('date', new Date(startDate).toISOString().split('T')[0]);
    }
    if (endDate) {
      query = query.lte('date', new Date(endDate).toISOString().split('T')[0]);
    }

    const { data: timeCards, error } = await query;

    if (error) throw error;

    // Calculate statistics in JavaScript
    const totalHours = (timeCards || []).reduce((sum, card) => sum + parseFloat(card.hours_worked || 0), 0);
    const uniqueEmployees = new Set((timeCards || []).map(card => card.employee_id)).size;
    const averageHoursPerDay = (timeCards || []).length > 0 ? totalHours / (timeCards || []).length : 0;

    // Group by day of week
    const hoursByDay = {
      Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
    };
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    (timeCards || []).forEach(card => {
      const dayIndex = new Date(card.date).getDay();
      const dayName = dayNames[dayIndex];
      hoursByDay[dayName] += parseFloat(card.hours_worked || 0);
    });

    res.status(200).json({
      success: true,
      stats: {
        totalHours: Math.round(totalHours * 10) / 10,
        totalEntries: (timeCards || []).length,
        uniqueEmployees,
        averageHoursPerDay: Math.round(averageHoursPerDay * 10) / 10,
        hoursByDay
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

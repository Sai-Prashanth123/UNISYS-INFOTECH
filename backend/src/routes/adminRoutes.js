import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { protect, authorize } from '../middleware/auth.js';
import supabase from '../config/supabase.js';

const router = express.Router();

/**
 * ADMIN ONLY: Create new user (Employer or Employee)
 * POST /api/admin/users/create
 * Admin can create credentials and assign roles
 * Also creates user in Supabase Auth for password reset functionality
 */
router.post('/users/create', protect, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['employer', 'employee']).withMessage('Role must be employer or employee'),
  body('employerId').optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password, role, designation, department, employerId, hourlyPay } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists in custom users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();
      
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // If creating an employee, verify employer exists
    if (role === 'employee') {
      if (!employerId) {
        return res.status(400).json({ message: 'Employer ID is required for employee accounts' });
      }
      
      const { data: employer } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', employerId)
        .single();
        
      if (!employer || employer.role !== 'employer') {
        return res.status(400).json({ message: 'Invalid employer ID' });
      }
    }

    // Step 1: Create user in Supabase Auth (for password reset via email)
    let supabaseAuthUser = null;
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password: password,
        email_confirm: true, // Auto-confirm email since admin is creating the account
        user_metadata: {
          name: name.trim(),
          role: role
        }
      });

      if (authError) {
        console.error('Supabase Auth user creation error:', authError);
        // Continue even if Supabase Auth fails - will use fallback password reset
      } else {
        supabaseAuthUser = authData.user;
        console.log(`✅ Created Supabase Auth user for: ${normalizedEmail}`);
      }
    } catch (authErr) {
      console.error('Supabase Auth error:', authErr);
      // Continue with custom user creation
    }

    // Step 2: Hash password for custom users table
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Step 3: Create user in custom users table
    const insertData = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      designation: designation?.trim() || '',
      department: department?.trim() || '',
      employer_id: role === 'employee' ? employerId : null,
      is_active: true,
      supabase_auth_id: supabaseAuthUser?.id || null, // Link to Supabase Auth user
      hourly_pay: hourlyPay ? parseFloat(hourlyPay) : 0
    };

    const { data: user, error } = await supabase
      .from('users')
      .insert(insertData)
      .select('id, name, email, role, employer_id')
      .single();

    if (error) {
      console.error('Error creating user:', error);
      // If custom user creation fails but Supabase Auth user was created, clean up
      if (supabaseAuthUser) {
        try {
          await supabase.auth.admin.deleteUser(supabaseAuthUser.id);
        } catch (cleanupErr) {
          console.error('Failed to cleanup Supabase Auth user:', cleanupErr);
        }
      }
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    res.status(201).json({
      success: true,
      message: `${role} account created successfully`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employerId: user.employer_id
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * ADMIN ONLY: Get all users (with filters)
 * GET /api/admin/users
 */
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.query;
    
    let query = supabase
      .from('users')
      .select('id, name, email, role, designation, department, employer_id, hourly_pay, is_active, created_at, updated_at');
    
    if (role) {
      query = query.eq('role', role);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data: users, error } = await query;
    
    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    // Transform user data from snake_case to camelCase and populate employer info
    const transformUser = (user, employer = null) => ({
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      department: user.department,
      hourlyPay: user.hourly_pay || 0,
      employerId: employer ? { _id: employer.id, id: employer.id, name: employer.name, email: employer.email } : null,
      isActive: user.is_active !== false, // Transform is_active to isActive
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });

    // Populate employer information for employees
    const usersWithEmployers = await Promise.all(
      (users || []).map(async (user) => {
        if (user.employer_id) {
          const { data: employer } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('id', user.employer_id)
            .single();
          return transformUser(user, employer);
        }
        return transformUser(user, null);
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithEmployers.length,
      users: usersWithEmployers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * ADMIN ONLY: Get employers list (for dropdown)
 * GET /api/admin/employers
 */
router.get('/employers', protect, authorize('admin'), async (req, res) => {
  try {
    const { data: employers, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'employer')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching employers:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    // Transform to match expected format
    const formattedEmployers = (employers || []).map(emp => ({
      _id: emp.id,
      id: emp.id,
      name: emp.name,
      email: emp.email
    }));

    res.status(200).json({
      success: true,
      employers: formattedEmployers
    });
  } catch (error) {
    console.error('Error fetching employers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * ADMIN ONLY: Update user status (activate/deactivate)
 * PATCH /api/admin/users/:id/status
 */
router.patch('/users/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const { data: user, error } = await supabase
      .from('users')
      .update({ is_active: isActive })
      .eq('id', req.params.id)
      .select('id, is_active')
      .single();
      
    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user.id,
        isActive: user.is_active
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * ADMIN ONLY: Update user details
 * PUT /api/admin/users/:id
 */
router.put('/users/:id', protect, authorize('admin'), [
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('role').optional().isIn(['employer', 'employee']),
  body('employerId').optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, role, designation, department, employerId, hourlyPay } = req.body;
    
    // Get current user
    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.params.id)
      .single();
      
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent changing admin role
    if (currentUser.role === 'admin') {
      return res.status(403).json({ message: 'Cannot modify admin users' });
    }

    // Build update object
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (designation !== undefined) updateData.designation = designation?.trim() || '';
    if (department !== undefined) updateData.department = department?.trim() || '';
    if (hourlyPay !== undefined) updateData.hourly_pay = hourlyPay ? parseFloat(hourlyPay) : 0;
    
    if (role) {
      updateData.role = role;
      // If changing to employee, require employerId
      if (role === 'employee' && employerId) {
        updateData.employer_id = employerId;
      } else if (role === 'employer') {
        updateData.employer_id = null;
      }
    } else if (employerId !== undefined) {
      updateData.employer_id = employerId || null;
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.params.id)
      .select('id, name, email, role, designation, department, employer_id, hourly_pay')
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employerId: user.employer_id
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * ADMIN ONLY: Delete user
 * DELETE /api/admin/users/:id
 */
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    // Get user to check role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.params.id)
      .single();
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admin
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * ADMIN ONLY: Sync user to Supabase Auth
 * POST /api/admin/users/:id/sync-auth
 * Creates the user in Supabase Auth if not already present
 * Required for password reset via Supabase Auth email
 */
router.post('/users/:id/sync-auth', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { temporaryPassword } = req.body;

    // Get user from custom users table
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, role, supabase_auth_id')
      .eq('id', id)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already synced
    if (user.supabase_auth_id) {
      return res.status(200).json({
        success: true,
        message: 'User already synced to Supabase Auth',
        synced: true
      });
    }

    // Create user in Supabase Auth
    const password = temporaryPassword || 'TempPass123!'; // Temporary password
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: user.name,
        role: user.role
      }
    });

    if (authError) {
      console.error('Supabase Auth sync error:', authError);
      return res.status(500).json({ 
        message: 'Failed to sync user to Supabase Auth', 
        error: authError.message 
      });
    }

    // Update custom users table with Supabase Auth ID
    const { error: updateError } = await supabase
      .from('users')
      .update({ supabase_auth_id: authData.user.id })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating user with auth ID:', updateError);
    }

    console.log(`✅ Synced user ${user.email} to Supabase Auth`);

    res.status(200).json({
      success: true,
      message: `User synced to Supabase Auth. They can now use "Forgot Password" to receive reset emails.`,
      synced: true,
      authUserId: authData.user.id
    });
  } catch (error) {
    console.error('Error syncing user to Supabase Auth:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * ADMIN ONLY: Get dashboard statistics (OPTIMIZED)
 * GET /api/admin/dashboard-stats
 * Single endpoint that aggregates all dashboard data efficiently
 * Reduces multiple API calls to one, improving load time
 */
router.get('/dashboard-stats', protect, authorize('admin'), async (req, res) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Execute all queries in parallel for maximum efficiency
    const [
      usersResult,
      clientsResult,
      jobsResult,
      messagesResult,
      timecardsResult
    ] = await Promise.all([
      // 1. Users - get counts by role in single query
      supabase
        .from('users')
        .select('id, role, is_active'),
      
      // 2. Clients count
      supabase
        .from('clients')
        .select('id', { count: 'exact', head: true }),
      
      // 3. Active jobs count
      supabase
        .from('job_postings')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      
      // 4. New contact messages count
      supabase
        .from('contact_messages')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new'),
      
      // 5. Timecards for current month with hours
      supabase
        .from('time_cards')
        .select('id, hours_worked, date')
        .gte('date', firstDayOfMonth.toISOString().split('T')[0])
        .lte('date', lastDayOfMonth.toISOString().split('T')[0])
    ]);

    // Process users data
    const users = usersResult.data || [];
    const employees = users.filter(u => u.role === 'employee');
    const employers = users.filter(u => u.role === 'employer');
    const admins = users.filter(u => u.role === 'admin');
    const activeEmployees = employees.filter(u => u.is_active !== false);
    const inactiveUsers = users.filter(u => u.is_active === false);

    // Process timecards data
    const timecards = timecardsResult.data || [];
    const totalHours = timecards.reduce((sum, tc) => sum + (parseFloat(tc.hours_worked) || 0), 0);
    
    // Calculate hours by day of week
    const hoursByDay = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    timecards.forEach(tc => {
      const date = new Date(tc.date);
      const dayName = dayNames[date.getDay()];
      hoursByDay[dayName] += parseFloat(tc.hours_worked) || 0;
    });

    // Round hours
    Object.keys(hoursByDay).forEach(day => {
      hoursByDay[day] = Math.round(hoursByDay[day]);
    });

    // Build response
    const dashboardStats = {
      // Summary counts
      stats: {
        totalUsers: users.length,
        totalClients: clientsResult.count || 0,
        totalHours: Math.round(totalHours),
        activeEmployees: activeEmployees.length,
        jobPostings: jobsResult.count || 0,
        contactMessages: messagesResult.count || 0
      },
      
      // User distribution for pie chart
      userDistribution: [
        { name: 'Employees', value: employees.length, color: '#3b82f6' },
        { name: 'Employers', value: employers.length, color: '#8b5cf6' },
        { name: 'Admins', value: admins.length, color: '#10b981' },
        { name: 'Inactive', value: inactiveUsers.length, color: '#6b7280' }
      ],
      
      // Hours trend for chart
      hoursTrend: [
        { day: 'Mon', hours: hoursByDay.Mon, target: 40 },
        { day: 'Tue', hours: hoursByDay.Tue, target: 40 },
        { day: 'Wed', hours: hoursByDay.Wed, target: 40 },
        { day: 'Thu', hours: hoursByDay.Thu, target: 40 },
        { day: 'Fri', hours: hoursByDay.Fri, target: 40 },
        { day: 'Sat', hours: hoursByDay.Sat, target: 40 },
        { day: 'Sun', hours: hoursByDay.Sun, target: 40 }
      ],
      
      // Metadata
      meta: {
        generatedAt: new Date().toISOString(),
        period: {
          start: firstDayOfMonth.toISOString(),
          end: lastDayOfMonth.toISOString()
        }
      }
    };

    res.status(200).json({
      success: true,
      ...dashboardStats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * ADMIN ONLY: Sync all users to Supabase Auth
 * POST /api/admin/users/sync-all-auth
 * Batch syncs all users who don't have Supabase Auth accounts
 */
router.post('/users/sync-all-auth', protect, authorize('admin'), async (req, res) => {
  try {
    // Get all users without Supabase Auth IDs
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .is('supabase_auth_id', null);

    if (fetchError) {
      return res.status(500).json({ message: 'Failed to fetch users', error: fetchError.message });
    }

    if (!users || users.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'All users are already synced to Supabase Auth',
        synced: 0,
        failed: 0
      });
    }

    let synced = 0;
    let failed = 0;
    const errors = [];

    for (const user of users) {
      try {
        // Create in Supabase Auth with a temporary password
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: 'TempPass123!', // Users must reset via email
          email_confirm: true,
          user_metadata: {
            name: user.name,
            role: user.role
          }
        });

        if (authError) {
          failed++;
          errors.push({ email: user.email, error: authError.message });
          continue;
        }

        // Update custom users table
        await supabase
          .from('users')
          .update({ supabase_auth_id: authData.user.id })
          .eq('id', user.id);

        synced++;
        console.log(`✅ Synced: ${user.email}`);
      } catch (err) {
        failed++;
        errors.push({ email: user.email, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Sync complete. Users can now use "Forgot Password" to reset their passwords via email.`,
      synced,
      failed,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error syncing users to Supabase Auth:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

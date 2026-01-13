import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import supabase from '../config/supabase.js';

const router = express.Router();

// Get hours summary (admin only)
router.get('/hours-summary', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = supabase.from('time_cards').select('date, hours_worked, employee_id');

    if (startDate) {
      query = query.gte('date', new Date(startDate).toISOString().split('T')[0]);
    }
    if (endDate) {
      query = query.lte('date', new Date(endDate).toISOString().split('T')[0]);
    }

    const { data: timeCards, error } = await query;

    if (error) throw error;

    // Get all unique employee IDs
    const employeeIds = [...new Set((timeCards || []).map(card => card.employee_id))];
    
    // Fetch hourly pay for all employees
    const { data: employees } = await supabase
      .from('users')
      .select('id, hourly_pay')
      .in('id', employeeIds);

    const employeePayMap = {};
    (employees || []).forEach(emp => {
      employeePayMap[emp.id] = parseFloat(emp.hourly_pay || 0) || 25;
    });

    // Group by month in JavaScript
    const monthlySummary = {};
    (timeCards || []).forEach(card => {
      const date = new Date(card.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlySummary[monthKey]) {
        monthlySummary[monthKey] = {
          month: monthKey,
          totalHours: 0,
          totalAmount: 0,
          count: 0
        };
      }
      
      const hours = parseFloat(card.hours_worked || 0);
      const hourlyPay = employeePayMap[card.employee_id] || 25;
      const amount = hours * hourlyPay;
      
      monthlySummary[monthKey].totalHours += hours;
      monthlySummary[monthKey].totalAmount += amount;
      monthlySummary[monthKey].count += 1;
    });

    // Convert to array and sort
    const summary = Object.values(monthlySummary)
      .map(item => ({
        _id: { month: item.month },
        totalHours: Math.round(item.totalHours * 10) / 10,
        totalAmount: Math.round(item.totalAmount * 100) / 100,
        count: item.count
      }))
      .sort((a, b) => b._id.month.localeCompare(a._id.month));

    res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error fetching hours summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get client activity report (admin only)
router.get('/client-activity', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get all timecards with employee info
    let query = supabase
      .from('time_cards')
      .select('employee_id, hours_worked, client_id');

    if (startDate) {
      query = query.gte('date', new Date(startDate).toISOString().split('T')[0]);
    }
    if (endDate) {
      query = query.lte('date', new Date(endDate).toISOString().split('T')[0]);
    }

    const { data: timeCards, error } = await query;

    if (error) throw error;

    // Get all unique employee IDs
    const employeeIds = [...new Set((timeCards || []).map(card => card.employee_id))];
    
    // Fetch employee details with hourly pay
    const { data: employees } = await supabase
      .from('users')
      .select('id, name, email, hourly_pay')
      .in('id', employeeIds);

    const employeeMap = {};
    (employees || []).forEach(emp => {
      employeeMap[emp.id] = {
        name: emp.name || 'Unknown Employee',
        hourlyPay: parseFloat(emp.hourly_pay || 0) || 25
      };
    });

    // Group by employee in JavaScript with calculations
    const activityMap = {};
    (timeCards || []).forEach(card => {
      const empId = card.employee_id;
      if (!activityMap[empId]) {
        activityMap[empId] = {
          totalHours: 0,
          totalAmount: 0,
          count: 0
        };
      }
      const hours = parseFloat(card.hours_worked || 0);
      const hourlyPay = employeeMap[empId]?.hourlyPay || 25;
      activityMap[empId].totalHours += hours;
      activityMap[empId].totalAmount += hours * hourlyPay;
      activityMap[empId].count += 1;
    });

    // Build report
    const report = Object.entries(activityMap).map(([employeeId, stats]) => ({
      employeeId: employeeId,
      clientName: employeeMap[employeeId]?.name || 'Unknown Employee',
      totalHours: Math.round(stats.totalHours * 10) / 10,
      totalAmount: Math.round(stats.totalAmount * 100) / 100,
      count: stats.count,
      avgHoursPerEntry: stats.count > 0 ? Math.round((stats.totalHours / stats.count) * 10) / 10 : 0
    }));

    // Sort by total hours descending
    report.sort((a, b) => b.totalHours - a.totalHours);

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error fetching client activity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's weekly hours summary
router.get('/my-weekly-summary', protect, async (req, res) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const { data: timeCards, error } = await supabase
      .from('time_cards')
      .select('*')
      .eq('employee_id', req.user.id)
      .gte('date', startOfWeek.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;

    const totalHours = (timeCards || []).reduce((sum, card) => sum + parseFloat(card.hours_worked || 0), 0);

    res.status(200).json({
      success: true,
      totalHours: Math.round(totalHours * 10) / 10,
      entries: (timeCards || []).length,
      timeCards: timeCards || []
    });
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's monthly hours summary
router.get('/my-monthly-summary', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    const today = new Date();
    const currentMonth = month ? parseInt(month) - 1 : today.getMonth();
    const currentYear = year ? parseInt(year) : today.getFullYear();

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const { data: timeCards, error } = await supabase
      .from('time_cards')
      .select('*')
      .eq('employee_id', req.user.id)
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .lte('date', endOfMonth.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;

    // Get user hourly pay
    const { data: user } = await supabase
      .from('users')
      .select('hourly_pay')
      .eq('id', req.user.id)
      .single();

    const hourlyPay = parseFloat(user?.hourly_pay || 0) || 25;
    const totalHours = (timeCards || []).reduce((sum, card) => sum + parseFloat(card.hours_worked || 0), 0);
    const totalAmount = totalHours * hourlyPay;

    res.status(200).json({
      success: true,
      month: currentMonth + 1,
      year: currentYear,
      totalHours: Math.round(totalHours * 10) / 10,
      hourlyPay: hourlyPay,
      totalAmount: Math.round(totalAmount * 100) / 100,
      entries: (timeCards || []).length,
      timeCards: timeCards || []
    });
  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get monthly report for all employees (admin only)
router.get('/monthly-employee-report', protect, authorize('admin'), async (req, res) => {
  try {
    const { month, year } = req.query; // Format: month="01", year="2026"
    
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endOfMonth = new Date(parseInt(year), parseInt(month), 0);

    // Get all employees
    const { data: employees, error: empError } = await supabase
      .from('users')
      .select('id, name, email, role, department, designation, hourly_pay, employer_id')
      .eq('role', 'employee');

    if (empError) throw empError;

    // Get timecards for the month
    const { data: timeCards, error: tcError } = await supabase
      .from('time_cards')
      .select('employee_id, hours_worked, date')
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .lte('date', endOfMonth.toISOString().split('T')[0]);

    if (tcError) throw tcError;

    // Get employer details
    const employerIds = [...new Set((employees || []).map(emp => emp.employer_id).filter(Boolean))];
    const { data: employers } = await supabase
      .from('users')
      .select('id, name, email')
      .in('id', employerIds);

    const employerMap = {};
    (employers || []).forEach(emp => {
      employerMap[emp.id] = emp;
    });

    // Build monthly report
    const report = (employees || []).map(employee => {
      const userTimecards = (timeCards || []).filter(tc => tc.employee_id === employee.id);
      const totalHours = userTimecards.reduce((sum, tc) => sum + parseFloat(tc.hours_worked || 0), 0);
      const hourlyPay = parseFloat(employee.hourly_pay || 0) || 25;
      const totalAmount = totalHours * hourlyPay;
      const entries = userTimecards.length;
      const avgHoursPerEntry = entries > 0 ? totalHours / entries : 0;

      return {
        employeeId: employee.id,
        name: employee.name,
        email: employee.email,
        department: employee.department || 'N/A',
        designation: employee.designation || 'N/A',
        hourlyPay: hourlyPay,
        totalHours: Math.round(totalHours * 10) / 10,
        entries: entries,
        avgHoursPerEntry: Math.round(avgHoursPerEntry * 10) / 10,
        totalAmount: Math.round(totalAmount * 100) / 100,
        employer: employee.employer_id ? employerMap[employee.employer_id] : null
      };
    });

    // Calculate totals
    const totals = report.reduce((acc, emp) => {
      acc.totalHours += emp.totalHours;
      acc.totalAmount += emp.totalAmount;
      acc.totalEntries += emp.entries;
      return acc;
    }, { totalHours: 0, totalAmount: 0, totalEntries: 0 });

    res.status(200).json({
      success: true,
      month: parseInt(month),
      year: parseInt(year),
      report: report.sort((a, b) => b.totalHours - a.totalHours),
      totals: {
        totalHours: Math.round(totals.totalHours * 10) / 10,
        totalAmount: Math.round(totals.totalAmount * 100) / 100,
        totalEntries: totals.totalEntries,
        avgHoursPerEntry: totals.totalEntries > 0 ? Math.round((totals.totalHours / totals.totalEntries) * 10) / 10 : 0
      }
    });
  } catch (error) {
    console.error('Error fetching monthly employee report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get monthly report for all employers (admin only)
router.get('/monthly-employer-report', protect, authorize('admin'), async (req, res) => {
  try {
    const { month, year } = req.query; // Format: month="01", year="2026"
    
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endOfMonth = new Date(parseInt(year), parseInt(month), 0);

    // Get all employers
    const { data: employers, error: empError } = await supabase
      .from('users')
      .select('id, name, email, role, department, designation, hourly_pay')
      .eq('role', 'employer');

    if (empError) throw empError;

    // Get timecards for the month (employers log their own hours)
    const { data: timeCards, error: tcError } = await supabase
      .from('time_cards')
      .select('employee_id, hours_worked, date')
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .lte('date', endOfMonth.toISOString().split('T')[0]);

    if (tcError) throw tcError;

    // Build monthly report
    const report = (employers || []).map(employer => {
      const userTimecards = (timeCards || []).filter(tc => tc.employee_id === employer.id);
      const totalHours = userTimecards.reduce((sum, tc) => sum + parseFloat(tc.hours_worked || 0), 0);
      const hourlyPay = parseFloat(employer.hourly_pay || 0) || 25;
      const totalAmount = totalHours * hourlyPay;
      const entries = userTimecards.length;
      const avgHoursPerEntry = entries > 0 ? totalHours / entries : 0;

      return {
        employerId: employer.id,
        name: employer.name,
        email: employer.email,
        department: employer.department || 'N/A',
        designation: employer.designation || 'N/A',
        hourlyPay: hourlyPay,
        totalHours: Math.round(totalHours * 10) / 10,
        entries: entries,
        avgHoursPerEntry: Math.round(avgHoursPerEntry * 10) / 10,
        totalAmount: Math.round(totalAmount * 100) / 100
      };
    });

    // Calculate totals
    const totals = report.reduce((acc, emp) => {
      acc.totalHours += emp.totalHours;
      acc.totalAmount += emp.totalAmount;
      acc.totalEntries += emp.entries;
      return acc;
    }, { totalHours: 0, totalAmount: 0, totalEntries: 0 });

    res.status(200).json({
      success: true,
      month: parseInt(month),
      year: parseInt(year),
      report: report.sort((a, b) => b.totalHours - a.totalHours),
      totals: {
        totalHours: Math.round(totals.totalHours * 10) / 10,
        totalAmount: Math.round(totals.totalAmount * 100) / 100,
        totalEntries: totals.totalEntries,
        avgHoursPerEntry: totals.totalEntries > 0 ? Math.round((totals.totalHours / totals.totalEntries) * 10) / 10 : 0
      }
    });
  } catch (error) {
    console.error('Error fetching monthly employer report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

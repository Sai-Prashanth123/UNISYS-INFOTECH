import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import supabase from '../config/supabase.js';

const router = express.Router();

// Transform job from DB to frontend format
const transformJob = (job) => ({
  _id: job.id,
  id: job.id,
  jobCode: job.job_code,
  title: job.title,
  department: job.department,
  location: job.location,
  type: job.type,
  description: job.description,
  responsibilities: job.responsibilities || [],
  expectedSkills: job.expected_skills || [],
  qualifications: job.qualifications || [],
  technicalStack: job.technical_stack || [],
  skills: job.skills || [],
  yearsOfExperience: job.years_of_experience,
  experience: job.experience,
  salary: job.salary,
  additionalInfo: job.additional_info,
  predictedFeedback: job.predicted_feedback,
  isActive: job.is_active,
  displayOrder: job.display_order || 0,
  postedDate: job.posted_date,
  endDate: job.end_date,
  createdAt: job.created_at,
  updatedAt: job.updated_at
});

// Transform application from DB to frontend format
const transformApplication = (app) => ({
  _id: app.id,
  id: app.id,
  jobId: app.job_id,
  fullName: app.full_name,
  email: app.email,
  phone: app.phone,
  currentLocation: app.current_location,
  experience: app.experience,
  currentCompany: app.current_company,
  currentRole: app.current_role_name,
  noticePeriod: app.notice_period,
  expectedSalary: app.expected_salary,
  resumeUrl: app.resume_url,
  coverLetter: app.cover_letter,
  linkedinUrl: app.linkedin_url,
  portfolioUrl: app.portfolio_url,
  status: app.status,
  notes: app.notes,
  appliedDate: app.applied_date,
  createdAt: app.created_at,
  updatedAt: app.updated_at,
  // Include job info if joined
  jobTitle: app.job_postings?.title,
  jobDepartment: app.job_postings?.department,
  jobLocation: app.job_postings?.location
});

// Public routes
// Get all active job postings
router.get('/', async (req, res) => {
  try {
    const { data: jobs, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('posted_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching jobs:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching job postings',
        error: error.message
      });
    }
    
    const transformedJobs = (jobs || []).map(transformJob);
    
    res.json({
      success: true,
      count: transformedJobs.length,
      data: transformedJobs
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job postings',
      error: error.message
    });
  }
});

// Get single job posting by ID
router.get('/:id', async (req, res) => {
  try {
    const { data: job, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error || !job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    res.json({
      success: true,
      data: transformJob(job)
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job posting',
      error: error.message
    });
  }
});

// Submit job application (PUBLIC - no auth required)
router.post('/:id/apply', async (req, res) => {
  try {
    // Check if job exists and is active
    const { data: job } = await supabase
      .from('job_postings')
      .select('is_active, title')
      .eq('id', req.params.id)
      .single();
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    if (!job.is_active) {
      return res.status(400).json({
        success: false,
        message: 'This job posting is no longer active'
      });
    }

    // Check for duplicate application (same email + same job)
    const { data: existingApp } = await supabase
      .from('job_applications')
      .select('id')
      .eq('job_id', req.params.id)
      .eq('email', req.body.email?.toLowerCase().trim())
      .maybeSingle();

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this position'
      });
    }

    // Create application
    const { data: application, error } = await supabase
      .from('job_applications')
      .insert({
        job_id: req.params.id,
        full_name: req.body.fullName || req.body.full_name,
        email: req.body.email?.toLowerCase().trim(),
        phone: req.body.phone?.trim(),
        current_location: req.body.currentLocation || req.body.current_location,
        experience: req.body.experience,
        current_company: req.body.currentCompany || req.body.current_company || '',
        current_role_name: req.body.currentRole || req.body.current_role_name || '',
        notice_period: req.body.noticePeriod || req.body.notice_period,
        expected_salary: req.body.expectedSalary || req.body.expected_salary || '',
        resume_url: req.body.resumeUrl || req.body.resume_url || '',
        cover_letter: req.body.coverLetter || req.body.cover_letter || '',
        linkedin_url: req.body.linkedinUrl || req.body.linkedin_url || '',
        portfolio_url: req.body.portfolioUrl || req.body.portfolio_url || '',
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating application:', error);
      return res.status(400).json({
        success: false,
        message: 'Error submitting application',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: `Application submitted successfully for ${job.title}`,
      data: transformApplication(application)
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(400).json({
      success: false,
      message: 'Error submitting application',
      error: error.message
    });
  }
});

// Admin routes (protected)
// Get all job postings (including inactive)
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { data: jobs, error } = await supabase
      .from('job_postings')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching jobs:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching job postings',
        error: error.message
      });
    }
    
    const transformedJobs = (jobs || []).map(transformJob);
    
    res.json({
      success: true,
      count: transformedJobs.length,
      data: transformedJobs
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job postings',
      error: error.message
    });
  }
});

// Create new job posting
router.post('/admin/create', protect, authorize('admin'), async (req, res) => {
  try {
    const { data: job, error } = await supabase
      .from('job_postings')
      .insert({
        title: req.body.title,
        department: req.body.department,
        location: req.body.location,
        type: req.body.type || 'Full-time',
        description: req.body.description,
        responsibilities: req.body.responsibilities || [],
        expected_skills: req.body.expectedSkills || req.body.expected_skills || [],
        qualifications: req.body.qualifications || [],
        technical_stack: req.body.technicalStack || req.body.technical_stack || [],
        skills: req.body.skills || [],
        years_of_experience: req.body.yearsOfExperience || req.body.years_of_experience,
        experience: req.body.experience || '',
        salary: req.body.salary || '',
        additional_info: req.body.additionalInfo || req.body.additional_info || '',
        predicted_feedback: req.body.predictedFeedback || req.body.predicted_feedback || '',
        is_active: req.body.isActive !== undefined ? req.body.isActive : true,
        display_order: req.body.displayOrder || req.body.display_order || 0,
        posted_date: req.body.postedDate || req.body.posted_date || new Date().toISOString().split('T')[0],
        end_date: req.body.endDate || req.body.end_date || null
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating job:', error);
      return res.status(400).json({
        success: false,
        message: 'Error creating job posting',
        error: error.message
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      data: transformJob(job)
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating job posting',
      error: error.message
    });
  }
});

// Update job posting
router.put('/admin/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const updateData = {};
    
    // Map camelCase to snake_case
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.department !== undefined) updateData.department = req.body.department;
    if (req.body.location !== undefined) updateData.location = req.body.location;
    if (req.body.type !== undefined) updateData.type = req.body.type;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.responsibilities !== undefined) updateData.responsibilities = req.body.responsibilities;
    if (req.body.expectedSkills !== undefined) updateData.expected_skills = req.body.expectedSkills;
    if (req.body.qualifications !== undefined) updateData.qualifications = req.body.qualifications;
    if (req.body.technicalStack !== undefined) updateData.technical_stack = req.body.technicalStack;
    if (req.body.skills !== undefined) updateData.skills = req.body.skills;
    if (req.body.yearsOfExperience !== undefined) updateData.years_of_experience = req.body.yearsOfExperience;
    if (req.body.experience !== undefined) updateData.experience = req.body.experience;
    if (req.body.salary !== undefined) updateData.salary = req.body.salary;
    if (req.body.additionalInfo !== undefined) updateData.additional_info = req.body.additionalInfo;
    if (req.body.predictedFeedback !== undefined) updateData.predicted_feedback = req.body.predictedFeedback;
    if (req.body.isActive !== undefined) updateData.is_active = req.body.isActive;
    if (req.body.displayOrder !== undefined) updateData.display_order = req.body.displayOrder;
    if (req.body.postedDate !== undefined) updateData.posted_date = req.body.postedDate;
    if (req.body.endDate !== undefined) updateData.end_date = req.body.endDate;

    const { data: job, error } = await supabase
      .from('job_postings')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    res.json({
      success: true,
      message: 'Job posting updated successfully',
      data: transformJob(job)
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating job posting',
      error: error.message
    });
  }
});

// Delete job posting (will also cascade delete applications if FK is set)
router.delete('/admin/:id', protect, authorize('admin'), async (req, res) => {
  try {
    // First delete all applications for this job
    await supabase
      .from('job_applications')
      .delete()
      .eq('job_id', req.params.id);

    // Then delete the job
    const { data: job, error } = await supabase
      .from('job_postings')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    res.json({
      success: true,
      message: 'Job posting deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job posting',
      error: error.message
    });
  }
});

// Get all applications for a specific job
router.get('/admin/:id/applications', protect, authorize('admin'), async (req, res) => {
  try {
    const { data: applications, error } = await supabase
      .from('job_applications')
      .select('*, job_postings(title, department, location)')
      .eq('job_id', req.params.id)
      .order('applied_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching applications:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching applications',
        error: error.message
      });
    }
    
    const transformedApps = (applications || []).map(transformApplication);
    
    res.json({
      success: true,
      count: transformedApps.length,
      data: transformedApps
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
});

// Get all applications (all jobs)
router.get('/admin/applications/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { data: applications, error } = await supabase
      .from('job_applications')
      .select('*, job_postings(title, department, location)')
      .order('applied_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching applications:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching applications',
        error: error.message
      });
    }
    
    const transformedApps = (applications || []).map(transformApplication);
    
    res.json({
      success: true,
      count: transformedApps.length,
      data: transformedApps
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
});

// Update application status
router.put('/admin/applications/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const updateData = { status: req.body.status };
    if (req.body.notes !== undefined) updateData.notes = req.body.notes;

    const { data: application, error } = await supabase
      .from('job_applications')
      .update(updateData)
      .eq('id', req.params.id)
      .select('*, job_postings(title, department, location)')
      .single();

    if (error || !application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: transformApplication(application)
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating application',
      error: error.message
    });
  }
});

// Delete application
router.delete('/admin/applications/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting application',
      error: error.message
    });
  }
});

export default router;

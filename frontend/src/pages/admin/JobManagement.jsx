import React, { useState, useEffect, useRef } from 'react';
import { useThemeStore } from '../../store/index.js';
import { jobsApi } from '../../api/endpoints.js';
import { supabase } from '../../config/supabase.js';
import { toast } from 'react-toastify';
import { 
  Plus, Edit2, Trash2, Eye, Users, X, FileText, Download, 
  ExternalLink, Star, CheckCircle, XCircle, Clock, Loader2, 
  RefreshCw, Briefcase, MapPin, Wifi, WifiOff, Search, Filter
} from 'lucide-react';

// Status badge colors
const statusColors = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  reviewing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  shortlisted: 'bg-green-500/20 text-green-400 border-green-500/30',
  interviewed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  offered: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  withdrawn: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
};

const statusIcons = {
  new: Clock,
  reviewing: Eye,
  shortlisted: Star,
  interviewed: Users,
  offered: CheckCircle,
  rejected: XCircle,
  withdrawn: XCircle
};

export const JobManagement = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedJobApplications, setSelectedJobApplications] = useState([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const subscriptionRef = useRef(null);
  
  const [formData, setFormData] = useState({
    jobCode: '',
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    description: '',
    responsibilities: [''],
    expectedSkills: [''],
    qualifications: [''],
    technicalStack: [''],
    skills: [''],
    yearsOfExperience: '',
    experience: '',
    salary: '',
    additionalInfo: '',
    isActive: true,
    displayOrder: 0,
    postedDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  useEffect(() => {
    fetchJobs();
    fetchApplications();
    setupRealtimeSubscription();

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, []);

  // Real-time subscription
  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('admin-jobs-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'job_postings' },
        (payload) => {
          console.log('🔄 Job posting changed:', payload.eventType);
          
          if (payload.eventType === 'INSERT') {
            setJobs(prev => [transformJob(payload.new), ...prev]);
            toast.info(`New job created: ${payload.new.title}`);
          } else if (payload.eventType === 'UPDATE') {
            setJobs(prev => prev.map(j => j._id === payload.new.id ? transformJob(payload.new) : j));
          } else if (payload.eventType === 'DELETE') {
            setJobs(prev => prev.filter(j => j._id !== payload.old.id));
            toast.info('Job posting deleted');
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'job_applications' },
        (payload) => {
          console.log('🔄 Application changed:', payload.eventType);
          
          if (payload.eventType === 'INSERT') {
            fetchApplications();
            toast.info('New application received!');
          } else if (payload.eventType === 'UPDATE') {
            fetchApplications();
            // Also refresh selected job applications if modal is open
            if (selectedJobApplications.length > 0) {
              const jobId = selectedJobApplications[0]?.jobId || selectedJobApplications[0]?.job_id;
              if (jobId) {
                refreshSelectedJobApplications(jobId);
              }
            }
          }
        }
      )
      .subscribe((status) => {
        setRealtimeConnected(status === 'SUBSCRIBED');
      });

    subscriptionRef.current = channel;
  };

  // Transform database job to frontend format
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
    isActive: job.is_active,
    displayOrder: job.display_order || 0,
    postedDate: job.posted_date,
    endDate: job.end_date
  });

  // Transform application data
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
    appliedDate: app.applied_date,
    jobTitle: app.job_postings?.title,
    jobDepartment: app.job_postings?.department,
    jobLocation: app.job_postings?.location
  });

  const fetchJobs = async () => {
    try {
      const response = await jobsApi.getAllAdmin();
      const transformedJobs = (response.data.data || []).map(transformJob);
      setJobs(transformedJobs);
    } catch (error) {
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await jobsApi.getAllApplications();
      const transformedApps = (response.data.data || []).map(transformApplication);
      setApplications(transformedApps);
    } catch (error) {
      console.error('Failed to fetch applications');
    }
  };

  const refreshSelectedJobApplications = async (jobId) => {
    try {
      const response = await jobsApi.getApplications(jobId);
      const transformedApps = (response.data.data || []).map(transformApplication);
      setSelectedJobApplications(transformedApps);
    } catch (error) {
      console.error('Failed to refresh applications');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchJobs(), fetchApplications()]);
    setRefreshing(false);
    toast.success('Data refreshed!');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filter out empty strings from arrays
    const cleanedData = {
      ...formData,
      responsibilities: formData.responsibilities.filter(item => item.trim()),
      expectedSkills: formData.expectedSkills.filter(item => item.trim()),
      qualifications: formData.qualifications.filter(item => item.trim()),
      technicalStack: formData.technicalStack.filter(item => item.trim()),
      skills: formData.skills.filter(item => item.trim())
    };

    try {
      if (editingJob) {
        await jobsApi.update(editingJob._id, cleanedData);
        toast.success('Job updated successfully');
      } else {
        await jobsApi.create(cleanedData);
        toast.success('Job created successfully');
      }
      fetchJobs();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save job');
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      jobCode: job.jobCode || '',
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      description: job.description,
      responsibilities: job.responsibilities?.length ? job.responsibilities : [''],
      expectedSkills: job.expectedSkills?.length ? job.expectedSkills : [''],
      qualifications: job.qualifications?.length ? job.qualifications : [''],
      technicalStack: job.technicalStack?.length ? job.technicalStack : [''],
      skills: job.skills?.length ? job.skills : [''],
      yearsOfExperience: job.yearsOfExperience || '',
      experience: job.experience || '',
      salary: job.salary || '',
      additionalInfo: job.additionalInfo || '',
      isActive: job.isActive,
      displayOrder: job.displayOrder || 0,
      postedDate: job.postedDate || new Date().toISOString().split('T')[0],
      endDate: job.endDate || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job? All applications will also be deleted.')) {
      try {
        await jobsApi.delete(id);
        toast.success('Job deleted successfully');
        fetchJobs();
      } catch (error) {
        toast.error('Failed to delete job');
      }
    }
  };

  const viewApplications = async (job) => {
    try {
      setSelectedJobTitle(job.title);
      const response = await jobsApi.getApplications(job._id);
      const transformedApps = (response.data.data || []).map(transformApplication);
      setSelectedJobApplications(transformedApps);
      setShowApplicationsModal(true);
    } catch (error) {
      toast.error('Failed to fetch applications');
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await jobsApi.updateApplicationStatus(applicationId, newStatus);
      toast.success('Application status updated');
      // Refresh the applications for this job
      fetchApplications();
      if (selectedJobApplications.length > 0) {
        const jobId = selectedJobApplications[0]?.jobId;
        if (jobId) {
          refreshSelectedJobApplications(jobId);
        }
      }
    } catch (error) {
      toast.error('Failed to update application status');
    }
  };

  const viewResume = (app) => {
    setSelectedResume(app);
    setShowResumeModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingJob(null);
    setFormData({
      jobCode: '',
      title: '',
      department: '',
      location: '',
      type: 'Full-time',
      description: '',
      responsibilities: [''],
      expectedSkills: [''],
      qualifications: [''],
      technicalStack: [''],
      skills: [''],
      yearsOfExperience: '',
      experience: '',
      salary: '',
      additionalInfo: '',
      isActive: true,
      displayOrder: 0,
      postedDate: new Date().toISOString().split('T')[0],
      endDate: ''
    });
  };

  const getApplicationCount = (jobId) => {
    return applications.filter(app => app.jobId === jobId).length;
  };

  // Filter applications in modal
  const filteredApplications = selectedJobApplications.filter(app => {
    const matchesSearch = app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-slate-400 mt-4">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Job Management</h1>
            <div className="flex items-center gap-3">
              <p className="text-slate-300">Manage job postings and applications</p>
              {/* Realtime indicator */}
              <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                realtimeConnected 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {realtimeConnected ? (
                  <>
                    <Wifi size={12} />
                    <span>Live</span>
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  </>
                ) : (
                  <>
                    <WifiOff size={12} />
                    <span>Connecting...</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 shadow-lg hover:scale-105"
            >
              <Plus size={20} />
              Add New Job
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
            <p className="text-slate-300 text-sm">Total Jobs</p>
            <p className="text-2xl font-bold text-white">{jobs.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
            <p className="text-slate-300 text-sm">Active Jobs</p>
            <p className="text-2xl font-bold text-green-400">{jobs.filter(j => j.isActive).length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
            <p className="text-slate-300 text-sm">Total Applications</p>
            <p className="text-2xl font-bold text-blue-400">{applications.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
            <p className="text-slate-300 text-sm">New Applications</p>
            <p className="text-2xl font-bold text-yellow-400">{applications.filter(a => a.status === 'new').length}</p>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <h3 className="text-xl font-bold text-white">{job.title}</h3>
                    {job.jobCode && (
                      <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/20 text-blue-200">
                        {job.jobCode}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      job.isActive 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={14} />
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {job.type}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mb-4 text-slate-200 text-sm line-clamp-2">
                {job.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {job.skills?.slice(0, 4).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-200"
                  >
                    {skill}
                  </span>
                ))}
                {job.skills?.length > 4 && (
                  <span className="px-2 py-1 rounded-full text-xs text-slate-400">
                    +{job.skills.length - 4} more
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <div className="text-sm text-slate-400">
                  {job.yearsOfExperience ? `${job.yearsOfExperience} years exp` : job.experience}
                  {job.salary && ` • ${job.salary}`}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => viewApplications(job)}
                    className="p-2.5 rounded-lg transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white relative hover:scale-105 shadow-lg"
                    title="View Applications"
                  >
                    <Users size={18} />
                    {getApplicationCount(job._id) > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-md">
                        {getApplicationCount(job._id)}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(job)}
                    className="p-2.5 rounded-lg transition-all duration-300 bg-white/10 hover:bg-white/20 text-white hover:scale-105"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-16">
            <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-xl text-white mb-2">No jobs posted yet</p>
            <p className="text-slate-400">Click "Add New Job" to create your first job posting</p>
          </div>
        )}
      </div>

      {/* Add/Edit Job Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-[#1a2942] to-[#0f1d35] border border-white/20 rounded-2xl p-6 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{editingJob ? 'Edit Job' : 'Add New Job'}</h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-white/10 text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-white/20 pb-2 text-white">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-white">Job Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Senior Software Engineer"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Department *</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Engineering"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Remote, New York"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Job Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                    >
                      <option value="Full-time" className="bg-slate-800">Full-time</option>
                      <option value="Part-time" className="bg-slate-800">Part-time</option>
                      <option value="Contract" className="bg-slate-800">Contract</option>
                      <option value="Internship" className="bg-slate-800">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Years of Experience</label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="e.g., 3"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Salary Range</label>
                    <input
                      type="text"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      placeholder="e.g., $80,000 - $120,000"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Posting Date *</label>
                    <input
                      type="date"
                      name="postedDate"
                      value={formData.postedDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="text-sm font-medium text-white">Active (visible on careers page)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-white/20 pb-2 text-white">Job Description</h3>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  placeholder="Brief overview of the position..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-white/20 pb-2 text-white">Skills (Tags)</h3>
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                      placeholder="e.g., React, JavaScript"
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    {formData.skills.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('skills', index)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('skills')}
                  className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
                >
                  + Add Skill
                </button>
              </div>

              {/* Responsibilities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-white/20 pb-2 text-white">Responsibilities</h3>
                {formData.responsibilities.map((resp, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={resp}
                      onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                      placeholder="Describe a key responsibility..."
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    {formData.responsibilities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('responsibilities', index)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('responsibilities')}
                  className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
                >
                  + Add Responsibility
                </button>
              </div>

              {/* Qualifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-white/20 pb-2 text-white">Qualifications</h3>
                {formData.qualifications.map((qual, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={qual}
                      onChange={(e) => handleArrayChange('qualifications', index, e.target.value)}
                      placeholder="e.g., Bachelor's degree in Computer Science"
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    {formData.qualifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('qualifications', index)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('qualifications')}
                  className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
                >
                  + Add Qualification
                </button>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/20">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:scale-105"
                >
                  {editingJob ? 'Update Job' : 'Create Job'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 rounded-xl font-semibold bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applications Modal */}
      {showApplicationsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-[#1a2942] to-[#0f1d35] border border-white/20 rounded-2xl p-6 max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Applications</h2>
                <p className="text-blue-400">{selectedJobTitle}</p>
                <p className="text-slate-400 text-sm">{selectedJobApplications.length} applicants</p>
              </div>
              <button 
                onClick={() => setShowApplicationsModal(false)} 
                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="offered">Offered</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No applications found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => {
                  const StatusIcon = statusIcons[app.status] || Clock;
                  return (
                    <div 
                      key={app._id} 
                      className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* Applicant Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-bold text-white">{app.fullName}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${statusColors[app.status]}`}>
                              <StatusIcon size={12} />
                              {app.status?.charAt(0).toUpperCase() + app.status?.slice(1)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-300 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Email:</span>
                              <a href={`mailto:${app.email}`} className="text-blue-400 hover:underline truncate">
                                {app.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Phone:</span>
                              <span>{app.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Location:</span>
                              <span>{app.currentLocation}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Experience:</span>
                              <span>{app.experience}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Notice:</span>
                              <span>{app.noticePeriod}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Applied:</span>
                              <span>{new Date(app.appliedDate).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {app.currentCompany && (
                            <p className="text-sm text-slate-400">
                              <span className="text-slate-500">Current:</span> {app.currentRole} at {app.currentCompany}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 lg:items-end">
                          <select
                            value={app.status}
                            onChange={(e) => updateApplicationStatus(app._id, e.target.value)}
                            className={`px-4 py-2 rounded-lg border text-sm font-semibold bg-white/5 ${statusColors[app.status]}`}
                          >
                            <option value="new">New</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="interviewed">Interviewed</option>
                            <option value="offered">Offered</option>
                            <option value="rejected">Rejected</option>
                            <option value="withdrawn">Withdrawn</option>
                          </select>

                          <div className="flex gap-2">
                            {app.resumeUrl && (
                              <>
                                <button
                                  onClick={() => viewResume(app)}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
                                >
                                  <FileText size={16} />
                                  View Resume
                                </button>
                                <a
                                  href={app.resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
                                >
                                  <Download size={16} />
                                </a>
                              </>
                            )}
                            {app.linkedinUrl && (
                              <a
                                href={app.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium flex items-center gap-1 transition-all"
                              >
                                <ExternalLink size={14} />
                                LinkedIn
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Cover Letter */}
                      {app.coverLetter && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <p className="text-xs text-slate-500 mb-1">Cover Letter:</p>
                          <p className="text-sm text-slate-300 line-clamp-3">{app.coverLetter}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resume Preview Modal */}
      {showResumeModal && selectedResume && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-gradient-to-br from-[#1a2942] to-[#0f1d35] border border-white/20 rounded-2xl w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-white/20">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedResume.fullName}'s Resume</h3>
                <p className="text-slate-400 text-sm">{selectedResume.email}</p>
              </div>
              <div className="flex gap-2">
                <a
                  href={selectedResume.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
                >
                  <Download size={16} />
                  Download
                </a>
                <button 
                  onClick={() => setShowResumeModal(false)} 
                  className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-900">
              {selectedResume.resumeUrl?.endsWith('.pdf') ? (
                <iframe
                  src={selectedResume.resumeUrl}
                  className="w-full h-full"
                  title="Resume Preview"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <FileText className="w-16 h-16 mb-4" />
                  <p className="text-lg mb-4">Preview not available for this file type</p>
                  <a
                    href={selectedResume.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
                  >
                    <ExternalLink size={18} />
                    Open in New Tab
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { jobsApi } from '../../api/endpoints.js';
import { supabase } from '../../config/supabase.js';
import { toast } from 'react-toastify';
import { 
  FileText, Download, ExternalLink, Star, CheckCircle, XCircle, Clock, Loader2, 
  RefreshCw, Briefcase, Search, Filter, Users, Eye, Wifi, WifiOff, X, ChevronDown, Mail, Phone, MapPin, AlertTriangle
} from 'lucide-react';
import { formatUSDate } from '../../utils/dateUtils.js';

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

export const JobApplications = () => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    fetchData();
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
      .channel('admin-applications-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'job_applications' },
        (payload) => {
          console.log('🔄 Application changed:', payload.eventType);
          
          if (payload.eventType === 'INSERT') {
            fetchApplications();
            toast.success('New application received!');
          } else if (payload.eventType === 'UPDATE') {
            fetchApplications();
          } else if (payload.eventType === 'DELETE') {
            fetchApplications();
          }
        }
      )
      .subscribe((status) => {
        setRealtimeConnected(status === 'SUBSCRIBED');
      });

    subscriptionRef.current = channel;
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchApplications(), fetchJobs()]);
    setLoading(false);
  };

  // Transform application from backend
  const transformApplication = (app) => ({
    _id: app._id || app.id,
    id: app._id || app.id,
    jobId: app.jobId || app.job_id,
    fullName: app.fullName || app.full_name,
    email: app.email,
    phone: app.phone,
    currentLocation: app.currentLocation || app.current_location,
    experience: app.experience,
    currentCompany: app.currentCompany || app.current_company,
    currentRole: app.currentRole || app.current_role_name,
    noticePeriod: app.noticePeriod || app.notice_period,
    expectedSalary: app.expectedSalary || app.expected_salary,
    resumeUrl: app.resumeUrl || app.resume_url,
    coverLetter: app.coverLetter || app.cover_letter,
    linkedinUrl: app.linkedinUrl || app.linkedin_url,
    portfolioUrl: app.portfolioUrl || app.portfolio_url,
    status: app.status,
    appliedDate: app.appliedDate || app.applied_date,
    jobTitle: app.jobTitle || app.job_postings?.title,
    jobDepartment: app.jobDepartment || app.job_postings?.department,
    jobLocation: app.jobLocation || app.job_postings?.location
  });

  const fetchApplications = async () => {
    try {
      const response = await jobsApi.getAllApplications();
      const transformedApps = (response.data.data || []).map(transformApplication);
      setApplications(transformedApps);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast.error('Failed to fetch applications');
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await jobsApi.getAllAdmin();
      setJobs(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch jobs');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Data refreshed!');
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await jobsApi.updateApplicationStatus(applicationId, newStatus);
      toast.success('Application status updated');
      fetchApplications();
    } catch (error) {
      toast.error('Failed to update application status');
    }
  };

  const viewResume = (app) => {
    setSelectedResume(app);
    setShowResumeModal(true);
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesJob = jobFilter === 'all' || app.jobId === jobFilter;
    return matchesSearch && matchesStatus && matchesJob;
  });

  // Group by job for better overview
  const groupedByJob = filteredApplications.reduce((acc, app) => {
    const jobKey = app.jobTitle || 'Unknown Job';
    if (!acc[jobKey]) {
      acc[jobKey] = [];
    }
    acc[jobKey].push(app);
    return acc;
  }, {});

  // Calculate days until resume deletion (45 days from applied date)
  const getDaysUntilDeletion = (appliedDate) => {
    if (!appliedDate) return null;
    const applied = new Date(appliedDate);
    const deletionDate = new Date(applied);
    deletionDate.setDate(deletionDate.getDate() + 45);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deletionDate.setHours(0, 0, 0, 0);
    const diffTime = deletionDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Stats
  const stats = {
    total: applications.length,
    new: applications.filter(a => a.status === 'new').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    interviewed: applications.filter(a => a.status === 'interviewed').length,
    offered: applications.filter(a => a.status === 'offered').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-slate-400 mt-4">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Job Applications</h1>
            <div className="flex items-center gap-3">
              <p className="text-slate-300">All applications across all job postings</p>
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
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
            <p className="text-slate-400 text-xs mb-1">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-400 text-xs mb-1">New</p>
            <p className="text-2xl font-bold text-blue-400">{stats.new}</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-yellow-400 text-xs mb-1">Reviewing</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.reviewing}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <p className="text-green-400 text-xs mb-1">Shortlisted</p>
            <p className="text-2xl font-bold text-green-400">{stats.shortlisted}</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-purple-400 text-xs mb-1">Interviewed</p>
            <p className="text-2xl font-bold text-purple-400">{stats.interviewed}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-emerald-400 text-xs mb-1">Offered</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.offered}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-xs mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-800">All Status</option>
                  <option value="new" className="bg-slate-800">New</option>
                  <option value="reviewing" className="bg-slate-800">Reviewing</option>
                  <option value="shortlisted" className="bg-slate-800">Shortlisted</option>
                  <option value="interviewed" className="bg-slate-800">Interviewed</option>
                  <option value="offered" className="bg-slate-800">Offered</option>
                  <option value="rejected" className="bg-slate-800">Rejected</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={18} className="text-slate-400" />
                <select
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                  className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-800">All Jobs</option>
                  {jobs.map(job => (
                    <option key={job._id || job.id} value={job._id || job.id} className="bg-slate-800">
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-slate-400">
            Showing {filteredApplications.length} of {applications.length} applications
          </p>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-xl text-white mb-2">No applications found</p>
            <p className="text-slate-400">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByJob).map(([jobTitle, apps]) => (
              <div key={jobTitle} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {/* Job Header */}
                <div className="bg-white/5 border-b border-white/10 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">{jobTitle}</h3>
                      <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                        {apps.length} applicant{apps.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {apps[0]?.jobLocation && (
                      <span className="text-slate-400 text-sm flex items-center gap-1">
                        <MapPin size={14} />
                        {apps[0].jobLocation}
                      </span>
                    )}
                  </div>
                </div>

                {/* Applications */}
                <div className="divide-y divide-white/10">
                  {apps.map((app) => {
                    const StatusIcon = statusIcons[app.status] || Clock;
                    return (
                      <div 
                        key={app._id} 
                        className="p-6 hover:bg-white/5 transition-all"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                          {/* Applicant Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <h4 className="text-lg font-bold text-white">{app.fullName}</h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${statusColors[app.status]}`}>
                                <StatusIcon size={12} />
                                {app.status?.charAt(0).toUpperCase() + app.status?.slice(1)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm mb-3">
                              <div className="flex items-center gap-2 text-slate-300">
                                <Mail size={14} className="text-slate-500" />
                                <a href={`mailto:${app.email}`} className="text-blue-400 hover:underline truncate">
                                  {app.email}
                                </a>
                              </div>
                              <div className="flex items-center gap-2 text-slate-300">
                                <Phone size={14} className="text-slate-500" />
                                <span>{app.phone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-300">
                                <MapPin size={14} className="text-slate-500" />
                                <span>{app.currentLocation}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                              <span><strong className="text-slate-300">Experience:</strong> {app.experience}</span>
                              <span><strong className="text-slate-300">Notice:</strong> {app.noticePeriod}</span>
                              <span><strong className="text-slate-300">Applied:</strong> {formatUSDate(app.appliedDate)}</span>
                              {app.currentCompany && (
                                <span><strong className="text-slate-300">Current:</strong> {app.currentRole} at {app.currentCompany}</span>
                              )}
                            </div>
                            
                            {/* Resume Deletion Countdown */}
                            {app.resumeUrl && app.appliedDate && (() => {
                              const daysRemaining = getDaysUntilDeletion(app.appliedDate);
                              if (daysRemaining !== null && daysRemaining <= 45 && daysRemaining >= 0) {
                                const isUrgent = daysRemaining <= 7;
                                const isWarning = daysRemaining <= 14;
                                return (
                                  <div className={`mt-3 px-3 py-2 rounded-lg border text-sm flex items-center gap-2 ${
                                    isUrgent
                                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                      : isWarning
                                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                                      : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                                  }`}>
                                    <AlertTriangle size={14} />
                                    <span>
                                      <strong>Resume deletion:</strong>{' '}
                                      {daysRemaining === 0
                                        ? 'Deleting today'
                                        : daysRemaining === 1
                                        ? 'Deleting tomorrow'
                                        : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`}
                                    </span>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-3 lg:items-end">
                            <select
                              value={app.status}
                              onChange={(e) => updateApplicationStatus(app._id, e.target.value)}
                              className={`px-4 py-2 rounded-lg border text-sm font-semibold bg-white/5 ${statusColors[app.status]} min-w-[140px]`}
                            >
                              <option value="new">New</option>
                              <option value="reviewing">Reviewing</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="interviewed">Interviewed</option>
                              <option value="offered">Offered</option>
                              <option value="rejected">Rejected</option>
                              <option value="withdrawn">Withdrawn</option>
                            </select>

                            <div className="flex gap-2 flex-wrap">
                              {app.resumeUrl && (
                                <>
                                  <button
                                    onClick={() => viewResume(app)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
                                  >
                                    <FileText size={16} />
                                    Resume
                                  </button>
                                  <a
                                    href={app.resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium flex items-center gap-1 transition-all"
                                    title="Download Resume"
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
                                  title="LinkedIn Profile"
                                >
                                  <ExternalLink size={14} />
                                  LinkedIn
                                </a>
                              )}
                              {app.portfolioUrl && (
                                <a
                                  href={app.portfolioUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium flex items-center gap-1 transition-all"
                                  title="Portfolio"
                                >
                                  <ExternalLink size={14} />
                                  Portfolio
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Cover Letter */}
                        {app.coverLetter && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-xs text-slate-500 mb-1">Cover Letter:</p>
                            <p className="text-sm text-slate-300 line-clamp-2">{app.coverLetter}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resume Preview Modal */}
      {showResumeModal && selectedResume && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-gradient-to-br from-[#1a2942] to-[#0f1d35] border border-white/20 rounded-2xl w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-white/20">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedResume.fullName}'s Resume</h3>
                <p className="text-slate-400 text-sm">{selectedResume.email} • Applied for: {selectedResume.jobTitle}</p>
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
              {selectedResume.resumeUrl?.toLowerCase().endsWith('.pdf') ? (
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


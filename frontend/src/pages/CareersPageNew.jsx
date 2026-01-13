import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, MapPin, Clock, Award, X, Upload, FileText, CheckCircle, Loader2, Wifi, WifiOff } from 'lucide-react';
import { jobsApi } from '../api/endpoints.js';
import { supabase } from '../config/supabase.js';
import { toast } from 'react-toastify';

export const CareersPageNew = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const subscriptionRef = useRef(null);

  // Application form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentLocation: '',
    experience: '',
    currentCompany: '',
    currentRole: '',
    noticePeriod: '',
    expectedSalary: '',
    resumeUrl: '',
    resumeFileName: '',
    coverLetter: '',
    linkedinUrl: '',
    portfolioUrl: ''
  });

  useEffect(() => {
    fetchJobs();
    setupRealtimeSubscription();

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobsApi.getAll();
      setJobs(response.data.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscription for jobs
  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('careers-jobs-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'job_postings' },
        (payload) => {
          console.log('🔄 Job posting changed:', payload.eventType);
          
          if (payload.eventType === 'INSERT' && payload.new.is_active) {
            // Add new active job
            setJobs(prev => [transformJob(payload.new), ...prev]);
            toast.info(`New job posted: ${payload.new.title}`);
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.is_active) {
              // Update existing job or add if not present
              setJobs(prev => {
                const exists = prev.find(j => j._id === payload.new.id);
                if (exists) {
                  return prev.map(j => j._id === payload.new.id ? transformJob(payload.new) : j);
                } else {
                  return [transformJob(payload.new), ...prev];
                }
              });
            } else {
              // Remove deactivated job
              setJobs(prev => prev.filter(j => j._id !== payload.new.id));
            }
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted job
            setJobs(prev => prev.filter(j => j._id !== payload.old.id));
            toast.info('A job posting has been removed');
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
    isActive: job.is_active,
    postedDate: job.posted_date
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle resume file upload
  const handleResumeUpload = async (file) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadingResume(true);
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      setFormData(prev => ({
        ...prev,
        resumeUrl: publicUrl,
        resumeFileName: file.name
      }));

      toast.success('Resume uploaded successfully!');
    } catch (error) {
      console.error('Resume upload error:', error);
      toast.error('Failed to upload resume. Please try again.');
    } finally {
      setUploadingResume(false);
    }
  };

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
    setApplicationSuccess(false);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      currentLocation: '',
      experience: '',
      currentCompany: '',
      currentRole: '',
      noticePeriod: '',
      expectedSalary: '',
      resumeUrl: '',
      resumeFileName: '',
      coverLetter: '',
      linkedinUrl: '',
      portfolioUrl: ''
    });
  };

  const closeApplyModal = () => {
    setShowApplyModal(false);
    setSelectedJob(null);
    setApplicationSuccess(false);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();

    if (!formData.resumeUrl) {
      toast.error('Please upload your resume');
      return;
    }

    setSubmitting(true);
    try {
      await jobsApi.apply(selectedJob._id, formData);
      setApplicationSuccess(true);
      toast.success('Application submitted successfully!');
      
      // Reset form after 3 seconds and close modal
      setTimeout(() => {
        closeApplyModal();
      }, 3000);
    } catch (error) {
      console.error('Application submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-blue-500/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Career</span>
            </div>
            {/* Realtime indicator */}
            <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
              realtimeConnected 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {realtimeConnected ? (
                <>
                  <Wifi size={12} />
                  <span>Live Updates</span>
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

          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white">
            Career
          </h1>
        </div>
      </section>

      {/* Career Content Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-400">
                Build Your Career
              </h2>
              
              <p className="text-xl md:text-2xl text-white font-semibold mb-8">
                We are always on the lookout for Amazing people to join us!
              </p>
              
              <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
                <p>
                  We consider our employees as our most valuable assets. Therefore, we provide a work-life balance and ample growth opportunities to those who join our organisation.
                </p>
                
                <p>
                  If you are devoted to your profession and willing to be honest, diligent, and discreet, then you are the candidate we seek. Resumes should be sent to{' '}
                  <a 
                    href="mailto:hr@unisysinfotech.com" 
                    className="text-blue-400 hover:text-blue-300 underline transition-colors duration-300"
                  >
                    hr@unisysinfotech.com
                  </a>
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-blue-500/30 shadow-2xl shadow-blue-500/20">
                <img 
                  src="/unisysinfotechcontact.png" 
                  alt="UNISYS INFOTECH Contact"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section id="positions" className="py-20 px-4 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Open Positions
            </h2>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto">
              Explore our current job openings and find the perfect role for you
            </p>
            <p className="text-sm text-slate-500 mt-2">
              {jobs.length} position{jobs.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
              <p className="text-slate-400 mt-4">Loading job openings...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No open positions at the moment. Please check back later!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {jobs.map((job) => (
                <div
                  key={job._id || job.id}
                  className="p-8 rounded-2xl bg-gradient-to-br from-[#1a2942]/50 to-[#0f1d35]/50 border border-blue-900/30 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.01] group"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {job.type}
                        </span>
                        {(job.experience || job.yearsOfExperience) && (
                          <span className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            {job.yearsOfExperience ? `${job.yearsOfExperience}+ years` : job.experience}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => openApplyModal(job)}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap hover:scale-105 shadow-lg"
                    >
                      Apply Now
                    </button>
                  </div>
                  <p className="text-slate-300 mb-4">{job.description}</p>
                  
                  {/* Skills tags */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.skills.slice(0, 6).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 6 && (
                        <span className="px-3 py-1 rounded-full text-xs text-slate-400">
                          +{job.skills.length - 6} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-blue-600/20 to-blue-500/10 border border-blue-500/30">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Don't See a Perfect Fit?
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              We're always interested in meeting talented people. Send us your resume and let's talk about future opportunities.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-300"
            >
              Get in Touch
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Application Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-[#1a2942] to-[#0f1d35] border border-white/20 rounded-2xl p-6 md:p-8 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            {applicationSuccess ? (
              // Success State
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Application Submitted!</h2>
                <p className="text-slate-300 mb-2">
                  Thank you for applying to <span className="text-blue-400 font-semibold">{selectedJob.title}</span>
                </p>
                <p className="text-slate-400 text-sm">
                  We'll review your application and get back to you soon.
                </p>
              </div>
            ) : (
              // Application Form
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Apply for Position</h2>
                    <p className="text-blue-400 font-medium mt-1">{selectedJob.title}</p>
                    <p className="text-slate-400 text-sm">{selectedJob.department} • {selectedJob.location}</p>
                  </div>
                  <button 
                    onClick={closeApplyModal}
                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmitApplication} className="space-y-5">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1.5">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1.5">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="+1 234 567 8900"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1.5">Current Location *</label>
                      <input
                        type="text"
                        name="currentLocation"
                        value={formData.currentLocation}
                        onChange={handleInputChange}
                        required
                        placeholder="City, Country"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1.5">Total Experience *</label>
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-slate-800">Select Experience</option>
                        <option value="Fresher" className="bg-slate-800">Fresher</option>
                        <option value="0-1 years" className="bg-slate-800">0-1 years</option>
                        <option value="1-3 years" className="bg-slate-800">1-3 years</option>
                        <option value="3-5 years" className="bg-slate-800">3-5 years</option>
                        <option value="5-7 years" className="bg-slate-800">5-7 years</option>
                        <option value="7-10 years" className="bg-slate-800">7-10 years</option>
                        <option value="10+ years" className="bg-slate-800">10+ years</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1.5">Notice Period *</label>
                      <select
                        name="noticePeriod"
                        value={formData.noticePeriod}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-slate-800">Select Notice Period</option>
                        <option value="Immediate" className="bg-slate-800">Immediate</option>
                        <option value="15 days" className="bg-slate-800">15 days</option>
                        <option value="30 days" className="bg-slate-800">30 days</option>
                        <option value="60 days" className="bg-slate-800">60 days</option>
                        <option value="90 days" className="bg-slate-800">90 days</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1.5">Current Company</label>
                      <input
                        type="text"
                        name="currentCompany"
                        value={formData.currentCompany}
                        onChange={handleInputChange}
                        placeholder="Company Name"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1.5">Current Role</label>
                      <input
                        type="text"
                        name="currentRole"
                        value={formData.currentRole}
                        onChange={handleInputChange}
                        placeholder="Job Title"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Expected Salary */}
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1.5">Expected Salary (Optional)</label>
                    <input
                      type="text"
                      name="expectedSalary"
                      value={formData.expectedSalary}
                      onChange={handleInputChange}
                      placeholder="e.g., $80,000 - $100,000"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  {/* Resume Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1.5">Resume / CV *</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                        formData.resumeUrl
                          ? 'border-green-500/50 bg-green-500/10'
                          : 'border-white/20 hover:border-blue-500/50 hover:bg-white/5'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleResumeUpload(e.target.files[0])}
                        className="hidden"
                      />
                      
                      {uploadingResume ? (
                        <div className="flex items-center justify-center gap-3">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                          <span className="text-slate-300">Uploading...</span>
                        </div>
                      ) : formData.resumeUrl ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileText className="w-6 h-6 text-green-400" />
                          <span className="text-green-400 font-medium">{formData.resumeFileName}</span>
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                          <p className="text-slate-300">Click to upload or drag and drop</p>
                          <p className="text-slate-500 text-sm">PDF, DOC, DOCX (Max 5MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1.5">LinkedIn Profile</label>
                      <input
                        type="url"
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1.5">Portfolio / GitHub</label>
                      <input
                        type="url"
                        name="portfolioUrl"
                        value={formData.portfolioUrl}
                        onChange={handleInputChange}
                        placeholder="https://..."
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1.5">Cover Letter (Optional)</label>
                    <textarea
                      name="coverLetter"
                      value={formData.coverLetter}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Tell us why you're interested in this role..."
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={submitting || !formData.resumeUrl}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Application
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={closeApplyModal}
                      className="px-6 py-3.5 rounded-xl font-semibold bg-white/10 hover:bg-white/20 text-white transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

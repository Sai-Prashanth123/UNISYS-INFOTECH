import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../store/index.js';
import { MapPin, Briefcase, Users, Award, Zap, X } from 'lucide-react';
import { jobsApi } from '../api/endpoints.js';
import { toast } from 'react-toastify';

export const CareersPage = () => {
  const isDark = useThemeStore((state) => state.isDark);
  
  // Sample job openings
  const sampleJobs = [
    {
      _id: '1',
      title: 'Senior Full Stack Developer',
      location: 'Remote',
      type: 'Full-time',
      department: 'Engineering',
      experience: '5+ years',
      description: 'We are seeking an experienced Full Stack Developer to join our engineering team. You will be responsible for building scalable web applications using modern technologies.',
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
      salary: '$120,000 - $160,000'
    },
    {
      _id: '2',
      title: 'DevOps Engineer',
      location: 'Remote',
      type: 'Full-time',
      department: 'Engineering',
      experience: '4+ years',
      description: 'Join our DevOps team to design, implement, and maintain cloud infrastructure. You will work on automating deployment pipelines and ensuring system reliability.',
      skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Python', 'Terraform'],
      salary: '$110,000 - $150,000'
    },
    {
      _id: '3',
      title: 'Data Scientist',
      location: 'Remote / Hybrid',
      type: 'Full-time',
      department: 'Data Science',
      experience: '3+ years',
      description: 'We are looking for a Data Scientist to analyze complex datasets and build machine learning models that drive business insights and decision-making.',
      skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Pandas', 'Data Visualization'],
      salary: '$100,000 - $140,000'
    },
    {
      _id: '4',
      title: 'UI/UX Designer',
      location: 'Remote',
      type: 'Full-time',
      department: 'Design',
      experience: '3+ years',
      description: 'Create exceptional user experiences and beautiful interfaces for our products. Collaborate with developers and product managers to bring designs to life.',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'User Research', 'Prototyping', 'Design Systems'],
      salary: '$90,000 - $120,000'
    },
    {
      _id: '5',
      title: 'Cloud Solutions Architect',
      location: 'Remote',
      type: 'Full-time',
      department: 'Engineering',
      experience: '6+ years',
      description: 'Design and implement enterprise-grade cloud solutions for our clients. Lead technical discussions and provide architectural guidance for cloud migrations.',
      skills: ['AWS', 'Azure', 'GCP', 'Solution Architecture', 'Microservices', 'Security'],
      salary: '$130,000 - $170,000'
    },
    {
      _id: '6',
      title: 'QA Automation Engineer',
      location: 'Remote',
      type: 'Full-time',
      department: 'Quality Assurance',
      experience: '3+ years',
      description: 'Develop and maintain automated testing frameworks to ensure software quality. Work closely with development teams to implement test automation strategies.',
      skills: ['Selenium', 'Jest', 'Cypress', 'API Testing', 'CI/CD', 'JavaScript'],
      salary: '$85,000 - $115,000'
    }
  ];

  const [jobs, setJobs] = useState(sampleJobs);
  const [loading, setLoading] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [applicationData, setApplicationData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentLocation: '',
    experience: '',
    currentCompany: '',
    currentRole: '',
    noticePeriod: '',
    expectedSalary: '',
    linkedinUrl: '',
    portfolioUrl: '',
    coverLetter: ''
  });

  const [resumeData, setResumeData] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedinUrl: '',
    message: '',
    resume: null
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobsApi.getAll();
      if (response.data.data && response.data.data.length > 0) {
        setJobs(response.data.data);
      }
      // If API fails or returns empty, sampleJobs will be used
    } catch (error) {
      // Keep sample jobs on error
      console.log('Using sample jobs data');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await jobsApi.apply(selectedJob._id, applicationData);
      toast.success('Application submitted successfully! We will contact you soon.');
      setShowApplicationModal(false);
      setApplicationData({
        fullName: '',
        email: '',
        phone: '',
        currentLocation: '',
        experience: '',
        currentCompany: '',
        currentRole: '',
        noticePeriod: '',
        expectedSalary: '',
        linkedinUrl: '',
        portfolioUrl: '',
        coverLetter: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowApplicationModal(false);
    setSelectedJob(null);
  };

  const handleResumeInputChange = (e) => {
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResumeFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeData(prev => ({
        ...prev,
        resume: file
      }));
    }
  };

  const handleResumeSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('fullName', resumeData.fullName);
      formData.append('email', resumeData.email);
      formData.append('phone', resumeData.phone);
      formData.append('linkedinUrl', resumeData.linkedinUrl);
      formData.append('message', resumeData.message);
      if (resumeData.resume) {
        formData.append('resume', resumeData.resume);
      }

      // Send to general application endpoint
      await jobsApi.apply('general', formData);
      toast.success('Resume submitted successfully! We will review it and contact you for suitable opportunities.');
      setShowResumeModal(false);
      setResumeData({
        fullName: '',
        email: '',
        phone: '',
        linkedinUrl: '',
        message: '',
        resume: null
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit resume');
    } finally {
      setSubmitting(false);
    }
  };

  const closeResumeModal = () => {
    setShowResumeModal(false);
  };

  return (
    <div className={isDark ? 'bg-slate-900 text-white' : 'bg-slate-50'}>
      {/* Hero Section with Background Image */}
      <section 
        className="relative py-24 px-4 min-h-[500px] flex items-center animate-fade-in"
        style={{
          backgroundImage: 'url("/unysisinfotechcareers.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark overlay for text readability */}
        <div className={`absolute inset-0 ${isDark ? 'bg-slate-900/85' : 'bg-slate-900/80'}`} />
        
        {/* Content */}
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-slide-up text-white">
            Career
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 animate-fade-in max-w-3xl mx-auto">
            Join our team and build innovative solutions that make a difference
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className={`py-20 px-4 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-4xl md:text-5xl font-bold mb-8 animate-fade-in ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Build Your Career
          </h2>
          <p className={`text-xl mb-6 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            We are always on the lookout for Amazing people to join us!
          </p>
          <p className={`text-lg mb-6 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            We consider our employees as our most valuable assets. Therefore, we provide a work-life balance and ample growth opportunities to those who join our organisation.
          </p>
          <p className={`text-lg mb-8 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            If you are devoted to your profession and willing to be honest, diligent, and discreet, then you are the candidate we seek.
          </p>
          <p className={`text-lg mb-8 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            Resumes should be sent to{' '}
            <a 
              href="mailto:hr@unisysinfotech.com" 
              className="text-indigo-600 hover:text-indigo-500 font-semibold underline"
            >
              hr@unisysinfotech.com
            </a>
          </p>
        </div>
      </section>

      {/* Job Listings */}
      <section className={`py-20 px-4 ${isDark ? 'bg-gradient-to-b from-slate-900 to-slate-800' : 'bg-slate-50'}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className={`text-4xl font-bold mb-12 text-center animate-fade-in ${isDark ? 'text-white' : 'text-slate-900'}`}>Open Positions</h2>
          
          {loading ? (
            <div className={`text-center py-12 ${isDark ? 'text-white' : 'text-slate-700'}`}>
              Loading job postings...
            </div>
          ) : jobs.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-white' : 'text-slate-700'}`}>
              No open positions at the moment. Please check back later.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job, idx) => (
                <div key={job._id} className={`${isDark ? 'glass-effect-dark' : 'glass-effect'} p-6 rounded-2xl animate-slide-up backdrop-blur-2xl flex flex-col`} style={{animationDelay: `${idx * 0.05}s`}}>
                  <div className="mb-4">
                    <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{job.title}</h3>
                    <div className="flex flex-col gap-2 text-sm">
                      <span className={`flex items-center gap-1 ${isDark ? 'text-white' : 'text-slate-700'}`}>
                        <MapPin size={14} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
                        {job.location}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <span className={`${isDark ? 'bg-indigo-600/30 text-white' : 'bg-indigo-600/20 text-indigo-700'} px-2 py-1 rounded text-xs font-semibold`}>
                          {job.type}
                        </span>
                        <span className={`${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'} px-2 py-1 rounded text-xs font-semibold`}>{job.department}</span>
                      </div>
                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Experience: {job.experience}</span>
                    </div>
                  </div>

                  <p className={`mb-4 text-sm flex-grow ${isDark ? 'text-slate-300' : 'text-slate-600'} line-clamp-3`}>
                    {job.description}
                  </p>

                  <div className="mb-4">
                    <p className={`font-semibold mb-2 text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>Required Skills:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 4).map((skill, sidx) => (
                        <span key={sidx} className={`${isDark ? 'bg-slate-700 text-white border border-slate-600' : 'bg-slate-200 text-slate-700 border border-slate-300'} px-2 py-0.5 rounded-full text-xs font-medium`}>
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 4 && (
                        <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'} px-2 py-0.5 text-xs`}>
                          +{job.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {job.salary && (
                    <div className={`mb-4 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <strong>Salary:</strong> {job.salary}
                    </div>
                  )}

                  <button 
                    onClick={() => handleApply(job)}
                    className="mt-auto w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm">
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className={`py-20 px-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'} animate-fade-in`}>
        <div className="max-w-6xl mx-auto text-center">
          <h2 className={`text-4xl font-bold mb-6 animate-slide-up ${isDark ? 'text-white' : 'text-slate-900'}`}>Don't see the right position?</h2>
          <p className={`text-xl mb-8 animate-slide-up ${isDark ? 'text-slate-300' : 'text-slate-600'}`} style={{animationDelay: '0.1s'}}>Send us your resume for future opportunities</p>
          <button 
            onClick={() => setShowResumeModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
            Send Your Resume
          </button>
        </div>
      </section>

      {/* Application Modal */}
      {showApplicationModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Apply for {selectedJob.title}</h2>
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {selectedJob.department} • {selectedJob.location}
                </p>
              </div>
              <button onClick={closeModal} className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={applicationData.fullName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    } focus:outline-none focus:border-indigo-600`}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={applicationData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    } focus:outline-none focus:border-indigo-600`}
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={applicationData.phone}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    } focus:outline-none focus:border-indigo-600`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Current Location *</label>
                  <input
                    type="text"
                    name="currentLocation"
                    value={applicationData.currentLocation}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    } focus:outline-none focus:border-indigo-600`}
                    placeholder="City, State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Total Experience *</label>
                  <input
                    type="text"
                    name="experience"
                    value={applicationData.experience}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    } focus:outline-none focus:border-indigo-600`}
                    placeholder="e.g., 5 years"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notice Period *</label>
                  <input
                    type="text"
                    name="noticePeriod"
                    value={applicationData.noticePeriod}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    } focus:outline-none focus:border-indigo-600`}
                    placeholder="e.g., 2 weeks, Immediate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Current Company</label>
                  <input
                    type="text"
                    name="currentCompany"
                    value={applicationData.currentCompany}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    } focus:outline-none focus:border-indigo-600`}
                    placeholder="Company Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Current Role</label>
                  <input
                    type="text"
                    name="currentRole"
                    value={applicationData.currentRole}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    } focus:outline-none focus:border-indigo-600`}
                    placeholder="Your Current Position"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Expected Salary</label>
                  <input
                    type="text"
                    name="expectedSalary"
                    value={applicationData.expectedSalary}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    } focus:outline-none focus:border-indigo-600`}
                    placeholder="$XX,XXX - $XX,XXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">LinkedIn Profile</label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={applicationData.linkedinUrl}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    } focus:outline-none focus:border-indigo-600`}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Portfolio/Website</label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={applicationData.portfolioUrl}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    } focus:outline-none focus:border-indigo-600`}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cover Letter / Additional Information</label>
                <textarea
                  name="coverLetter"
                  value={applicationData.coverLetter}
                  onChange={handleInputChange}
                  rows="4"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-slate-300'
                  } focus:outline-none focus:border-indigo-600`}
                  placeholder="Tell us why you're a great fit for this role..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className={`px-6 py-3 rounded-lg font-semibold ${
                    isDark 
                      ? 'bg-slate-700 hover:bg-slate-600' 
                      : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resume Submission Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="sticky top-0 bg-inherit p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Submit Your Resume</h2>
              <button
                onClick={closeResumeModal}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleResumeSubmit} className="p-6 space-y-6">
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Don't see a position that matches your skills? Submit your resume and we'll keep you in mind for future opportunities.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={resumeData.fullName}
                    onChange={handleResumeInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    } focus:outline-none focus:border-indigo-600`}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={resumeData.email}
                    onChange={handleResumeInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    } focus:outline-none focus:border-indigo-600`}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={resumeData.phone}
                    onChange={handleResumeInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    } focus:outline-none focus:border-indigo-600`}
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">LinkedIn Profile</label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={resumeData.linkedinUrl}
                    onChange={handleResumeInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    } focus:outline-none focus:border-indigo-600`}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Upload Resume *</label>
                  <input
                    type="file"
                    onChange={handleResumeFileChange}
                    accept=".pdf,.doc,.docx"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    } focus:outline-none focus:border-indigo-600`}
                    required
                  />
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    Accepted formats: PDF, DOC, DOCX (Max 5MB)
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Message (Optional)</label>
                  <textarea
                    name="message"
                    value={resumeData.message}
                    onChange={handleResumeInputChange}
                    rows="4"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    } focus:outline-none focus:border-indigo-600`}
                    placeholder="Tell us about your experience and what kind of opportunities you're interested in..."
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  {submitting ? 'Submitting...' : 'Submit Resume'}
                </button>
                <button
                  type="button"
                  onClick={closeResumeModal}
                  className={`px-6 py-3 rounded-lg font-semibold ${
                    isDark 
                      ? 'bg-slate-700 hover:bg-slate-600' 
                      : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

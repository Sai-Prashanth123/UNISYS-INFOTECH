import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: [true, 'Job ID is required']
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  currentLocation: {
    type: String,
    required: [true, 'Current location is required'],
    trim: true
  },
  experience: {
    type: String,
    required: [true, 'Experience is required'],
    trim: true
  },
  currentCompany: {
    type: String,
    trim: true
  },
  currentRole: {
    type: String,
    trim: true
  },
  noticePeriod: {
    type: String,
    required: [true, 'Notice period is required'],
    trim: true
  },
  expectedSalary: {
    type: String,
    trim: true
  },
  resumeUrl: {
    type: String,
    trim: true
  },
  coverLetter: {
    type: String,
    trim: true
  },
  linkedinUrl: {
    type: String,
    trim: true
  },
  portfolioUrl: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'rejected', 'withdrawn'],
    default: 'new'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
jobApplicationSchema.index({ jobId: 1, appliedDate: -1 });
jobApplicationSchema.index({ email: 1 });
jobApplicationSchema.index({ status: 1 });

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

export default JobApplication;

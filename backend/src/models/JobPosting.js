import mongoose from 'mongoose';

// Auto-generate job code
const generateJobCode = () => {
  const prefix = 'JOB';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

const jobPostingSchema = new mongoose.Schema({
  jobCode: {
    type: String,
    unique: true,
    default: generateJobCode,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Job type is required'],
    enum: ['Full-time', 'Part-time', 'Internship'],
    default: 'Full-time'
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  responsibilities: [{
    type: String,
    required: true
  }],
  expectedSkills: [{
    type: String,
    required: true
  }],
  qualifications: [{
    type: String,
    required: true
  }],
  technicalStack: [{
    type: String,
    required: true
  }],
  skills: [{
    type: String,
    required: true
  }],
  yearsOfExperience: {
    type: Number,
    required: function() {
      return this.type !== 'Internship';
    },
    min: 0
  },
  experience: {
    type: String,
    trim: true
  },
  salary: {
    type: String,
    trim: true
  },
  additionalInfo: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  predictedFeedback: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
jobPostingSchema.index({ isActive: 1, displayOrder: 1 });
jobPostingSchema.index({ department: 1 });
jobPostingSchema.index({ location: 1 });

const JobPosting = mongoose.model('JobPosting', jobPostingSchema);

export default JobPosting;

import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
  },
  workEmail: {
    type: String,
    required: [true, 'Work email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  employees: {
    type: String,
    required: [true, 'Number of employees is required'],
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  country: {
    type: String,
    required: [true, 'Country/Region is required'],
    default: 'India',
    trim: true,
  },
  productInterest: {
    type: String,
    required: [true, 'Product interest is required'],
    enum: [
      'Software Development',
      'Cloud Services',
      'DevOps',
      'Data Science & AI',
      'Database Administration',
      'Quality Assurance',
      'CRM Solutions',
      'Business Intelligence',
      'Professional Services',
      'Other',
    ],
  },
  questionsComments: {
    type: String,
    trim: true,
    maxlength: [2000, 'Questions/Comments cannot exceed 2000 characters'],
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'converted', 'closed'],
    default: 'new',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
contactSchema.index({ workEmail: 1 });
contactSchema.index({ submittedAt: -1 });
contactSchema.index({ status: 1 });

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;

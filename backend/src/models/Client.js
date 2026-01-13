import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a client name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide a client email'],
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  industry: {
    type: String,
    required: [true, 'Please specify the industry']
  },
  contactPerson: {
    type: String,
    required: [true, 'Please provide contact person name']
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  technology: {
    type: String,
    default: ''
  },
  onboardingDate: {
    type: Date,
    default: null
  },
  offboardingDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for search functionality
clientSchema.index({ name: 'text', email: 'text', industry: 'text' });

export default mongoose.model('Client', clientSchema);

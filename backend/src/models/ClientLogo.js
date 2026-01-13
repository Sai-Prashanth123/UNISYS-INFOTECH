import mongoose from 'mongoose';

const clientLogoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    required: true,
    trim: true
  },
  logoUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  founded: {
    type: String,
    trim: true
  },
  headquarters: {
    type: String,
    trim: true
  },
  trustSignal: {
    type: String,
    trim: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('ClientLogo', clientLogoSchema);

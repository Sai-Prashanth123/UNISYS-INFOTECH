import mongoose from 'mongoose';

const hoursLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    default: null
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  hoursWorked: {
    type: Number,
    required: [true, 'Hours worked is required'],
    min: [0, 'Hours cannot be negative'],
    max: [24, 'Hours cannot exceed 24']
  },
  taskDescription: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['Development', 'Testing', 'Meeting', 'Documentation', 'Support', 'Other'],
    default: 'Development'
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

// Compound index to prevent duplicate entries for same user on same date
hoursLogSchema.index({ userId: 1, date: 1 }, { unique: false });

export default mongoose.model('HoursLog', hoursLogSchema);

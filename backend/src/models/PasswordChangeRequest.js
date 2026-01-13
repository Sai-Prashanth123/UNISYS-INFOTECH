import mongoose from 'mongoose';

const passwordChangeRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  newPasswordHash: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reason: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
passwordChangeRequestSchema.index({ userId: 1, status: 1 });
passwordChangeRequestSchema.index({ status: 1 });

const PasswordChangeRequest = mongoose.model('PasswordChangeRequest', passwordChangeRequestSchema);

export default PasswordChangeRequest;

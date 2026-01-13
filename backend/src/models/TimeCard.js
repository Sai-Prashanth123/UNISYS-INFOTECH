import mongoose from 'mongoose';

/**
 * TimeCard Model
 * Tracks daily working hours for employees
 * - Each entry represents hours worked on a specific date
 * - Employees can only edit their own entries
 * - Employers can view all entries for their employees
 */
const timeCardSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee ID is required']
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employer ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  hoursWorked: {
    type: Number,
    required: [true, 'Hours worked is required'],
    min: [0, 'Hours cannot be negative'],
    max: [24, 'Hours cannot exceed 24 in a day']
  },
  notes: {
    type: String,
    default: '',
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  isLocked: {
    type: Boolean,
    default: false // Admin or employer can lock past entries
  }
}, { 
  timestamps: true 
});

// Compound index to ensure one entry per employee per date
timeCardSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Index for efficient employer queries
timeCardSchema.index({ employerId: 1, date: 1 });

export default mongoose.model('TimeCard', timeCardSchema);

import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  payrollMonth: {
    type: String,
    required: true
  },
  invoiceDate: {
    type: Date,
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  invoiceAmount: {
    type: Number,
    required: true,
    min: 0
  },
  numberOfHours: {
    type: Number,
    required: true,
    min: 0
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  endClient: {
    type: String,
    trim: true
  },
  employmentType: {
    type: String,
    enum: ['W2', '1099'],
    default: 'W2'
  },
  name1099: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Received', 'Pending', 'Waiting on Client'],
    default: 'Pending'
  },
  paymentReceivedDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries (invoiceNumber already has index from unique: true)
invoiceSchema.index({ payrollMonth: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ name: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;

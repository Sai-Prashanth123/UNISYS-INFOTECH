import mongoose from 'mongoose';

const payrollDeductionSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true,
    unique: true
  },
  amount1099: {
    type: Number,
    default: 0,
    min: 0
  },
  amountW2: {
    type: Number,
    default: 0,
    min: 0
  },
  unisysTax: {
    type: Number,
    default: 0,
    min: 0
  },
  unisysCharges: {
    type: Number,
    default: 0,
    min: 0
  },
  customDeduction1Name: {
    type: String,
    default: ''
  },
  customDeduction1Amount: {
    type: Number,
    default: 0,
    min: 0
  },
  customDeduction2Name: {
    type: String,
    default: ''
  },
  customDeduction2Amount: {
    type: Number,
    default: 0,
    min: 0
  },
  customDeduction3Name: {
    type: String,
    default: ''
  },
  customDeduction3Amount: {
    type: Number,
    default: 0,
    min: 0
  },
  netPayable: {
    type: Number,
    default: 0
  },
  isOverride: {
    type: Boolean,
    default: false
  },
  overrideAmount: {
    type: Number
  }
}, {
  timestamps: true
});

// Calculate net payable before saving
payrollDeductionSchema.pre('save', async function(next) {
  if (!this.isOverride) {
    // Get the invoice amount
    const Invoice = mongoose.model('Invoice');
    const invoice = await Invoice.findById(this.invoiceId);
    
    if (invoice) {
      const totalDeductions = 
        (this.unisysTax || 0) + 
        (this.unisysCharges || 0) + 
        (this.customDeduction1Amount || 0) +
        (this.customDeduction2Amount || 0) +
        (this.customDeduction3Amount || 0);
      
      this.netPayable = invoice.invoiceAmount - totalDeductions;
    }
  } else if (this.overrideAmount !== undefined) {
    this.netPayable = this.overrideAmount;
  }
  
  next();
});

const PayrollDeduction = mongoose.model('PayrollDeduction', payrollDeductionSchema);

export default PayrollDeduction;

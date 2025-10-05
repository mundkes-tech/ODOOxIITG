/**
 * Reimbursement Batch Model
 * Manages scheduled reimbursement batches and payment data formatting
 */

const mongoose = require('mongoose');

const reimbursementBatchSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  batchNumber: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['draft', 'ready', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'draft'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  processedDate: Date,
  expenses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense'
  }],
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentData: {
    format: {
      type: String,
      enum: ['csv', 'ach', 'xml', 'json'],
      default: 'csv'
    },
    filePath: String,
    fileName: String,
    fileSize: Number,
    checksum: String
  },
  bankingDetails: {
    bankName: String,
    accountNumber: String,
    routingNumber: String,
    swiftCode: String,
    iban: String
  },
  metadata: {
    expenseCount: { type: Number, default: 0 },
    averageAmount: { type: Number, default: 0 },
    processingTime: Number,
    errorLog: [{
      message: String,
      timestamp: { type: Date, default: Date.now },
      severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] }
    }]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date
}, {
  timestamps: true
});

// Indexes
reimbursementBatchSchema.index({ company: 1, status: 1 });
reimbursementBatchSchema.index({ scheduledDate: 1 });
reimbursementBatchSchema.index({ batchNumber: 1 }, { unique: true });
reimbursementBatchSchema.index({ createdBy: 1 });

// Pre-save middleware to generate batch number
reimbursementBatchSchema.pre('save', async function(next) {
  if (this.isNew && !this.batchNumber) {
    const count = await this.constructor.countDocuments({ company: this.company });
    this.batchNumber = `RB-${this.company}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for total amount calculation
reimbursementBatchSchema.virtual('calculatedTotal').get(function() {
  return this.expenses.reduce((total, expense) => total + expense.amount, 0);
});

module.exports = mongoose.model('ReimbursementBatch', reimbursementBatchSchema);

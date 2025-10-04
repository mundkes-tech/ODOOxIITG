const mongoose = require('mongoose');

const approvalRuleSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  ruleName: {
    type: String,
    required: [true, 'Please provide a rule name'],
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['amount', 'category', 'percentage', 'hybrid'],
    default: 'amount'
  },
  conditions: {
    minAmount: {
      type: Number,
      default: 0
    },
    maxAmount: {
      type: Number,
      default: null
    },
    categories: [{
      type: String,
      enum: [
        'travel',
        'meals',
        'accommodation',
        'transportation',
        'office_supplies',
        'entertainment',
        'training',
        'communication',
        'other'
      ]
    }],
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    }
  },
  approvers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
approvalRuleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
approvalRuleSchema.index({ companyId: 1, isActive: 1 });
approvalRuleSchema.index({ type: 1, 'conditions.minAmount': 1 });

module.exports = mongoose.model('ApprovalRule', approvalRuleSchema);

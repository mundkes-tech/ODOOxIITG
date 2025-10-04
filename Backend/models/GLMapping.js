/**
 * GL Mapping Model
 * Manages General Ledger account mappings for expense categories
 */

const mongoose = require('mongoose');

const glMappingSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  integration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Integration',
    required: true
  },
  expenseCategory: {
    type: String,
    required: true
  },
  expenseSubcategory: String,
  glAccount: {
    code: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['asset', 'liability', 'equity', 'revenue', 'expense'],
      required: true
    }
  },
  mappingRules: [{
    condition: {
      type: String,
      enum: ['amount_range', 'merchant_contains', 'description_contains', 'date_range']
    },
    value: mongoose.Schema.Types.Mixed,
    operator: {
      type: String,
      enum: ['equals', 'contains', 'greater_than', 'less_than', 'between']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  usageStats: {
    totalMappings: { type: Number, default: 0 },
    lastUsed: Date,
    successRate: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes
glMappingSchema.index({ company: 1, expenseCategory: 1 });
glMappingSchema.index({ company: 1, 'glAccount.code': 1 });
glMappingSchema.index({ isActive: 1, priority: -1 });

module.exports = mongoose.model('GLMapping', glMappingSchema);

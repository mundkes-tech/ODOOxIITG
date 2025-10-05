/**
 * Currency Rate Lock Model
 * Stores locked exchange rates for expense submissions
 */

const mongoose = require('mongoose');

const currencyRateLockSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  expense: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    required: true
  },
  fromCurrency: {
    type: String,
    required: true,
    uppercase: true
  },
  toCurrency: {
    type: String,
    required: true,
    uppercase: true
  },
  exchangeRate: {
    type: Number,
    required: true
  },
  originalAmount: {
    type: Number,
    required: true
  },
  convertedAmount: {
    type: Number,
    required: true
  },
  lockedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  source: {
    type: String,
    enum: ['api', 'manual', 'scheduled'],
    default: 'api'
  },
  apiProvider: {
    type: String,
    enum: ['fixer', 'exchangerate', 'currencylayer', 'manual'],
    default: 'fixer'
  },
  metadata: {
    apiResponse: mongoose.Schema.Types.Mixed,
    requestId: String,
    providerFee: Number,
    marketRate: Number,
    spread: Number
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'used', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes
currencyRateLockSchema.index({ company: 1, expense: 1 }, { unique: true });
currencyRateLockSchema.index({ fromCurrency: 1, toCurrency: 1 });
currencyRateLockSchema.index({ lockedAt: 1 });
currencyRateLockSchema.index({ expiresAt: 1 });
currencyRateLockSchema.index({ status: 1 });

// Compound index for efficient queries
currencyRateLockSchema.index({ 
  company: 1, 
  status: 1, 
  lockedAt: -1 
});

// Pre-save middleware to set expiration
currencyRateLockSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Default expiration: 24 hours from lock time
    this.expiresAt = new Date(this.lockedAt.getTime() + 24 * 60 * 60 * 1000);
  }
  next();
});

// Method to check if rate is still valid
currencyRateLockSchema.methods.isValid = function() {
  return this.status === 'active' && new Date() < this.expiresAt;
};

// Method to mark as used
currencyRateLockSchema.methods.markAsUsed = function() {
  this.status = 'used';
  return this.save();
};

// Method to extend expiration
currencyRateLockSchema.methods.extendExpiration = function(hours = 24) {
  this.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  return this.save();
};

module.exports = mongoose.model('CurrencyRateLock', currencyRateLockSchema);

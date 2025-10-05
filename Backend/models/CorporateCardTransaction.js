/**
 * Corporate Card Transaction Model
 * Stores corporate card transactions for matching with expenses
 */

const mongoose = require('mongoose');

const corporateCardTransactionSchema = new mongoose.Schema({
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
  externalId: {
    type: String,
    required: true
  },
  cardNumber: {
    type: String,
    required: true
  },
  cardholder: {
    type: String,
    required: true
  },
  transactionDate: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  merchant: {
    name: String,
    category: String,
    location: {
      city: String,
      state: String,
      country: String
    }
  },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'matched', 'unmatched', 'disputed'],
    default: 'pending'
  },
  matchedExpense: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense'
  },
  matchConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  matchCriteria: {
    amountMatch: Boolean,
    dateMatch: Boolean,
    merchantMatch: Boolean,
    categoryMatch: Boolean
  },
  rawData: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes
corporateCardTransactionSchema.index({ company: 1, transactionDate: -1 });
corporateCardTransactionSchema.index({ externalId: 1 }, { unique: true });
corporateCardTransactionSchema.index({ status: 1 });
corporateCardTransactionSchema.index({ matchedExpense: 1 });

module.exports = mongoose.model('CorporateCardTransaction', corporateCardTransactionSchema);

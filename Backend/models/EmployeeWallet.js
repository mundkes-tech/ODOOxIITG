/**
 * Employee Wallet Model
 * Aggregates employee financial data for efficient wallet calculations
 */

const mongoose = require('mongoose');

const employeeWalletSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  financialSummary: {
    pendingApproval: {
      count: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' }
    },
    approved: {
      count: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' }
    },
    readyForPayment: {
      count: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' }
    },
    paid: {
      count: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' }
    },
    rejected: {
      count: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' }
    }
  },
  currencyBreakdown: [{
    currency: { type: String, required: true },
    amounts: {
      pendingApproval: { type: Number, default: 0 },
      approved: { type: Number, default: 0 },
      readyForPayment: { type: Number, default: 0 },
      paid: { type: Number, default: 0 },
      rejected: { type: Number, default: 0 }
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  nextScheduledUpdate: {
    type: Date,
    default: Date.now
  },
  metadata: {
    totalExpenses: { type: Number, default: 0 },
    averageExpenseAmount: { type: Number, default: 0 },
    lastExpenseDate: Date,
    firstExpenseDate: Date,
    preferredCurrency: { type: String, default: 'USD' },
    timezone: { type: String, default: 'UTC' }
  },
  notifications: {
    lowBalanceAlert: { type: Boolean, default: false },
    paymentReceivedAlert: { type: Boolean, default: true },
    batchIncludedAlert: { type: Boolean, default: true },
    currencyRateAlert: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Indexes
employeeWalletSchema.index({ employee: 1, company: 1 }, { unique: true });
employeeWalletSchema.index({ company: 1, lastUpdated: -1 });
employeeWalletSchema.index({ nextScheduledUpdate: 1 });

// Compound index for efficient aggregation queries
employeeWalletSchema.index({ 
  company: 1, 
  'financialSummary.pendingApproval.totalAmount': -1 
});

// Pre-save middleware to update lastUpdated
employeeWalletSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Method to calculate total amount due
employeeWalletSchema.methods.getTotalAmountDue = function() {
  return this.financialSummary.pendingApproval.totalAmount + 
         this.financialSummary.approved.totalAmount + 
         this.financialSummary.readyForPayment.totalAmount;
};

// Method to get currency-specific amounts
employeeWalletSchema.methods.getAmountsByCurrency = function(currency) {
  const breakdown = this.currencyBreakdown.find(cb => cb.currency === currency);
  if (!breakdown) {
    return {
      pendingApproval: 0,
      approved: 0,
      readyForPayment: 0,
      paid: 0,
      rejected: 0
    };
  }
  return breakdown.amounts;
};

// Method to update financial summary
employeeWalletSchema.methods.updateFinancialSummary = function(expenses) {
  const summary = {
    pendingApproval: { count: 0, totalAmount: 0, currency: 'USD' },
    approved: { count: 0, totalAmount: 0, currency: 'USD' },
    readyForPayment: { count: 0, totalAmount: 0, currency: 'USD' },
    paid: { count: 0, totalAmount: 0, currency: 'USD' },
    rejected: { count: 0, totalAmount: 0, currency: 'USD' }
  };

  const currencyBreakdown = {};

  expenses.forEach(expense => {
    const status = expense.status;
    const amount = expense.amount;
    const currency = expense.currency || 'USD';

    if (summary[status]) {
      summary[status].count += 1;
      summary[status].totalAmount += amount;
    }

    if (!currencyBreakdown[currency]) {
      currencyBreakdown[currency] = {
        currency,
        amounts: {
          pendingApproval: 0,
          approved: 0,
          readyForPayment: 0,
          paid: 0,
          rejected: 0
        }
      };
    }

    if (currencyBreakdown[currency].amounts[status]) {
      currencyBreakdown[currency].amounts[status] += amount;
    }
  });

  this.financialSummary = summary;
  this.currencyBreakdown = Object.values(currencyBreakdown);
  this.metadata.totalExpenses = expenses.length;
  this.metadata.averageExpenseAmount = expenses.length > 0 
    ? expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length 
    : 0;

  return this.save();
};

module.exports = mongoose.model('EmployeeWallet', employeeWalletSchema);

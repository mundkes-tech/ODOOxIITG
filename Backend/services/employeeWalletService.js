/**
 * Employee Wallet Service
 * Efficiently calculates and aggregates employee financial data
 */

const EmployeeWallet = require('../models/EmployeeWallet');
const Expense = require('../models/Expense');
const User = require('../models/User');
const logger = require('../utils/logger');

class EmployeeWalletService {
  constructor() {
    this.updateInterval = 300000; // 5 minutes
    this.batchSize = 100;
  }

  // Get or create employee wallet
  async getEmployeeWallet(employeeId, companyId) {
    try {
      let wallet = await EmployeeWallet.findOne({
        employee: employeeId,
        company: companyId
      });

      if (!wallet) {
        wallet = await this.createEmployeeWallet(employeeId, companyId);
      }

      // Check if wallet needs update
      const now = new Date();
      if (wallet.nextScheduledUpdate <= now) {
        await this.updateWalletData(wallet);
      }

      return { success: true, wallet };
    } catch (error) {
      logger.error('Get employee wallet failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Create new employee wallet
  async createEmployeeWallet(employeeId, companyId) {
    try {
      const wallet = new EmployeeWallet({
        employee: employeeId,
        company: companyId,
        nextScheduledUpdate: new Date(Date.now() + this.updateInterval)
      });

      await wallet.save();
      await this.updateWalletData(wallet);

      logger.info(`Employee wallet created for user ${employeeId}`);
      return wallet;
    } catch (error) {
      logger.error('Create employee wallet failed:', error);
      throw error;
    }
  }

  // Update wallet data with current expenses
  async updateWalletData(wallet) {
    try {
      const expenses = await Expense.find({
        user: wallet.employee,
        company: wallet.company
      }).populate('user');

      await wallet.updateFinancialSummary(expenses);

      // Update metadata
      if (expenses.length > 0) {
        wallet.metadata.lastExpenseDate = expenses[0].createdAt;
        wallet.metadata.firstExpenseDate = expenses[expenses.length - 1].createdAt;
        wallet.metadata.preferredCurrency = this.getPreferredCurrency(expenses);
      }

      // Schedule next update
      wallet.nextScheduledUpdate = new Date(Date.now() + this.updateInterval);
      await wallet.save();

      logger.info(`Wallet data updated for employee ${wallet.employee}`);
    } catch (error) {
      logger.error('Update wallet data failed:', error);
      throw error;
    }
  }

  // Get wallet summary for employee
  async getWalletSummary(employeeId, companyId) {
    try {
      const result = await this.getEmployeeWallet(employeeId, companyId);
      
      if (!result.success) {
        return result;
      }

      const wallet = result.wallet;
      const summary = {
        totalAmountDue: wallet.getTotalAmountDue(),
        financialSummary: wallet.financialSummary,
        currencyBreakdown: wallet.currencyBreakdown,
        lastUpdated: wallet.lastUpdated,
        metadata: wallet.metadata
      };

      return { success: true, summary };
    } catch (error) {
      logger.error('Get wallet summary failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all employee wallets for company
  async getCompanyWallets(companyId, filters = {}) {
    try {
      const query = { company: companyId };
      
      if (filters.minAmountDue) {
        query['financialSummary.pendingApproval.totalAmount'] = { $gte: filters.minAmountDue };
      }

      const wallets = await EmployeeWallet.find(query)
        .populate('employee', 'name email employeeId')
        .sort({ 'financialSummary.pendingApproval.totalAmount': -1 })
        .limit(filters.limit || 50);

      return { success: true, wallets };
    } catch (error) {
      logger.error('Get company wallets failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Bulk update wallets for company
  async bulkUpdateCompanyWallets(companyId) {
    try {
      const employees = await User.find({ 
        company: companyId,
        role: { $in: ['employee', 'manager'] }
      });

      const updatePromises = employees.map(employee => 
        this.updateEmployeeWallet(employee._id, companyId)
      );

      await Promise.all(updatePromises);

      logger.info(`Bulk updated wallets for ${employees.length} employees in company ${companyId}`);
      return { success: true, updatedCount: employees.length };
    } catch (error) {
      logger.error('Bulk update company wallets failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Update specific employee wallet
  async updateEmployeeWallet(employeeId, companyId) {
    try {
      const result = await this.getEmployeeWallet(employeeId, companyId);
      
      if (result.success) {
        await this.updateWalletData(result.wallet);
        return { success: true };
      }
      
      return result;
    } catch (error) {
      logger.error('Update employee wallet failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get wallet analytics
  async getWalletAnalytics(companyId, filters = {}) {
    try {
      const pipeline = [
        { $match: { company: companyId } },
        {
          $group: {
            _id: null,
            totalEmployees: { $sum: 1 },
            totalPendingAmount: { $sum: '$financialSummary.pendingApproval.totalAmount' },
            totalApprovedAmount: { $sum: '$financialSummary.approved.totalAmount' },
            totalReadyAmount: { $sum: '$financialSummary.readyForPayment.totalAmount' },
            totalPaidAmount: { $sum: '$financialSummary.paid.totalAmount' },
            avgPendingAmount: { $avg: '$financialSummary.pendingApproval.totalAmount' },
            avgApprovedAmount: { $avg: '$financialSummary.approved.totalAmount' }
          }
        }
      ];

      const analytics = await EmployeeWallet.aggregate(pipeline);
      
      if (analytics.length === 0) {
        return { success: true, analytics: null };
      }

      return { success: true, analytics: analytics[0] };
    } catch (error) {
      logger.error('Get wallet analytics failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get currency breakdown for company
  async getCurrencyBreakdown(companyId) {
    try {
      const wallets = await EmployeeWallet.find({ company: companyId });
      
      const currencyTotals = {};
      
      wallets.forEach(wallet => {
        wallet.currencyBreakdown.forEach(breakdown => {
          const currency = breakdown.currency;
          
          if (!currencyTotals[currency]) {
            currencyTotals[currency] = {
              pendingApproval: 0,
              approved: 0,
              readyForPayment: 0,
              paid: 0,
              rejected: 0
            };
          }
          
          Object.keys(breakdown.amounts).forEach(status => {
            currencyTotals[currency][status] += breakdown.amounts[status];
          });
        });
      });

      return { success: true, currencyBreakdown: currencyTotals };
    } catch (error) {
      logger.error('Get currency breakdown failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper method to get preferred currency
  getPreferredCurrency(expenses) {
    const currencyCount = {};
    
    expenses.forEach(expense => {
      const currency = expense.currency || 'USD';
      currencyCount[currency] = (currencyCount[currency] || 0) + 1;
    });

    return Object.keys(currencyCount).reduce((a, b) => 
      currencyCount[a] > currencyCount[b] ? a : b
    );
  }

  // Schedule wallet updates
  async scheduleWalletUpdates() {
    try {
      const wallets = await EmployeeWallet.find({
        nextScheduledUpdate: { $lte: new Date() }
      });

      for (const wallet of wallets) {
        await this.updateWalletData(wallet);
      }

      logger.info(`Scheduled update completed for ${wallets.length} wallets`);
    } catch (error) {
      logger.error('Schedule wallet updates failed:', error);
    }
  }

  // Get wallet notifications
  async getWalletNotifications(employeeId, companyId) {
    try {
      const result = await this.getEmployeeWallet(employeeId, companyId);
      
      if (!result.success) {
        return result;
      }

      const wallet = result.wallet;
      const notifications = [];

      // Check for low balance alert
      if (wallet.notifications.lowBalanceAlert && wallet.getTotalAmountDue() < 100) {
        notifications.push({
          type: 'low_balance',
          message: 'Your pending reimbursement amount is below $100',
          severity: 'medium'
        });
      }

      // Check for currency rate alerts
      if (wallet.notifications.currencyRateAlert) {
        const foreignCurrencies = wallet.currencyBreakdown.filter(cb => cb.currency !== 'USD');
        if (foreignCurrencies.length > 0) {
          notifications.push({
            type: 'currency_rate',
            message: 'You have expenses in foreign currencies that may be affected by rate changes',
            severity: 'low'
          });
        }
      }

      return { success: true, notifications };
    } catch (error) {
      logger.error('Get wallet notifications failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmployeeWalletService();

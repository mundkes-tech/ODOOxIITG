/**
 * Smart Finance Controller
 * Handles Reimbursement Batches, Currency Rate Locking, and Employee Wallet operations
 */

const reimbursementBatchService = require('../services/reimbursementBatchService');
const currencyRateLockingService = require('../services/currencyRateLockingService');
const employeeWalletService = require('../services/employeeWalletService');
const realtimeService = require('../services/realtimeService');
const logger = require('../utils/logger');

// Reimbursement Batch Operations
exports.createReimbursementBatch = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { name, description, scheduledDate, expenseIds, format } = req.body;

    const result = await reimbursementBatchService.createBatch(
      companyId,
      req.user.userId,
      { name, description, scheduledDate, expenseIds, format }
    );

    if (result.success) {
      // Broadcast real-time update
      realtimeService.broadcastToCompany(companyId, 'reimbursement-batch-created', {
        batchId: result.batch._id,
        batchNumber: result.batch.batchNumber,
        expenseCount: result.batch.expenses.length
      });

      res.status(201).json({
        success: true,
        message: 'Reimbursement batch created successfully',
        data: result.batch
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to create reimbursement batch',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Create reimbursement batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getReimbursementBatches = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { status, dateRange, limit } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (dateRange) {
      const [start, end] = dateRange.split(',');
      filters.dateRange = { start, end };
    }
    if (limit) filters.limit = parseInt(limit);

    const result = await reimbursementBatchService.getBatches(companyId, filters);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: {
          batches: result.batches,
          total: result.batches.length
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to get reimbursement batches',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Get reimbursement batches error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.generatePaymentData = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { format } = req.body;

    const result = await reimbursementBatchService.generatePaymentData(batchId, format);

    if (result.success) {
      // Broadcast real-time update
      realtimeService.broadcastToCompany(req.user.companyId, 'payment-data-generated', {
        batchId,
        fileName: result.batch.paymentData.fileName,
        fileSize: result.batch.paymentData.fileSize
      });

      res.status(200).json({
        success: true,
        message: 'Payment data generated successfully',
        data: {
          batch: result.batch,
          filePath: result.filePath
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to generate payment data',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Generate payment data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Currency Rate Locking Operations
exports.lockExchangeRate = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { expenseId, fromCurrency, toCurrency, amount } = req.body;

    const result = await currencyRateLockingService.lockExchangeRate(
      companyId,
      expenseId,
      fromCurrency,
      toCurrency,
      amount
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Exchange rate locked successfully',
        data: {
          exchangeRate: result.rateLock.exchangeRate,
          convertedAmount: result.rateLock.convertedAmount,
          expiresAt: result.rateLock.expiresAt
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to lock exchange rate',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Lock exchange rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getRateLock = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const result = await currencyRateLockingService.getRateLock(expenseId);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: {
          exchangeRate: result.rateLock.exchangeRate,
          convertedAmount: result.rateLock.convertedAmount,
          fromCurrency: result.rateLock.fromCurrency,
          toCurrency: result.rateLock.toCurrency,
          lockedAt: result.rateLock.lockedAt,
          expiresAt: result.rateLock.expiresAt,
          isValid: result.rateLock.isValid()
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Rate lock not found',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Get rate lock error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.convertAmount = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { amount } = req.body;

    const result = await currencyRateLockingService.convertAmount(expenseId, amount);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Amount converted successfully',
        data: {
          originalAmount: amount,
          convertedAmount: result.convertedAmount,
          exchangeRate: result.exchangeRate
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to convert amount',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Convert amount error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Employee Wallet Operations
exports.getEmployeeWallet = async (req, res) => {
  try {
    const { companyId, userId } = req.user;

    const result = await employeeWalletService.getWalletSummary(userId, companyId);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.summary
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to get employee wallet',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Get employee wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getCompanyWallets = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { minAmountDue, limit } = req.query;

    const filters = {};
    if (minAmountDue) filters.minAmountDue = parseFloat(minAmountDue);
    if (limit) filters.limit = parseInt(limit);

    const result = await employeeWalletService.getCompanyWallets(companyId, filters);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: {
          wallets: result.wallets,
          total: result.wallets.length
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to get company wallets',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Get company wallets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.updateEmployeeWallet = async (req, res) => {
  try {
    const { companyId, userId } = req.user;

    const result = await employeeWalletService.updateEmployeeWallet(userId, companyId);

    if (result.success) {
      // Broadcast real-time update
      realtimeService.broadcastToUser(userId, 'wallet-updated', {
        userId,
        companyId
      });

      res.status(200).json({
        success: true,
        message: 'Employee wallet updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to update employee wallet',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Update employee wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getWalletAnalytics = async (req, res) => {
  try {
    const { companyId } = req.user;

    const result = await employeeWalletService.getWalletAnalytics(companyId);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.analytics
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to get wallet analytics',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Get wallet analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getCurrencyBreakdown = async (req, res) => {
  try {
    const { companyId } = req.user;

    const result = await employeeWalletService.getCurrencyBreakdown(companyId);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.currencyBreakdown
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to get currency breakdown',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Get currency breakdown error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getWalletNotifications = async (req, res) => {
  try {
    const { companyId, userId } = req.user;

    const result = await employeeWalletService.getWalletNotifications(userId, companyId);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.notifications
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to get wallet notifications',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Get wallet notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

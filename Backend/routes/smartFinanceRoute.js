/**
 * Smart Finance Routes
 * Handles Reimbursement Batches, Currency Rate Locking, and Employee Wallet endpoints
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const smartFinanceController = require('../controllers/smartFinanceController');

// Apply authentication middleware to all routes
router.use(protect);

// Reimbursement Batch Routes
router.post('/reimbursement-batches', authorize('admin'), smartFinanceController.createReimbursementBatch);
router.get('/reimbursement-batches', authorize('admin', 'manager'), smartFinanceController.getReimbursementBatches);
router.post('/reimbursement-batches/:batchId/generate-payment', authorize('admin'), smartFinanceController.generatePaymentData);

// Currency Rate Locking Routes
router.post('/currency/lock-rate', authorize('employee', 'manager', 'admin'), smartFinanceController.lockExchangeRate);
router.get('/currency/rate-lock/:expenseId', authorize('employee', 'manager', 'admin'), smartFinanceController.getRateLock);
router.post('/currency/convert/:expenseId', authorize('employee', 'manager', 'admin'), smartFinanceController.convertAmount);

// Employee Wallet Routes
router.get('/wallet', authorize('employee', 'manager', 'admin'), smartFinanceController.getEmployeeWallet);
router.get('/wallets', authorize('admin', 'manager'), smartFinanceController.getCompanyWallets);
router.put('/wallet/update', authorize('employee', 'manager', 'admin'), smartFinanceController.updateEmployeeWallet);
router.get('/wallet/analytics', authorize('admin', 'manager'), smartFinanceController.getWalletAnalytics);
router.get('/wallet/currency-breakdown', authorize('admin', 'manager'), smartFinanceController.getCurrencyBreakdown);
router.get('/wallet/notifications', authorize('employee', 'manager', 'admin'), smartFinanceController.getWalletNotifications);

module.exports = router;

/**
 * Integration Routes
 * Handles Corporate Card, Accounting System, and Travel Integration endpoints
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const integrationController = require('../controllers/integrationController');

// Apply authentication middleware to all routes
router.use(protect);

// Corporate Card Integration Routes
router.post('/corporate-card/sync', authorize('admin', 'manager'), integrationController.syncCorporateCardTransactions);
router.get('/corporate-card/matches', authorize('admin', 'manager'), integrationController.getCorporateCardMatches);
router.post('/corporate-card/match/:transactionId/:expenseId', authorize('admin', 'manager'), integrationController.matchTransactionToExpense);

// Accounting System Integration Routes
router.post('/accounting/sync-gl-accounts', authorize('admin'), integrationController.syncGLAccounts);
router.post('/accounting/gl-mappings', authorize('admin'), integrationController.createGLMapping);
router.get('/accounting/gl-mappings', authorize('admin', 'manager'), integrationController.getGLMappings);
router.post('/accounting/sync-expense/:expenseId', authorize('admin', 'manager'), integrationController.syncExpenseToAccounting);

// Travel Integration Routes
router.post('/travel/fetch-bookings', authorize('employee', 'manager', 'admin'), integrationController.fetchTravelBookings);
router.get('/travel/bookings', authorize('employee', 'manager', 'admin'), integrationController.getTravelBookings);
router.post('/travel/pre-populate/:bookingId', authorize('employee', 'manager', 'admin'), integrationController.prePopulateTravelExpenses);

// Integration Status Route
router.get('/status', authorize('admin', 'manager'), integrationController.getIntegrationStatus);

module.exports = router;

/**
 * Integration Controller
 * Handles Corporate Card, Accounting System, and Travel Integration endpoints
 */

const integrationService = require('../services/integrationService');
const realtimeService = require('../services/realtimeService');
const Integration = require('../models/Integration');
const CorporateCardTransaction = require('../models/CorporateCardTransaction');
const GLMapping = require('../models/GLMapping');
const TravelBooking = require('../models/TravelBooking');
const logger = require('../utils/logger');

// Corporate Card Integration
exports.syncCorporateCardTransactions = async (req, res) => {
  try {
    const { companyId } = req.user;
    const result = await integrationService.syncCorporateCardTransactions(companyId);

    if (result.success) {
      // Save transactions to database
      for (const transactionData of result.transactions) {
        await CorporateCardTransaction.findOneAndUpdate(
          { externalId: transactionData.id },
          {
            company: companyId,
            externalId: transactionData.id,
            cardNumber: transactionData.cardNumber,
            cardholder: transactionData.cardholder,
            transactionDate: transactionData.date,
            amount: transactionData.amount,
            currency: transactionData.currency,
            merchant: transactionData.merchant,
            description: transactionData.description,
            rawData: transactionData
          },
          { upsert: true, new: true }
        );
      }

      // Broadcast real-time update
      realtimeService.broadcastToCompany(companyId, 'corporate-card-synced', {
        transactionCount: result.transactions.length,
        matchedExpenses: result.matchedExpenses.length
      });

      res.status(200).json({
        success: true,
        message: 'Corporate card transactions synced successfully',
        data: {
          transactionCount: result.transactions.length,
          matchedExpenses: result.matchedExpenses.length,
          transactions: result.transactions.slice(0, 10) // Return first 10 for preview
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to sync corporate card transactions',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Corporate card sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getCorporateCardMatches = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { page = 1, limit = 20, status } = req.query;

    const query = { company: companyId };
    if (status) query.status = status;

    const transactions = await CorporateCardTransaction.find(query)
      .populate('matchedExpense')
      .sort({ transactionDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CorporateCardTransaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    logger.error('Get corporate card matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.matchTransactionToExpense = async (req, res) => {
  try {
    const { transactionId, expenseId } = req.params;
    const { companyId } = req.user;

    const transaction = await CorporateCardTransaction.findOne({
      _id: transactionId,
      company: companyId
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const Expense = require('../models/Expense');
    const expense = await Expense.findOne({
      _id: expenseId,
      company: companyId
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Update transaction
    transaction.matchedExpense = expenseId;
    transaction.status = 'matched';
    transaction.matchConfidence = 1.0;
    await transaction.save();

    // Update expense
    expense.corporateCardTransaction = transactionId;
    await expense.save();

    // Broadcast real-time update
    realtimeService.broadcastToCompany(companyId, 'transaction-matched', {
      transactionId,
      expenseId,
      amount: transaction.amount
    });

    res.status(200).json({
      success: true,
      message: 'Transaction matched successfully',
      data: { transaction, expense }
    });
  } catch (error) {
    logger.error('Match transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Accounting System Integration
exports.syncGLAccounts = async (req, res) => {
  try {
    const { companyId } = req.user;
    const result = await integrationService.syncGLAccounts(companyId);

    if (result.success) {
      // Broadcast real-time update
      realtimeService.broadcastToCompany(companyId, 'gl-accounts-synced', {
        accountCount: result.glAccounts.length
      });

      res.status(200).json({
        success: true,
        message: 'GL accounts synced successfully',
        data: {
          accountCount: result.glAccounts.length,
          accounts: result.glAccounts.slice(0, 20) // Return first 20 for preview
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to sync GL accounts',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('GL accounts sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.createGLMapping = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { expenseCategory, expenseSubcategory, glAccount, mappingRules } = req.body;

    const mapping = new GLMapping({
      company: companyId,
      expenseCategory,
      expenseSubcategory,
      glAccount,
      mappingRules
    });

    await mapping.save();

    // Broadcast real-time update
    realtimeService.broadcastToCompany(companyId, 'gl-mapping-created', {
      mappingId: mapping._id,
      expenseCategory,
      glAccount: glAccount.code
    });

    res.status(201).json({
      success: true,
      message: 'GL mapping created successfully',
      data: mapping
    });
  } catch (error) {
    logger.error('Create GL mapping error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getGLMappings = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { page = 1, limit = 20, category } = req.query;

    const query = { company: companyId };
    if (category) query.expenseCategory = category;

    const mappings = await GLMapping.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await GLMapping.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        mappings,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    logger.error('Get GL mappings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.syncExpenseToAccounting = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { glAccountId } = req.body;
    const { companyId } = req.user;

    const result = await integrationService.syncExpenseToAccounting(expenseId, glAccountId);

    if (result.success) {
      // Broadcast real-time update
      realtimeService.broadcastToCompany(companyId, 'expense-synced-to-accounting', {
        expenseId,
        accountingReference: result.accountingReference
      });

      res.status(200).json({
        success: true,
        message: 'Expense synced to accounting system successfully',
        data: {
          expenseId,
          accountingReference: result.accountingReference
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to sync expense to accounting',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Sync expense to accounting error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Travel Integration
exports.fetchTravelBookings = async (req, res) => {
  try {
    const { companyId, userId } = req.user;
    const { startDate, endDate } = req.query;

    const dateRange = {
      start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: endDate || new Date()
    };

    const result = await integrationService.fetchTravelBookings(companyId, userId, dateRange);

    if (result.success) {
      // Save bookings to database
      for (const bookingData of result.bookings) {
        await TravelBooking.findOneAndUpdate(
          { externalId: bookingData.id },
          {
            company: companyId,
            user: userId,
            externalId: bookingData.id,
            bookingType: bookingData.type,
            bookingDate: bookingData.bookingDate,
            travelDates: bookingData.travelDates,
            destination: bookingData.destination,
            cost: bookingData.cost,
            details: bookingData.details,
            status: bookingData.status,
            rawData: bookingData
          },
          { upsert: true, new: true }
        );
      }

      // Broadcast real-time update
      realtimeService.broadcastToUser(userId, 'travel-bookings-synced', {
        bookingCount: result.bookings.length
      });

      res.status(200).json({
        success: true,
        message: 'Travel bookings fetched successfully',
        data: {
          bookingCount: result.bookings.length,
          bookings: result.bookings.slice(0, 10) // Return first 10 for preview
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to fetch travel bookings',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Fetch travel bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.prePopulateTravelExpenses = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { companyId, userId } = req.user;

    const result = await integrationService.prePopulateTravelExpenses(companyId, userId, bookingId);

    if (result.success) {
      // Broadcast real-time update
      realtimeService.broadcastToUser(userId, 'travel-expenses-pre-populated', {
        bookingId,
        suggestionCount: result.expenseSuggestions.length
      });

      res.status(200).json({
        success: true,
        message: 'Travel expenses pre-populated successfully',
        data: {
          booking: result.booking,
          expenseSuggestions: result.expenseSuggestions
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to pre-populate travel expenses',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Pre-populate travel expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getTravelBookings = async (req, res) => {
  try {
    const { companyId, userId } = req.user;
    const { page = 1, limit = 20, status, type } = req.query;

    const query = { company: companyId, user: userId };
    if (status) query.status = status;
    if (type) query.bookingType = type;

    const bookings = await TravelBooking.find(query)
      .sort({ travelDates: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TravelBooking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    logger.error('Get travel bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Integration Status
exports.getIntegrationStatus = async (req, res) => {
  try {
    const { companyId } = req.user;

    const integrations = await Integration.find({ company: companyId });
    
    const status = {
      corporateCard: {
        connected: false,
        lastSync: null,
        pendingMatches: 0
      },
      accounting: {
        connected: false,
        glAccountsCount: 0,
        mappingsCount: 0
      },
      travel: {
        connected: false,
        activeBookings: 0
      }
    };

    // Update status based on integrations
    integrations.forEach(integration => {
      switch (integration.type) {
        case 'corporate-card':
          status.corporateCard.connected = integration.status === 'active';
          status.corporateCard.lastSync = integration.lastSync;
          break;
        case 'accounting':
          status.accounting.connected = integration.status === 'active';
          break;
        case 'travel':
          status.travel.connected = integration.status === 'active';
          break;
      }
    });

    // Get additional stats
    status.corporateCard.pendingMatches = await CorporateCardTransaction.countDocuments({
      company: companyId,
      status: 'pending'
    });

    status.accounting.mappingsCount = await GLMapping.countDocuments({
      company: companyId,
      isActive: true
    });

    status.travel.activeBookings = await TravelBooking.countDocuments({
      company: companyId,
      status: 'confirmed'
    });

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Get integration status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

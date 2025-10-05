/**
 * Integration Service
 * Handles Corporate Card, Accounting System API, and Travel Integration
 */

const axios = require('axios');
const logger = require('../utils/logger');

class IntegrationService {
  constructor() {
    this.corporateCardConfig = {
      apiEndpoint: process.env.CORPORATE_CARD_API_URL,
      apiKey: process.env.CORPORATE_CARD_API_KEY,
      syncInterval: process.env.CARD_SYNC_INTERVAL || 300000 // 5 minutes
    };
    
    this.accountingConfig = {
      apiEndpoint: process.env.ACCOUNTING_API_URL,
      apiKey: process.env.ACCOUNTING_API_KEY,
      glMappingEndpoint: process.env.GL_MAPPING_ENDPOINT
    };
    
    this.travelConfig = {
      apiEndpoint: process.env.TRAVEL_API_URL,
      apiKey: process.env.TRAVEL_API_KEY,
      bookingEndpoint: process.env.TRAVEL_BOOKING_ENDPOINT
    };
  }

  // Corporate Card Integration
  async syncCorporateCardTransactions(companyId) {
    try {
      const response = await axios.get(
        `${this.corporateCardConfig.apiEndpoint}/transactions`,
        {
          headers: {
            'Authorization': `Bearer ${this.corporateCardConfig.apiKey}`,
            'X-Company-ID': companyId
          },
          params: {
            limit: 100,
            status: 'pending'
          }
        }
      );

      return {
        success: true,
        transactions: response.data.transactions,
        matchedExpenses: await this.matchTransactionsToExpenses(response.data.transactions, companyId)
      };
    } catch (error) {
      logger.error('Corporate card sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  async matchTransactionsToExpenses(transactions, companyId) {
    const Expense = require('../models/Expense');
    const matchedExpenses = [];

    for (const transaction of transactions) {
      const potentialMatches = await Expense.find({
        company: companyId,
        amount: transaction.amount,
        date: {
          $gte: new Date(transaction.date - 24 * 60 * 60 * 1000), // 24 hours before
          $lte: new Date(transaction.date + 24 * 60 * 60 * 1000)  // 24 hours after
        },
        status: { $in: ['pending', 'submitted'] }
      });

      matchedExpenses.push({
        transaction,
        potentialMatches,
        confidence: this.calculateMatchConfidence(transaction, potentialMatches)
      });
    }

    return matchedExpenses;
  }

  calculateMatchConfidence(transaction, potentialMatches) {
    if (potentialMatches.length === 0) return 0;
    
    const exactAmountMatch = potentialMatches.find(expense => 
      Math.abs(expense.amount - transaction.amount) < 0.01
    );
    
    if (exactAmountMatch) return 0.9;
    
    const merchantMatch = potentialMatches.find(expense => 
      expense.merchant?.toLowerCase().includes(transaction.merchant?.toLowerCase())
    );
    
    if (merchantMatch) return 0.7;
    
    return 0.5;
  }

  // Accounting System Integration
  async syncGLAccounts(companyId) {
    try {
      const response = await axios.get(
        `${this.accountingConfig.apiEndpoint}/gl-accounts`,
        {
          headers: {
            'Authorization': `Bearer ${this.accountingConfig.apiKey}`,
            'X-Company-ID': companyId
          }
        }
      );

      return {
        success: true,
        glAccounts: response.data.accounts
      };
    } catch (error) {
      logger.error('GL accounts sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  async createGLMapping(companyId, mappingData) {
    try {
      const response = await axios.post(
        `${this.accountingConfig.glMappingEndpoint}/mappings`,
        {
          companyId,
          mappings: mappingData
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accountingConfig.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        mapping: response.data
      };
    } catch (error) {
      logger.error('GL mapping creation failed:', error);
      return { success: false, error: error.message };
    }
  }

  async syncExpenseToAccounting(expenseId, glAccountId) {
    try {
      const Expense = require('../models/Expense');
      const expense = await Expense.findById(expenseId);
      
      if (!expense) {
        throw new Error('Expense not found');
      }

      const response = await axios.post(
        `${this.accountingConfig.apiEndpoint}/expenses`,
        {
          expenseId: expense._id,
          amount: expense.amount,
          date: expense.date,
          description: expense.description,
          glAccountId,
          companyId: expense.company
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accountingConfig.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update expense with accounting reference
      expense.accountingReference = response.data.referenceId;
      await expense.save();

      return {
        success: true,
        accountingReference: response.data.referenceId
      };
    } catch (error) {
      logger.error('Expense sync to accounting failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Travel Integration
  async fetchTravelBookings(companyId, userId, dateRange) {
    try {
      const response = await axios.get(
        `${this.travelConfig.apiEndpoint}/bookings`,
        {
          headers: {
            'Authorization': `Bearer ${this.travelConfig.apiKey}`,
            'X-Company-ID': companyId,
            'X-User-ID': userId
          },
          params: {
            startDate: dateRange.start,
            endDate: dateRange.end,
            status: 'confirmed'
          }
        }
      );

      return {
        success: true,
        bookings: response.data.bookings
      };
    } catch (error) {
      logger.error('Travel bookings fetch failed:', error);
      return { success: false, error: error.message };
    }
  }

  async prePopulateTravelExpenses(companyId, userId, bookingId) {
    try {
      const response = await axios.get(
        `${this.travelConfig.bookingEndpoint}/${bookingId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.travelConfig.apiKey}`,
            'X-Company-ID': companyId,
            'X-User-ID': userId
          }
        }
      );

      const booking = response.data.booking;
      
      // Generate expense suggestions based on booking
      const expenseSuggestions = this.generateTravelExpenseSuggestions(booking);

      return {
        success: true,
        booking,
        expenseSuggestions
      };
    } catch (error) {
      logger.error('Travel expense pre-population failed:', error);
      return { success: false, error: error.message };
    }
  }

  generateTravelExpenseSuggestions(booking) {
    const suggestions = [];

    // Flight expenses
    if (booking.flight) {
      suggestions.push({
        category: 'Travel',
        subcategory: 'Flight',
        amount: booking.flight.cost,
        description: `Flight: ${booking.flight.from} to ${booking.flight.to}`,
        date: booking.flight.departureDate,
        merchant: booking.flight.airline,
        isPrePopulated: true
      });
    }

    // Hotel expenses
    if (booking.hotel) {
      suggestions.push({
        category: 'Travel',
        subcategory: 'Accommodation',
        amount: booking.hotel.totalCost,
        description: `Hotel: ${booking.hotel.name}`,
        date: booking.hotel.checkInDate,
        merchant: booking.hotel.name,
        isPrePopulated: true
      });
    }

    // Meal allowances
    if (booking.duration) {
      const mealAllowance = booking.duration * 50; // $50 per day
      suggestions.push({
        category: 'Travel',
        subcategory: 'Meals',
        amount: mealAllowance,
        description: `Meal allowance for ${booking.duration} days`,
        date: booking.startDate,
        merchant: 'Travel Meal Allowance',
        isPrePopulated: true
      });
    }

    return suggestions;
  }

  // Real-time sync methods
  async startRealTimeSync(companyId) {
    const cron = require('node-cron');
    
    // Sync corporate card transactions every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      await this.syncCorporateCardTransactions(companyId);
    });

    // Sync GL accounts daily
    cron.schedule('0 2 * * *', async () => {
      await this.syncGLAccounts(companyId);
    });

    logger.info(`Real-time sync started for company: ${companyId}`);
  }
}

module.exports = new IntegrationService();

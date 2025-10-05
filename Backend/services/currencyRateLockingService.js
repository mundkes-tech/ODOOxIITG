/**
 * Currency Rate Locking Service
 * Handles real-time currency rate locking for expense submissions
 */

const CurrencyRateLock = require('../models/CurrencyRateLock');
const Expense = require('../models/Expense');
const axios = require('axios');
const logger = require('../utils/logger');

class CurrencyRateLockingService {
  constructor() {
    this.apiProviders = {
      fixer: {
        url: 'http://data.fixer.io/api/latest',
        apiKey: process.env.FIXER_API_KEY
      },
      exchangerate: {
        url: 'https://api.exchangerate-api.com/v4/latest',
        apiKey: process.env.EXCHANGERATE_API_KEY
      },
      currencylayer: {
        url: 'http://api.currencylayer.com/live',
        apiKey: process.env.CURRENCYLAYER_API_KEY
      }
    };
    this.defaultProvider = 'fixer';
    this.rateExpirationHours = 24;
  }

  // Lock exchange rate for expense submission
  async lockExchangeRate(companyId, expenseId, fromCurrency, toCurrency, amount) {
    try {
      // Check if rate already exists and is valid
      const existingLock = await CurrencyRateLock.findOne({
        company: companyId,
        expense: expenseId,
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        status: 'active'
      });

      if (existingLock && existingLock.isValid()) {
        logger.info(`Using existing rate lock for expense ${expenseId}`);
        return { success: true, rateLock: existingLock };
      }

      // Get current exchange rate
      const exchangeRate = await this.getCurrentExchangeRate(fromCurrency, toCurrency);
      
      if (!exchangeRate) {
        throw new Error('Unable to fetch exchange rate');
      }

      // Calculate converted amount
      const convertedAmount = amount * exchangeRate;

      // Create rate lock
      const rateLock = new CurrencyRateLock({
        company: companyId,
        expense: expenseId,
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        exchangeRate,
        originalAmount: amount,
        convertedAmount,
        source: 'api',
        apiProvider: this.defaultProvider,
        metadata: {
          apiResponse: exchangeRate,
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          marketRate: exchangeRate
        }
      });

      await rateLock.save();

      logger.info(`Exchange rate locked for expense ${expenseId}: ${fromCurrency} to ${toCurrency} at ${exchangeRate}`);
      return { success: true, rateLock };
    } catch (error) {
      logger.error('Lock exchange rate failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current exchange rate from API
  async getCurrentExchangeRate(fromCurrency, toCurrency) {
    try {
      const provider = this.apiProviders[this.defaultProvider];
      
      if (!provider || !provider.apiKey) {
        throw new Error(`API provider ${this.defaultProvider} not configured`);
      }

      let response;
      
      switch (this.defaultProvider) {
        case 'fixer':
          response = await axios.get(provider.url, {
            params: {
              access_key: provider.apiKey,
              base: fromCurrency.toUpperCase(),
              symbols: toCurrency.toUpperCase()
            }
          });
          return response.data.rates[toCurrency.toUpperCase()];

        case 'exchangerate':
          response = await axios.get(`${provider.url}/${fromCurrency.toUpperCase()}`);
          return response.data.rates[toCurrency.toUpperCase()];

        case 'currencylayer':
          response = await axios.get(provider.url, {
            params: {
              access_key: provider.apiKey,
              currencies: `${fromCurrency.toUpperCase()},${toCurrency.toUpperCase()}`
            }
          });
          const quotes = response.data.quotes;
          const fromQuote = quotes[`USD${fromCurrency.toUpperCase()}`];
          const toQuote = quotes[`USD${toCurrency.toUpperCase()}`];
          return toQuote / fromQuote;

        default:
          throw new Error(`Unsupported provider: ${this.defaultProvider}`);
      }
    } catch (error) {
      logger.error('Get current exchange rate failed:', error);
      return null;
    }
  }

  // Convert amount using locked rate
  async convertAmount(expenseId, amount) {
    try {
      const rateLock = await CurrencyRateLock.findOne({
        expense: expenseId,
        status: 'active'
      });

      if (!rateLock) {
        throw new Error('No active rate lock found for expense');
      }

      if (!rateLock.isValid()) {
        throw new Error('Rate lock has expired');
      }

      const convertedAmount = amount * rateLock.exchangeRate;
      
      // Mark rate as used
      await rateLock.markAsUsed();

      logger.info(`Amount converted for expense ${expenseId}: ${amount} ${rateLock.fromCurrency} = ${convertedAmount} ${rateLock.toCurrency}`);
      return { success: true, convertedAmount, exchangeRate: rateLock.exchangeRate };
    } catch (error) {
      logger.error('Convert amount failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get rate lock for expense
  async getRateLock(expenseId) {
    try {
      const rateLock = await CurrencyRateLock.findOne({
        expense: expenseId,
        status: 'active'
      });

      if (!rateLock) {
        return { success: false, error: 'No rate lock found' };
      }

      return { success: true, rateLock };
    } catch (error) {
      logger.error('Get rate lock failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Extend rate lock expiration
  async extendRateLock(expenseId, hours = 24) {
    try {
      const rateLock = await CurrencyRateLock.findOne({
        expense: expenseId,
        status: 'active'
      });

      if (!rateLock) {
        throw new Error('No active rate lock found');
      }

      await rateLock.extendExpiration(hours);
      
      logger.info(`Rate lock extended for expense ${expenseId} by ${hours} hours`);
      return { success: true, rateLock };
    } catch (error) {
      logger.error('Extend rate lock failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Clean up expired rate locks
  async cleanupExpiredLocks() {
    try {
      const result = await CurrencyRateLock.updateMany(
        {
          status: 'active',
          expiresAt: { $lt: new Date() }
        },
        {
          status: 'expired'
        }
      );

      logger.info(`Cleaned up ${result.modifiedCount} expired rate locks`);
      return { success: true, cleanedCount: result.modifiedCount };
    } catch (error) {
      logger.error('Cleanup expired locks failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get rate history for analytics
  async getRateHistory(companyId, filters = {}) {
    try {
      const query = { company: companyId };
      
      if (filters.fromCurrency) {
        query.fromCurrency = filters.fromCurrency.toUpperCase();
      }
      
      if (filters.toCurrency) {
        query.toCurrency = filters.toCurrency.toUpperCase();
      }
      
      if (filters.dateRange) {
        query.lockedAt = {
          $gte: new Date(filters.dateRange.start),
          $lte: new Date(filters.dateRange.end)
        };
      }

      const rateHistory = await CurrencyRateLock.find(query)
        .populate('expense')
        .sort({ lockedAt: -1 })
        .limit(filters.limit || 100);

      return { success: true, rateHistory };
    } catch (error) {
      logger.error('Get rate history failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Manual rate override (for admin use)
  async setManualRate(companyId, expenseId, fromCurrency, toCurrency, rate, amount) {
    try {
      const convertedAmount = amount * rate;

      const rateLock = new CurrencyRateLock({
        company: companyId,
        expense: expenseId,
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        exchangeRate: rate,
        originalAmount: amount,
        convertedAmount,
        source: 'manual',
        apiProvider: 'manual',
        metadata: {
          manualRate: rate,
          setBy: 'admin'
        }
      });

      await rateLock.save();

      logger.info(`Manual rate set for expense ${expenseId}: ${fromCurrency} to ${toCurrency} at ${rate}`);
      return { success: true, rateLock };
    } catch (error) {
      logger.error('Set manual rate failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new CurrencyRateLockingService();

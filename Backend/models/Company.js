const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  currency: {
    type: String,
    required: false,
    trim: true,
    default: 'USD'
  },
  timezone: {
    type: String,
    required: false,
    trim: true,
    default: 'UTC'
  },
  address: {
    type: String,
    required: false,
    trim: true
  },
  phone: {
    type: String,
    required: false,
    trim: true
  },
  website: {
    type: String,
    required: false,
    trim: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Pre-save hook to set currency based on country
companySchema.pre('save', function(next) {
  const countryToCurrency = {
    'india': 'INR',
    'us': 'USD',
    'uk': 'GBP',
    'japan': 'JPY',
    'australia': 'AUD',
    'canada': 'CAD',
    'germany': 'EUR',
    'france': 'EUR',
    'spain': 'EUR',
    'italy': 'EUR'
  };

  if (this.isNew && !this.currency) {
    const country = this.country.trim().toLowerCase();
    this.currency = countryToCurrency[country] || "USD";
  }
  next();
});

module.exports = mongoose.model('Company', companySchema);

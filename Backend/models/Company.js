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
    required: true,
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

  if (this.isNew) {
    const country = this.country.toLowerCase();
    this.currency = countryToCurrency[country] || 'USD'; // Default to USD if country not found
  }
  next();
});

module.exports = mongoose.model('Company', companySchema);

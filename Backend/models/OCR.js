const mongoose = require('mongoose');

const ocrSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  parsedData: {
    amount: {
      type: Number,
      default: null
    },
    currency: {
      type: String,
      default: null,
      uppercase: true
    },
    date: {
      type: Date,
      default: null
    },
    merchant: {
      type: String,
      default: null,
      trim: true
    },
    description: {
      type: String,
      default: null,
      trim: true
    },
    category: {
      type: String,
      default: null,
      enum: [
        'travel',
        'meals',
        'accommodation',
        'transportation',
        'office_supplies',
        'entertainment',
        'training',
        'communication',
        'other'
      ]
    }
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  errorMessage: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
ocrSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
ocrSchema.index({ userId: 1 });
ocrSchema.index({ companyId: 1 });
ocrSchema.index({ createdAt: -1 });

module.exports = mongoose.model('OCR', ocrSchema);

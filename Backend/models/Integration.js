/**
 * Integration Model
 * Manages integration configurations and status
 */

const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  type: {
    type: String,
    enum: ['corporate-card', 'accounting', 'travel'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  configuration: {
    apiEndpoint: String,
    apiKey: String,
    credentials: mongoose.Schema.Types.Mixed,
    settings: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'error', 'pending'],
    default: 'pending'
  },
  lastSync: {
    type: Date,
    default: Date.now
  },
  syncFrequency: {
    type: Number,
    default: 300000 // 5 minutes in milliseconds
  },
  errorLog: [{
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    }
  }],
  metadata: {
    totalRecords: {
      type: Number,
      default: 0
    },
    lastRecordId: String,
    syncStats: {
      successful: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      lastError: String
    }
  }
}, {
  timestamps: true
});

// Indexes
integrationSchema.index({ company: 1, type: 1 }, { unique: true });
integrationSchema.index({ status: 1 });
integrationSchema.index({ lastSync: 1 });

module.exports = mongoose.model('Integration', integrationSchema);

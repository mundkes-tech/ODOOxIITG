/**
 * Travel Booking Model
 * Stores travel bookings for expense pre-population
 */

const mongoose = require('mongoose');

const travelBookingSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  integration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Integration',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  externalId: {
    type: String,
    required: true
  },
  bookingType: {
    type: String,
    enum: ['flight', 'hotel', 'car', 'train', 'package'],
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  travelDates: {
    start: Date,
    end: Date,
    duration: Number // in days
  },
  destination: {
    city: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  cost: {
    total: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    breakdown: {
      base: Number,
      taxes: Number,
      fees: Number,
      insurance: Number
    }
  },
  details: {
    flight: {
      airline: String,
      flightNumber: String,
      departure: {
        airport: String,
        time: Date
      },
      arrival: {
        airport: String,
        time: Date
      },
      class: String
    },
    hotel: {
      name: String,
      address: String,
      checkIn: Date,
      checkOut: Date,
      roomType: String,
      guests: Number
    },
    car: {
      provider: String,
      vehicleType: String,
      pickupLocation: String,
      dropoffLocation: String,
      pickupTime: Date,
      dropoffTime: Date
    }
  },
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  prePopulatedExpenses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense'
  }],
  rawData: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes
travelBookingSchema.index({ company: 1, user: 1, travelDates: -1 });
travelBookingSchema.index({ externalId: 1 }, { unique: true });
travelBookingSchema.index({ status: 1 });
travelBookingSchema.index({ bookingType: 1 });

module.exports = mongoose.model('TravelBooking', travelBookingSchema);

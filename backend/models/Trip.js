// ============================================================
// models/Trip.js
// Defines the Trip model for the database.
// A trip is started by a fisherman, tracks status and catch records.
// A trip becomes "Overdue" automatically when the expected return time passes.
// ============================================================

const mongoose = require('mongoose');

// Schema for each fish catch entry in a trip
const catchSchema = new mongoose.Schema({
  fishType:   { type: String, required: true },
  quantityKg: { type: Number, required: true }
});

const tripSchema = new mongoose.Schema(
  {
    // The boat used for this trip
    boat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Boat',
      required: true
    },
    // The fisherman who started the trip
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    departureTime: {
      type: Date,
      required: true
    },
    expectedReturnTime: {
      type: Date,
      required: true
    },
    // Filled in when the fisherman marks the trip as returned
    actualReturnTime: {
      type: Date
    },
    // Status is updated automatically to "Overdue" when expectedReturnTime passes
    status: {
      type: String,
      enum: ['At Sea', 'Returned', 'Overdue'],
      default: 'At Sea'
    },
    // List of fish caught during this trip
    catches: [catchSchema],
    // Tracks whether a harbour officer has opened an alert for this overdue trip
    alertStatus: {
      type: String,
      enum: ['None', 'Open', 'Verified', 'Resolved'],
      default: 'None'
    },
    // A note left by the officer when they handle the alert
    officerNote: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);


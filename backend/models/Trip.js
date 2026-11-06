// Trip model schema
const mongoose = require('mongoose');

// Fish catch subdocument schema
const catchSchema = new mongoose.Schema({
  fishType:   { type: String, required: true },
  quantityKg: { type: Number, required: true }
});

const tripSchema = new mongoose.Schema(
  {
    boat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Boat',
      required: true
    },
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
    actualReturnTime: {
      type: Date
    },
    status: {
      type: String,
      enum: ['At Sea', 'Returned', 'Overdue'],
      default: 'At Sea'
    },
    catches: [catchSchema],
    alertStatus: {
      type: String,
      enum: ['None', 'Open', 'Verified', 'Resolved'],
      default: 'None'
    },
    officerNote: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);

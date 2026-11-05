// ============================================================
// models/Price.js
// Defines the Price model for the fish price board.
// The admin maintains the current price per kg for each fish type.
// ============================================================

const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema(
  {
    // Fish type must be unique (e.g., "Tuna", "Prawns")
    fishType: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    pricePerKg: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Price', priceSchema);


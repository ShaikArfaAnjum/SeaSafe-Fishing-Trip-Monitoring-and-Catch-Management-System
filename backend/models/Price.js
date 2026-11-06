// Fish price model schema
const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema(
  {
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

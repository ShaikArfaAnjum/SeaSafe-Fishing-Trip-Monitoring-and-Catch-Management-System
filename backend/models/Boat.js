// ============================================================
// models/Boat.js
// Defines the Boat model for the database.
// A boat belongs to a fisherman (owner) and has a list of crew members.
// ============================================================

const mongoose = require('mongoose');

// Schema for each crew member on the boat
const crewMemberSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  age:   { type: Number, required: true },
  phone: { type: String, required: true }
});

const boatSchema = new mongoose.Schema(
  {
    boatName: {
      type: String,
      required: true,
      trim: true
    },
    // Must be unique across all boats
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    harbour: {
      type: String,
      required: true,
      trim: true
    },
    // The fisherman who registered and owns this boat
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // List of crew members on this boat
    crew: [crewMemberSchema],
    emergencyContactName: {
      type: String,
      required: true
    },
    emergencyContactPhone: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Boat', boatSchema);


// Boat model schema
const mongoose = require('mongoose');

// Crew member subdocument schema
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
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
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

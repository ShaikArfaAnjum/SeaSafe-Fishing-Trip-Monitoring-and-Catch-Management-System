// ============================================================
// models/User.js
// Defines the User model for the database.
// A user can be a fisherman, harbour officer, or admin.
// ============================================================

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // Full name of the user
    name: {
      type: String,
      required: true,
      trim: true
    },
    // Email is stored in lowercase and must be unique
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    // Password is stored as a bcrypt hash (never plain text)
    password: {
      type: String,
      required: true
    },
    // Role determines what the user can do in the system
    role: {
      type: String,
      enum: ['fisherman', 'officer', 'admin'],
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);


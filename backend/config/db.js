// ============================================================
// config/db.js
// This file connects the application to MongoDB using Mongoose.
// It is called once when the server starts.
// ============================================================

const mongoose = require('mongoose');

// Connect to the MongoDB database using the URI from environment variables.
// If the connection fails, print the error and stop the server.
async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected: ' + conn.connection.host);
  } catch (error) {
    console.error('MongoDB connection error: ' + error.message);
    process.exit(1);
  }
}

module.exports = connectDB;


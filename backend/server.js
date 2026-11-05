// ============================================================
// server.js
// Main entry point for the SeaSafe backend server.
// Order: load env → connect DB → run overdue check → start listening.
// ============================================================

// Load environment variables from .env FIRST (before any other require)
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { markOverdueTrips } = require('./controllers/tripController');

// Import all route files
const authRoutes  = require('./routes/authRoutes');
const boatRoutes  = require('./routes/boatRoutes');
const tripRoutes  = require('./routes/tripRoutes');
const priceRoutes = require('./routes/priceRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ---- CORS configuration ----
// CLIENT_URL in .env can be a comma-separated list of allowed origins.
// e.g. CLIENT_URL=http://localhost:5173,https://seasafe.example.com
var allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(function (o) { return o.trim(); })
  : [];

// Always include the local dev server as an allowed origin
if (!allowedOrigins.includes('http://localhost:5173')) {
  allowedOrigins.push('http://localhost:5173');
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin header (e.g. curl, Postman, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Parse incoming requests with JSON bodies
app.use(express.json());

// ---- Routes ----

// Health check – confirm the API is running
app.get('/', function (req, res) {
  res.json({ message: 'SeaSafe API is running' });
});

app.use('/api/auth',   authRoutes);
app.use('/api/boats',  boatRoutes);
app.use('/api/trips',  tripRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/admin',  adminRoutes);

const PORT = process.env.PORT || 5000;

// Connect to the database, then start the server and overdue check
async function startServer() {
  // Connect to MongoDB first – exits if connection fails
  await connectDB();

  // Run overdue check once immediately after the server starts
  try {
    await markOverdueTrips();
    console.log('Initial overdue trip check completed.');
  } catch (error) {
    console.error('Error during initial overdue check: ' + error.message);
  }

  // Run the overdue check every 60 seconds automatically.
  // Wrapped in try/catch so a single failure never crashes the server.
  setInterval(async function () {
    try {
      await markOverdueTrips();
    } catch (error) {
      console.error('Error during scheduled overdue check: ' + error.message);
    }
  }, 60000);

  app.listen(PORT, function () {
    console.log('SeaSafe server is running on port ' + PORT);
  });
}

startServer();


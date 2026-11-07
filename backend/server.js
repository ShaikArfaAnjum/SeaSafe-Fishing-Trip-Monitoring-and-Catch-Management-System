// Main entry point for SeaSafe backend server
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { markOverdueTrips } = require('./controllers/tripController');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const boatRoutes = require('./routes/boatRoutes');
const tripRoutes = require('./routes/tripRoutes');
const priceRoutes = require('./routes/priceRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Configure CORS allowed origins
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(o => o.trim())
  : [];

if (!allowedOrigins.includes('http://localhost:5173')) {
  allowedOrigins.push('http://localhost:5173');
}

app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.includes('onrender.com')
    ) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// API route registrations
app.use('/api/auth', authRoutes);
app.use('/api/boats', boatRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/admin', adminRoutes);

// Bulletproof static serving path tracking logic
const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendPath));

// Catch-all route for Single Page Application routing (placed AFTER all API endpoints)
app.get('*', (req, res) => {
  if (req.path.startsWith('/assets/') || req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
    return res.status(404).send('Asset not found');
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server with overdue trip checker
async function startServer() {
  await connectDB();

  // Initial overdue trip check on startup
  try {
    await markOverdueTrips();
    console.log('Initial overdue trip check completed.');
  } catch (error) {
    console.error('Error during initial overdue check: ' + error.message);
  }

  // Automatic overdue trip check every 60 seconds
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

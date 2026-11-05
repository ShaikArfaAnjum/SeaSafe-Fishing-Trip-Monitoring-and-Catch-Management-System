// ============================================================
// routes/authRoutes.js
// Routes for user registration, login, and getting current user.
// ============================================================

const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes – no token needed
router.post('/register', register);
router.post('/login', login);

// Protected route – requires a valid JWT token
router.get('/me', protect, getMe);

module.exports = router;


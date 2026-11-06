// Routes for user registration, login, and profile
const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes for user auth
router.post('/register', register);
router.post('/login', login);

// Protected route to get logged-in user profile
router.get('/me', protect, getMe);

module.exports = router;

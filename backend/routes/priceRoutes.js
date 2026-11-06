// Routes for fish price board
const express = require('express');
const router = express.Router();
const { getPrices, createPrice, updatePrice, deletePrice } = require('../controllers/priceController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

// Get all fish prices for authenticated users
router.get('/', protect, getPrices);

// Admin-only price management routes
router.post('/', protect, allowRoles('admin'), createPrice);
router.put('/:id', protect, allowRoles('admin'), updatePrice);
router.delete('/:id', protect, allowRoles('admin'), deletePrice);

module.exports = router;

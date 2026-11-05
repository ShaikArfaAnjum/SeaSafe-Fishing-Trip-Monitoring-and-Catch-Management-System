// ============================================================
// routes/priceRoutes.js
// Routes for the fish price board.
// Any logged-in user can view prices.
// Only admins can create, update, or delete prices.
// ============================================================

const express = require('express');
const router = express.Router();
const { getPrices, createPrice, updatePrice, deletePrice } = require('../controllers/priceController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

// Any logged-in user can view the price list
router.get('/', protect, getPrices);

// Admin-only actions
router.post('/', protect, allowRoles('admin'), createPrice);
router.put('/:id', protect, allowRoles('admin'), updatePrice);
router.delete('/:id', protect, allowRoles('admin'), deletePrice);

module.exports = router;


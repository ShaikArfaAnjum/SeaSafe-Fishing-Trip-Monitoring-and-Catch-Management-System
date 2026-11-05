// ============================================================
// routes/adminRoutes.js
// All routes here are restricted to admin users only.
// The router-level middleware applies protect + allowRoles('admin')
// to every route in this file automatically.
// ============================================================

const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
  updateBoat,
  deleteBoat,
  getStats
} = require('../controllers/adminController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

// Apply authentication and admin role check to every route below
router.use(protect, allowRoles('admin'));

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Boat management (admin can update harbour or delete any boat)
router.put('/boats/:id', updateBoat);
router.delete('/boats/:id', deleteBoat);

// System statistics for the dashboard
router.get('/stats', getStats);

module.exports = router;


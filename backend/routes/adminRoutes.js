// Routes restricted to admin users only
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

// Protect all admin routes
router.use(protect, allowRoles('admin'));

// Admin user management routes
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Admin boat management routes
router.put('/boats/:id', updateBoat);
router.delete('/boats/:id', deleteBoat);

// Admin system statistics route
router.get('/stats', getStats);

module.exports = router;

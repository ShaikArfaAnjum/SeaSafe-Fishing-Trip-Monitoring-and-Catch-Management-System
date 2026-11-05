// ============================================================
// routes/tripRoutes.js
// Routes for fishing trip management.
// IMPORTANT: Fixed paths (/my, /at-sea, /overdue, /alerts, /all)
//            are defined BEFORE the /:id wildcard routes to avoid
//            Express treating those path segments as document ids.
// ============================================================

const express = require('express');
const router = express.Router();
const {
  createTrip,
  getMyTrips,
  returnTrip,
  addCatch,
  deleteCatch,
  getAtSeaTrips,
  getOverdueTrips,
  getAlertHistory,
  getAllTrips,
  updateAlert
} = require('../controllers/tripController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

// ---- Fisherman routes ----
router.post('/', protect, allowRoles('fisherman'), createTrip);
router.get('/my', protect, allowRoles('fisherman'), getMyTrips);
router.put('/:id/return', protect, allowRoles('fisherman'), returnTrip);
router.post('/:id/catch', protect, allowRoles('fisherman'), addCatch);
router.delete('/:id/catch/:catchId', protect, allowRoles('fisherman'), deleteCatch);

// ---- Officer and admin routes ----
// Fixed paths first (before /:id) to prevent route conflicts
router.get('/at-sea', protect, allowRoles('officer', 'admin'), getAtSeaTrips);
router.get('/overdue', protect, allowRoles('officer', 'admin'), getOverdueTrips);
router.get('/alerts', protect, allowRoles('officer', 'admin'), getAlertHistory);
router.get('/all', protect, allowRoles('officer', 'admin'), getAllTrips);

// Officer only – update alert status on an overdue trip
router.put('/:id/alert', protect, allowRoles('officer'), updateAlert);

module.exports = router;


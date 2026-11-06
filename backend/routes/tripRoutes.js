// Routes for fishing trip management
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

// Fisherman trip routes
router.post('/', protect, allowRoles('fisherman'), createTrip);
router.get('/my', protect, allowRoles('fisherman'), getMyTrips);
router.put('/:id/return', protect, allowRoles('fisherman'), returnTrip);
router.post('/:id/catch', protect, allowRoles('fisherman'), addCatch);
router.delete('/:id/catch/:catchId', protect, allowRoles('fisherman'), deleteCatch);

// Officer and admin trip routes
router.get('/at-sea', protect, allowRoles('officer', 'admin'), getAtSeaTrips);
router.get('/overdue', protect, allowRoles('officer', 'admin'), getOverdueTrips);
router.get('/alerts', protect, allowRoles('officer', 'admin'), getAlertHistory);
router.get('/all', protect, allowRoles('officer', 'admin'), getAllTrips);

// Officer alert status update route
router.put('/:id/alert', protect, allowRoles('officer'), updateAlert);

module.exports = router;

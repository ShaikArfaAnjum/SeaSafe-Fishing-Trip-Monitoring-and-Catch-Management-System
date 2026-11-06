// Routes for boat management
const express = require('express');
const router = express.Router();
const { getMyBoats, getAllBoats, createBoat, updateBoat, deleteBoat } = require('../controllers/boatController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

// Get all boats for officers and admins (defined before /:id)
router.get('/all', protect, allowRoles('officer', 'admin'), getAllBoats);

// Fisherman boat routes
router.get('/', protect, allowRoles('fisherman'), getMyBoats);
router.post('/', protect, allowRoles('fisherman'), createBoat);
router.put('/:id', protect, allowRoles('fisherman'), updateBoat);
router.delete('/:id', protect, allowRoles('fisherman'), deleteBoat);

module.exports = router;

// ============================================================
// routes/boatRoutes.js
// Routes for boat management.
// IMPORTANT: /all is defined BEFORE /:id to prevent Express
//            treating the string "all" as a MongoDB document id.
// ============================================================

const express = require('express');
const router = express.Router();
const { getMyBoats, getAllBoats, createBoat, updateBoat, deleteBoat } = require('../controllers/boatController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

// Officers and admins can see all boats – defined BEFORE /:id
router.get('/all', protect, allowRoles('officer', 'admin'), getAllBoats);

// Fisherman routes for managing their own boats
router.get('/', protect, allowRoles('fisherman'), getMyBoats);
router.post('/', protect, allowRoles('fisherman'), createBoat);
router.put('/:id', protect, allowRoles('fisherman'), updateBoat);
router.delete('/:id', protect, allowRoles('fisherman'), deleteBoat);

module.exports = router;


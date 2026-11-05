// ============================================================
// controllers/boatController.js
// Handles all boat-related operations.
// Fishermen manage their own boats.
// Officers and admins can view all boats.
// ============================================================

const Boat = require('../models/Boat');
const Trip = require('../models/Trip');

// GET /api/boats
// Return all boats that belong to the logged-in fisherman, newest first.
async function getMyBoats(req, res) {
  try {
    const boats = await Boat.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(boats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// GET /api/boats/all
// Return all boats in the system with owner name and email populated.
// For officers and admins only.
async function getAllBoats(req, res) {
  try {
    const boats = await Boat.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.json(boats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// POST /api/boats
// Register a new boat under the logged-in fisherman.
// Rejects duplicate registration numbers.
async function createBoat(req, res) {
  try {
    const {
      boatName,
      registrationNumber,
      harbour,
      crew,
      emergencyContactName,
      emergencyContactPhone
    } = req.body;

    // Check that all required fields are present
    if (!boatName || !registrationNumber || !harbour || !emergencyContactName || !emergencyContactPhone) {
      return res.status(400).json({
        message: 'Please provide boatName, registrationNumber, harbour, emergencyContactName and emergencyContactPhone.'
      });
    }

    // A registration number must be unique across all boats
    const existingBoat = await Boat.findOne({ registrationNumber });
    if (existingBoat) {
      return res.status(400).json({
        message: 'A boat with registration number "' + registrationNumber + '" already exists.'
      });
    }

    // Create the boat, setting the logged-in user as the owner
    const boat = await Boat.create({
      boatName,
      registrationNumber,
      harbour,
      owner: req.user._id,
      crew: crew || [],
      emergencyContactName,
      emergencyContactPhone
    });

    res.status(201).json(boat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// PUT /api/boats/:id
// Update a boat's details. Only the owner fisherman can do this.
async function updateBoat(req, res) {
  try {
    const boat = await Boat.findById(req.params.id);

    if (!boat) {
      return res.status(404).json({ message: 'Boat not found.' });
    }

    // A fisherman can only update their own boat
    if (boat.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorised to update this boat.' });
    }

    // Update only the fields that were sent in the request body
    const { boatName, registrationNumber, harbour, crew, emergencyContactName, emergencyContactPhone } = req.body;

    if (boatName !== undefined)              boat.boatName = boatName;
    if (registrationNumber !== undefined)    boat.registrationNumber = registrationNumber;
    if (harbour !== undefined)               boat.harbour = harbour;
    if (crew !== undefined)                  boat.crew = crew;
    if (emergencyContactName !== undefined)  boat.emergencyContactName = emergencyContactName;
    if (emergencyContactPhone !== undefined) boat.emergencyContactPhone = emergencyContactPhone;

    const updatedBoat = await boat.save();
    res.json(updatedBoat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// DELETE /api/boats/:id
// Delete a boat. Only the owner can do this.
// Refuses if the boat has an active trip (At Sea or Overdue).
// Otherwise, also deletes all historical trip records for this boat.
async function deleteBoat(req, res) {
  try {
    const boat = await Boat.findById(req.params.id);

    if (!boat) {
      return res.status(404).json({ message: 'Boat not found.' });
    }

    // A fisherman can only delete their own boat
    if (boat.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorised to delete this boat.' });
    }

    // Refuse to delete if the boat is currently at sea or overdue
    const activeTrip = await Trip.findOne({
      boat: boat._id,
      status: { $in: ['At Sea', 'Overdue'] }
    });

    if (activeTrip) {
      return res.status(400).json({
        message: 'Cannot delete this boat because it has an active trip (status: ' + activeTrip.status + '). End the trip first.'
      });
    }

    // Delete all trip records associated with this boat
    await Trip.deleteMany({ boat: boat._id });

    // Delete the boat itself
    await boat.deleteOne();

    res.json({ message: 'Boat and all its trip records have been deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { getMyBoats, getAllBoats, createBoat, updateBoat, deleteBoat };


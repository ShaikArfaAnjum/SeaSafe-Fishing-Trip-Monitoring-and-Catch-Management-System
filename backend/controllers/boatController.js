// Boat controller: handles boat registration, retrieval, updates, and deletion
const Boat = require('../models/Boat');
const Trip = require('../models/Trip');

// GET /api/boats - get boats owned by logged-in fisherman
async function getMyBoats(req, res) {
  try {
    const boats = await Boat.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(boats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// GET /api/boats/all - get all boats across harbours (officer/admin)
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

// POST /api/boats - register a new boat
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

    if (!boatName || !registrationNumber || !harbour || !emergencyContactName || !emergencyContactPhone) {
      return res.status(400).json({
        message: 'Please provide boatName, registrationNumber, harbour, emergencyContactName and emergencyContactPhone.'
      });
    }

    const existingBoat = await Boat.findOne({ registrationNumber });
    if (existingBoat) {
      return res.status(400).json({
        message: 'A boat with registration number "' + registrationNumber + '" already exists.'
      });
    }

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

// PUT /api/boats/:id - update boat details (owner only)
async function updateBoat(req, res) {
  try {
    const boat = await Boat.findById(req.params.id);

    if (!boat) {
      return res.status(404).json({ message: 'Boat not found.' });
    }

    if (boat.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorised to update this boat.' });
    }

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

// DELETE /api/boats/:id - delete boat and its trips if no active voyage
async function deleteBoat(req, res) {
  try {
    const boat = await Boat.findById(req.params.id);

    if (!boat) {
      return res.status(404).json({ message: 'Boat not found.' });
    }

    if (boat.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorised to delete this boat.' });
    }

    const activeTrip = await Trip.findOne({
      boat: boat._id,
      status: { $in: ['At Sea', 'Overdue'] }
    });

    if (activeTrip) {
      return res.status(400).json({
        message: 'Cannot delete this boat because it has an active trip (status: ' + activeTrip.status + '). End the trip first.'
      });
    }

    await Trip.deleteMany({ boat: boat._id });
    await boat.deleteOne();

    res.json({ message: 'Boat and all its trip records have been deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { getMyBoats, getAllBoats, createBoat, updateBoat, deleteBoat };

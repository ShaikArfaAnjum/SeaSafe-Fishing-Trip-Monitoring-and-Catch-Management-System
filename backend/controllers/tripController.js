// Trip controller: handles trip lifecycle, catches, overdue checks, and alerts
const Trip = require('../models/Trip');
const Boat = require('../models/Boat');

const BOAT_FIELDS = 'boatName registrationNumber harbour crew emergencyContactName emergencyContactPhone';
const OWNER_FIELDS = 'name email';

// Compare expected return time with current time and mark overdue trips
async function markOverdueTrips() {
  await Trip.updateMany(
    { status: 'At Sea', expectedReturnTime: { $lt: new Date() } },
    { status: 'Overdue', alertStatus: 'Open' }
  );
}

// POST /api/trips - start a new trip
async function createTrip(req, res) {
  try {
    const { boat: boatId, departureTime, expectedReturnTime } = req.body;

    if (!boatId || !departureTime || !expectedReturnTime) {
      return res.status(400).json({ message: 'Please provide boat, departureTime and expectedReturnTime.' });
    }

    const departure = new Date(departureTime);
    const expectedReturn = new Date(expectedReturnTime);

    if (isNaN(departure.getTime())) {
      return res.status(400).json({ message: 'departureTime is not a valid date.' });
    }
    if (isNaN(expectedReturn.getTime())) {
      return res.status(400).json({ message: 'expectedReturnTime is not a valid date.' });
    }

    if (expectedReturn <= departure) {
      return res.status(400).json({ message: 'expectedReturnTime must be after departureTime.' });
    }

    if (expectedReturn <= new Date()) {
      return res.status(400).json({ message: 'expectedReturnTime must be in the future.' });
    }

    const boat = await Boat.findById(boatId);
    if (!boat) {
      return res.status(404).json({ message: 'Boat not found.' });
    }

    if (boat.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'This boat does not belong to you.' });
    }

    const activeTrip = await Trip.findOne({
      boat: boatId,
      status: { $in: ['At Sea', 'Overdue'] }
    });

    if (activeTrip) {
      return res.status(400).json({
        message: 'This boat already has an active trip (status: ' + activeTrip.status + '). End the current trip before starting a new one.'
      });
    }

    const trip = await Trip.create({
      boat: boatId,
      owner: req.user._id,
      departureTime: departure,
      expectedReturnTime: expectedReturn
    });

    const populatedTrip = await Trip.findById(trip._id)
      .populate('boat', BOAT_FIELDS)
      .populate('owner', OWNER_FIELDS);

    res.status(201).json(populatedTrip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// GET /api/trips/my - get logged-in fisherman's trips
async function getMyTrips(req, res) {
  try {
    await markOverdueTrips();

    const trips = await Trip.find({ owner: req.user._id })
      .populate('boat', BOAT_FIELDS)
      .populate('owner', OWNER_FIELDS)
      .sort({ createdAt: -1 });

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// PUT /api/trips/:id/return - mark trip as returned and resolve alert
async function returnTrip(req, res) {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    if (trip.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorised to update this trip.' });
    }

    if (trip.status === 'Returned') {
      return res.status(400).json({ message: 'This trip has already been marked as returned.' });
    }

    trip.status = 'Returned';
    trip.actualReturnTime = new Date();

    if (trip.alertStatus !== 'None') {
      trip.alertStatus = 'Resolved';
    }

    await trip.save();

    const updatedTrip = await Trip.findById(trip._id)
      .populate('boat', BOAT_FIELDS)
      .populate('owner', OWNER_FIELDS);

    res.json(updatedTrip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// POST /api/trips/:id/catch - add catch entry to trip
async function addCatch(req, res) {
  try {
    const { fishType, quantityKg } = req.body;

    if (!fishType || quantityKg === undefined) {
      return res.status(400).json({ message: 'Please provide fishType and quantityKg.' });
    }

    if (quantityKg <= 0) {
      return res.status(400).json({ message: 'quantityKg must be greater than 0.' });
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    if (trip.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorised to update this trip.' });
    }

    trip.catches.push({ fishType, quantityKg });
    await trip.save();

    const updatedTrip = await Trip.findById(trip._id)
      .populate('boat', BOAT_FIELDS)
      .populate('owner', OWNER_FIELDS);

    res.json(updatedTrip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// DELETE /api/trips/:id/catch/:catchId - remove a catch entry
async function deleteCatch(req, res) {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    if (trip.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorised to update this trip.' });
    }

    const catchIndex = trip.catches.findIndex(
      function (c) { return c._id.toString() === req.params.catchId; }
    );

    if (catchIndex === -1) {
      return res.status(404).json({ message: 'Catch entry not found.' });
    }

    trip.catches.splice(catchIndex, 1);
    await trip.save();

    const updatedTrip = await Trip.findById(trip._id)
      .populate('boat', BOAT_FIELDS)
      .populate('owner', OWNER_FIELDS);

    res.json(updatedTrip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// GET /api/trips/at-sea - get all At Sea or Overdue trips
async function getAtSeaTrips(req, res) {
  try {
    await markOverdueTrips();

    const trips = await Trip.find({ status: { $in: ['At Sea', 'Overdue'] } })
      .populate('boat', BOAT_FIELDS)
      .populate('owner', OWNER_FIELDS)
      .sort({ expectedReturnTime: 1 });

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// GET /api/trips/overdue - get all Overdue trips
async function getOverdueTrips(req, res) {
  try {
    await markOverdueTrips();

    const trips = await Trip.find({ status: 'Overdue' })
      .populate('boat', BOAT_FIELDS)
      .populate('owner', OWNER_FIELDS)
      .sort({ expectedReturnTime: 1 });

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// GET /api/trips/alerts - get trips with active or past alerts
async function getAlertHistory(req, res) {
  try {
    const trips = await Trip.find({ alertStatus: { $ne: 'None' } })
      .populate('boat', BOAT_FIELDS)
      .populate('owner', OWNER_FIELDS)
      .sort({ createdAt: -1 });

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// GET /api/trips/all - get all trips in the system
async function getAllTrips(req, res) {
  try {
    await markOverdueTrips();

    const trips = await Trip.find()
      .populate('boat', BOAT_FIELDS)
      .populate('owner', OWNER_FIELDS)
      .sort({ createdAt: -1 });

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// PUT /api/trips/:id/alert - officer updates alert status and note
async function updateAlert(req, res) {
  try {
    const { alertStatus, officerNote } = req.body;

    if (!alertStatus || !['Verified', 'Resolved'].includes(alertStatus)) {
      return res.status(400).json({ message: 'alertStatus must be "Verified" or "Resolved".' });
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    if (trip.alertStatus === 'None') {
      return res.status(400).json({ message: 'This trip does not have an active alert.' });
    }

    trip.alertStatus = alertStatus;
    if (officerNote !== undefined) {
      trip.officerNote = officerNote;
    }

    await trip.save();

    const updatedTrip = await Trip.findById(trip._id)
      .populate('boat', BOAT_FIELDS)
      .populate('owner', OWNER_FIELDS);

    res.json(updatedTrip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  markOverdueTrips,
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
};

// ============================================================
// controllers/tripController.js
// Handles all fishing trip operations.
// Key feature: markOverdueTrips() automatically flags trips
// whose expected return time has passed as "Overdue".
// ============================================================

const Trip = require('../models/Trip');
const Boat = require('../models/Boat');

// Fields to populate from the Boat document in every trip response
const BOAT_FIELDS = 'boatName registrationNumber harbour crew emergencyContactName emergencyContactPhone';

// Fields to populate from the User (owner) document in every trip response
const OWNER_FIELDS = 'name email';

// ============================================================
// OVERDUE LOGIC – the main safety feature of SeaSafe.
//
// This function compares each active trip's expectedReturnTime
// with the current time. If a trip is "At Sea" and its expected
// return time is in the past, it is marked "Overdue" and
// alertStatus is set to "Open" so the harbour officer can follow up.
//
// This is called:
//   1. Once when the server starts (in server.js).
//   2. Every 60 seconds via setInterval (in server.js).
//   3. At the start of every trip-fetch route below.
// ============================================================
async function markOverdueTrips() {
  await Trip.updateMany(
    { status: 'At Sea', expectedReturnTime: { $lt: new Date() } },
    { status: 'Overdue', alertStatus: 'Open' }
  );
}

// POST /api/trips
// Start a new fishing trip. Only the boat's owner fisherman can do this.
// Rules: boat must belong to the fisherman, no active trip on the same boat,
// expectedReturnTime must be after departureTime and in the future.
async function createTrip(req, res) {
  try {
    const { boat: boatId, departureTime, expectedReturnTime } = req.body;

    // All three fields are required
    if (!boatId || !departureTime || !expectedReturnTime) {
      return res.status(400).json({ message: 'Please provide boat, departureTime and expectedReturnTime.' });
    }

    // Parse the ISO date strings sent by the frontend
    const departure = new Date(departureTime);
    const expectedReturn = new Date(expectedReturnTime);

    // Check that both dates are valid
    if (isNaN(departure.getTime())) {
      return res.status(400).json({ message: 'departureTime is not a valid date.' });
    }
    if (isNaN(expectedReturn.getTime())) {
      return res.status(400).json({ message: 'expectedReturnTime is not a valid date.' });
    }

    // Expected return must be after departure
    if (expectedReturn <= departure) {
      return res.status(400).json({ message: 'expectedReturnTime must be after departureTime.' });
    }

    // Expected return must still be in the future
    if (expectedReturn <= new Date()) {
      return res.status(400).json({ message: 'expectedReturnTime must be in the future.' });
    }

    // Find the boat and verify it belongs to the logged-in fisherman
    const boat = await Boat.findById(boatId);
    if (!boat) {
      return res.status(404).json({ message: 'Boat not found.' });
    }

    if (boat.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'This boat does not belong to you.' });
    }

    // A boat can only have one active trip at a time
    const activeTrip = await Trip.findOne({
      boat: boatId,
      status: { $in: ['At Sea', 'Overdue'] }
    });

    if (activeTrip) {
      return res.status(400).json({
        message: 'This boat already has an active trip (status: ' + activeTrip.status + '). End the current trip before starting a new one.'
      });
    }

    // Create the new trip record
    const trip = await Trip.create({
      boat: boatId,
      owner: req.user._id,
      departureTime: departure,
      expectedReturnTime: expectedReturn
    });

    // Populate boat and owner details before returning the response
    const populatedTrip = await Trip.findById(trip._id)
      .populate('boat', BOAT_FIELDS)
      .populate('owner', OWNER_FIELDS);

    res.status(201).json(populatedTrip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// GET /api/trips/my
// Return all trips belonging to the logged-in fisherman, newest first.
async function getMyTrips(req, res) {
  try {
    // Update overdue status before fetching so the fisherman sees accurate statuses
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

// PUT /api/trips/:id/return
// Mark a trip as returned. Only the owner fisherman can do this.
// Works for trips with status "At Sea" or "Overdue".
// If an alert was open, it is automatically resolved.
async function returnTrip(req, res) {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    // Only the owner fisherman can mark their trip as returned
    if (trip.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorised to update this trip.' });
    }

    // Cannot return a trip that is already returned
    if (trip.status === 'Returned') {
      return res.status(400).json({ message: 'This trip has already been marked as returned.' });
    }

    // Set the status and record the actual return time
    trip.status = 'Returned';
    trip.actualReturnTime = new Date();

    // If a harbour officer had opened an alert, close it now that the boat returned
    if (trip.alertStatus !== 'None') {
      trip.alertStatus = 'Resolved';
    }

    await trip.save();

    // Return the updated trip with populated fields
    const updatedTrip = await Trip.findById(trip._id)
      .populate('boat', BOAT_FIELDS)
      .populate('owner', OWNER_FIELDS);

    res.json(updatedTrip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// POST /api/trips/:id/catch
// Add a fish catch entry to a trip. Only the owner fisherman can do this.
async function addCatch(req, res) {
  try {
    const { fishType, quantityKg } = req.body;

    // Both fields are required
    if (!fishType || quantityKg === undefined) {
      return res.status(400).json({ message: 'Please provide fishType and quantityKg.' });
    }

    // Catch quantity must be a positive number
    if (quantityKg <= 0) {
      return res.status(400).json({ message: 'quantityKg must be greater than 0.' });
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    // Only the owner can add catch records to their trip
    if (trip.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorised to update this trip.' });
    }

    // Push the new catch entry into the catches array
    trip.catches.push({ fishType, quantityKg });
    await trip.save();

    // Return the updated trip with populated fields
    const updatedTrip = await Trip.findById(trip._id)
      .populate('boat', BOAT_FIELDS)
      .populate('owner', OWNER_FIELDS);

    res.json(updatedTrip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// DELETE /api/trips/:id/catch/:catchId
// Remove a specific catch entry from a trip. Only the owner fisherman can do this.
async function deleteCatch(req, res) {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    // Only the owner can delete catch records from their trip
    if (trip.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorised to update this trip.' });
    }

    // Find the catch entry by its id
    const catchIndex = trip.catches.findIndex(
      function (c) { return c._id.toString() === req.params.catchId; }
    );

    if (catchIndex === -1) {
      return res.status(404).json({ message: 'Catch entry not found.' });
    }

    // Remove the catch entry from the array
    trip.catches.splice(catchIndex, 1);
    await trip.save();

    // Return the updated trip with populated fields
    const updatedTrip = await Trip.findById(trip._id)
      .populate('boat', BOAT_FIELDS)
      .populate('owner', OWNER_FIELDS);

    res.json(updatedTrip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// GET /api/trips/at-sea
// Return all trips with status "At Sea" or "Overdue", sorted by expectedReturnTime ascending.
// For harbour officers and admins to monitor active trips.
async function getAtSeaTrips(req, res) {
  try {
    // Update overdue status before fetching
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

// GET /api/trips/overdue
// Return all trips that are currently Overdue.
// For harbour officers and admins to follow up with fishermen.
async function getOverdueTrips(req, res) {
  try {
    // Update overdue status before fetching
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

// GET /api/trips/alerts
// Return all trips that have or had an alert (alertStatus is not "None"), newest first.
// This is the full alert history for officers and admins.
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

// GET /api/trips/all
// Return all trips in the system, newest first.
// For harbour officers and admins.
async function getAllTrips(req, res) {
  try {
    // Update overdue status before fetching
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

// PUT /api/trips/:id/alert
// Harbour officer updates the alertStatus and adds a note for an overdue trip.
// Only works on trips that already have an active alert (alertStatus is not "None").
async function updateAlert(req, res) {
  try {
    const { alertStatus, officerNote } = req.body;

    // Only "Verified" or "Resolved" are valid officer actions
    if (!alertStatus || !['Verified', 'Resolved'].includes(alertStatus)) {
      return res.status(400).json({ message: 'alertStatus must be "Verified" or "Resolved".' });
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    // Only trips with an existing alert can be updated
    if (trip.alertStatus === 'None') {
      return res.status(400).json({ message: 'This trip does not have an active alert.' });
    }

    // Update the alert status and optional officer note
    trip.alertStatus = alertStatus;
    if (officerNote !== undefined) {
      trip.officerNote = officerNote;
    }

    await trip.save();

    // Return the updated trip with populated fields
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


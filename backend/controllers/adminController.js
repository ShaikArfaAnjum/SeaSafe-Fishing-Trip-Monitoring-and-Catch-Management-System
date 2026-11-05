// ============================================================
// controllers/adminController.js
// Handles admin-only operations:
// user management, boat management, and system statistics.
// ============================================================

const User = require('../models/User');
const Boat = require('../models/Boat');
const Trip = require('../models/Trip');

// GET /api/admin/users
// Return all users without their passwords.
async function getAllUsers(req, res) {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// PUT /api/admin/users/:id/role
// Change a user's role. Admin only.
async function updateUserRole(req, res) {
  try {
    const { role } = req.body;

    // Validate the new role value
    if (!role || !['fisherman', 'officer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be "fisherman", "officer" or "admin".' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update the role and save
    user.role = role;
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// DELETE /api/admin/users/:id
// Delete a user along with all their boats and trips.
// An admin cannot delete their own account.
async function deleteUser(req, res) {
  try {
    // Prevent an admin from accidentally deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Delete all trips owned by this user
    await Trip.deleteMany({ owner: user._id });

    // Delete all boats owned by this user
    await Boat.deleteMany({ owner: user._id });

    // Delete the user account
    await user.deleteOne();

    res.json({ message: 'User "' + user.name + '" and all their boats and trips have been deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// PUT /api/admin/boats/:id
// Admin can update a boat's harbour and boatName.
async function updateBoat(req, res) {
  try {
    const boat = await Boat.findById(req.params.id);

    if (!boat) {
      return res.status(404).json({ message: 'Boat not found.' });
    }

    // Update harbour and/or boatName if provided
    const { harbour, boatName } = req.body;
    if (harbour !== undefined)  boat.harbour = harbour;
    if (boatName !== undefined) boat.boatName = boatName;

    const updatedBoat = await boat.save();
    res.json(updatedBoat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// DELETE /api/admin/boats/:id
// Admin can delete any boat and all its trip records.
async function deleteBoat(req, res) {
  try {
    const boat = await Boat.findById(req.params.id);

    if (!boat) {
      return res.status(404).json({ message: 'Boat not found.' });
    }

    // Delete all trips linked to this boat
    await Trip.deleteMany({ boat: boat._id });

    // Delete the boat
    await boat.deleteOne();

    res.json({ message: 'Boat "' + boat.boatName + '" and all its trips have been deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// GET /api/admin/stats
// Return system-wide statistics for the admin dashboard.
// catchByFish and boatsByHarbour are calculated with simple JavaScript loops,
// not with aggregation pipelines, so the code is easy to read and explain.
async function getStats(req, res) {
  try {
    // Count totals from the database
    const totalUsers = await User.countDocuments();
    const totalBoats = await Boat.countDocuments();

    // Fetch all trips and all boats to calculate the rest in JavaScript
    const trips = await Trip.find();
    const boats = await Boat.find();

    const totalTrips = trips.length;

    // Count how many trips are currently overdue
    let overdueTrips = 0;
    for (var i = 0; i < trips.length; i++) {
      if (trips[i].status === 'Overdue') {
        overdueTrips++;
      }
    }

    // Calculate total catch in kg and group by fish type
    var totalCatchKg = 0;
    var catchMap = {};

    for (var t = 0; t < trips.length; t++) {
      var tripCatches = trips[t].catches;
      for (var c = 0; c < tripCatches.length; c++) {
        var entry = tripCatches[c];
        totalCatchKg += entry.quantityKg;

        if (!catchMap[entry.fishType]) {
          catchMap[entry.fishType] = 0;
        }
        catchMap[entry.fishType] += entry.quantityKg;
      }
    }

    // Convert catchMap object into an array of { fishType, totalKg }
    var catchByFish = [];
    var fishTypes = Object.keys(catchMap);
    for (var f = 0; f < fishTypes.length; f++) {
      catchByFish.push({ fishType: fishTypes[f], totalKg: catchMap[fishTypes[f]] });
    }

    // Count how many boats are in each harbour
    var harbourMap = {};
    for (var b = 0; b < boats.length; b++) {
      var harbour = boats[b].harbour;
      if (!harbourMap[harbour]) {
        harbourMap[harbour] = 0;
      }
      harbourMap[harbour]++;
    }

    // Convert harbourMap object into an array of { harbour, count }
    var boatsByHarbour = [];
    var harbours = Object.keys(harbourMap);
    for (var h = 0; h < harbours.length; h++) {
      boatsByHarbour.push({ harbour: harbours[h], count: harbourMap[harbours[h]] });
    }

    res.json({
      totalUsers,
      totalBoats,
      totalTrips,
      overdueTrips,
      totalCatchKg,
      catchByFish,
      boatsByHarbour
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { getAllUsers, updateUserRole, deleteUser, updateBoat, deleteBoat, getStats };


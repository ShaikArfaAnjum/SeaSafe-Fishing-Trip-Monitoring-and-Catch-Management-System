// Admin controller: handles user management, fleet allocation, and stats
const User = require('../models/User');
const Boat = require('../models/Boat');
const Trip = require('../models/Trip');

// GET /api/admin/users - return all users without password
async function getAllUsers(req, res) {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// PUT /api/admin/users/:id/role - update user role
async function updateUserRole(req, res) {
  try {
    const { role } = req.body;

    if (!role || !['fisherman', 'officer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be "fisherman", "officer" or "admin".' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.role = role;
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// DELETE /api/admin/users/:id - delete user, boats and trips
async function deleteUser(req, res) {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await Trip.deleteMany({ owner: user._id });
    await Boat.deleteMany({ owner: user._id });
    await user.deleteOne();

    res.json({ message: 'User "' + user.name + '" and all their boats and trips have been deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// PUT /api/admin/boats/:id - update harbour or boat name
async function updateBoat(req, res) {
  try {
    const boat = await Boat.findById(req.params.id);

    if (!boat) {
      return res.status(404).json({ message: 'Boat not found.' });
    }

    const { harbour, boatName } = req.body;
    if (harbour !== undefined) boat.harbour = harbour;
    if (boatName !== undefined) boat.boatName = boatName;

    const updatedBoat = await boat.save();
    res.json(updatedBoat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// DELETE /api/admin/boats/:id - delete boat and its trips
async function deleteBoat(req, res) {
  try {
    const boat = await Boat.findById(req.params.id);

    if (!boat) {
      return res.status(404).json({ message: 'Boat not found.' });
    }

    await Trip.deleteMany({ boat: boat._id });
    await boat.deleteOne();

    res.json({ message: 'Boat "' + boat.boatName + '" and all its trips have been deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// GET /api/admin/stats - calculate system metrics using plain JavaScript
async function getStats(req, res) {
  try {
    const totalUsers = await User.countDocuments();
    const totalBoats = await Boat.countDocuments();

    const trips = await Trip.find();
    const boats = await Boat.find();
    const totalTrips = trips.length;

    let overdueTrips = 0;
    for (var i = 0; i < trips.length; i++) {
      if (trips[i].status === 'Overdue') {
        overdueTrips++;
      }
    }

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

    var catchByFish = [];
    var fishTypes = Object.keys(catchMap);
    for (var f = 0; f < fishTypes.length; f++) {
      catchByFish.push({ fishType: fishTypes[f], totalKg: catchMap[fishTypes[f]] });
    }

    var harbourMap = {};
    for (var b = 0; b < boats.length; b++) {
      var harbour = boats[b].harbour;
      if (!harbourMap[harbour]) {
        harbourMap[harbour] = 0;
      }
      harbourMap[harbour]++;
    }

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

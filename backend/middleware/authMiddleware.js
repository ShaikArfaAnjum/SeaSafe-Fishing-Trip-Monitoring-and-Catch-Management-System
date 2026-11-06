// Middleware to verify JWT and restrict access by role
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify Bearer JWT token and attach user to req.user
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorised. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorised. User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorised. Invalid or expired token.' });
  }
}

// Check if logged-in user role is permitted
function allowRoles(...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. You do not have permission for this action.' });
    }
    next();
  };
}

module.exports = { protect, allowRoles };

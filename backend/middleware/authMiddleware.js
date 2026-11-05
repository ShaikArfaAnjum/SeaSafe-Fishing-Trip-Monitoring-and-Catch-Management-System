// ============================================================
// middleware/authMiddleware.js
// Contains middleware to protect routes and restrict access by role.
//   protect      – verifies the JWT token and loads req.user
//   allowRoles   – checks if the user has an allowed role
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Read the "Authorization: Bearer <token>" header, verify the token,
// and load the matching user (without password) into req.user.
// Returns 401 if the token is missing, invalid, or the user no longer exists.
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // The header must exist and start with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorised. No token provided.' });
    }

    // Extract the token string after "Bearer "
    const token = authHeader.split(' ')[1];

    // Verify the token using the secret key from the environment
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load the user from the database, excluding the password field
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorised. User no longer exists.' });
    }

    // Attach the user to the request so controllers can use req.user
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorised. Invalid or expired token.' });
  }
}

// Factory function that returns a middleware checking the user's role.
// Usage: allowRoles('admin', 'officer')
// Returns 403 if the user's role is not in the allowed list.
function allowRoles(...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. You do not have permission for this action.' });
    }
    next();
  };
}

module.exports = { protect, allowRoles };


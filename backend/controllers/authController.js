// ============================================================
// controllers/authController.js
// Handles user registration, login, and fetching the current user.
// Passwords are hashed with bcryptjs before saving.
// JWT tokens expire in 7 days.
// ============================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Create a signed JWT token for the given user id
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Build the safe user object that is sent back in responses.
// NEVER includes the password field.
function buildUserResponse(user) {
  return {
    _id:   user._id,
    name:  user.name,
    email: user.email,
    role:  user.role
  };
}

// POST /api/auth/register
// Register a new user with role "fisherman" or "officer" only.
// Rejects: "admin" role, duplicate email, password shorter than 6 chars.
async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    // All fields are required
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide name, email, password and role.' });
    }

    // Admin accounts cannot be created through the public register endpoint
    if (role === 'admin') {
      return res.status(400).json({ message: 'Admin accounts cannot be created through registration.' });
    }

    // Only fisherman or officer are accepted at registration
    if (!['fisherman', 'officer'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either "fisherman" or "officer".' });
    }

    // Enforce minimum password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Reject duplicate emails
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // Hash the password with a salt before saving to the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save the new user to the database
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    // Return the token and safe user object
    const token = generateToken(newUser._id);
    res.status(201).json({ token, user: buildUserResponse(newUser) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// POST /api/auth/login
// Log in an existing user and return a JWT token.
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Both fields are required
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    // Find the user by email (we need the password field for comparison)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare the provided plain-text password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Return the token and safe user object
    const token = generateToken(user._id);
    res.json({ token, user: buildUserResponse(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// GET /api/auth/me
// Return the currently logged-in user's details (set by the protect middleware).
async function getMe(req, res) {
  try {
    res.json(buildUserResponse(req.user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { register, login, getMe };


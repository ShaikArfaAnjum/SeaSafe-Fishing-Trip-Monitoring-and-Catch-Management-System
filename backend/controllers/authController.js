// Auth controller: handles registration, login, and user profile
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate 7-day signed JWT token
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Build safe user response without password
function buildUserResponse(user) {
  return {
    _id:   user._id,
    name:  user.name,
    email: user.email,
    role:  user.role
  };
}

// POST /api/auth/register - register a fisherman or officer
async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide name, email, password and role.' });
    }

    if (role === 'admin') {
      return res.status(400).json({ message: 'Admin accounts cannot be created through registration.' });
    }

    if (!['fisherman', 'officer'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either "fisherman" or "officer".' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // Hash password with salt before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    const token = generateToken(newUser._id);
    res.status(201).json({ token, user: buildUserResponse(newUser) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// POST /api/auth/login - authenticate user and return token
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare plain-text password with stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);
    res.json({ token, user: buildUserResponse(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// GET /api/auth/me - get current user profile
async function getMe(req, res) {
  try {
    res.json(buildUserResponse(req.user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { register, login, getMe };

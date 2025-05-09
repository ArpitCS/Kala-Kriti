const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const { isAuthenticated } = require('../middlewares/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'kala-kriti-secret-key';

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, email, fullName, password, confirmPassword } = req.body;

    // Basic validation
    if (!username || !email || !fullName || !password) {
      return res.status(400).redirect('/register?error=All fields are required');
    }

    if (password !== confirmPassword) {
      return res.status(400).redirect('/register?error=Passwords do not match');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).redirect('/register?error=Email already in use');
      } else {
        return res.status(400).redirect('/register?error=Username already taken');
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      email,
      fullName,
      password: hashedPassword
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
      expiresIn: '1d'
    });

    // Set cookie and redirect
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'strict'
    });

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).redirect('/register?error=Registration failed. Please try again.');
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return res.status(400).redirect('/login?error=All fields are required');
    }

    // Check if user exists (by username or email)
    const user = await User.findOne({ 
      $or: [
        { username },
        { email: username } // Allow login with email as username
      ]
    });

    if (!user) {
      return res.status(400).redirect('/login?error=Invalid username or password');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).redirect('/login?error=Invalid username or password');
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: '1d'
    });

    // Set cookie and redirect
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'strict'
    });

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).redirect('/login?error=Login failed. Please try again.');
  }
});

// Logout route
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

// Get current user
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
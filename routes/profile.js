const express = require('express');
const User = require('../models/Users');
const { isAuthenticated } = require('../middlewares/auth');

const router = express.Router();

// Get user profile
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.render('portfolio', { user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).redirect('/dashboard?error=Failed to load profile');
  }
});

// Update user profile
router.post('/update', isAuthenticated, async (req, res) => {
  try {
    const { fullName, email, bio, phoneNumber } = req.body;
    
    // Find user and update fields
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        fullName,
        email,
        bio,
        phoneNumber
      },
      { new: true }
    ).select('-password');
    
    res.redirect('/profile?success=Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).redirect('/profile?error=Failed to update profile');
  }
});

module.exports = router;
const jwt = require('jsonwebtoken');
const User = require('../models/Users');

const JWT_SECRET = process.env.JWT_SECRET || 'kala-kriti-secret-key';

// Middleware to check if user is authenticated
exports.isAuthenticated = async (req, res, next) => {
  try {
    // Get the token from cookies
    const token = req.cookies.token;
    
    if (!token) {
      return res.redirect('/login?error=Please login to access this page');
    }
    
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user by ID
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.redirect('/login?error=Authentication failed');
    }
    
    // Attach user data to request
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.clearCookie('token');
    res.redirect('/login?error=Session expired. Please login again');
  }
};

// Middleware to redirect if user is already authenticated
exports.redirectIfAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      return res.redirect('/dashboard'); // Already logged in, redirect to dashboard
    } catch (error) {
      // Token is invalid, clear it and continue
      res.clearCookie('token');
    }
  }
  
  next();
};
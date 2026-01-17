const express = require('express');
const { 
  phoneRegister, 
  phoneLogin, 
  verifyToken,
  getUserProfile,
  updateUserProfile
} = require('../controllers/phoneAuthController');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * Public Routes
 */

// Register/Login with phone number and OTP
// POST /api/auth/phone-register
// Body: { name, email, phone, idToken }
router.post('/phone-register', phoneRegister);

// Login with phone number and OTP
// POST /api/auth/phone-login
// Body: { phone, idToken }
router.post('/phone-login', phoneLogin);

// Verify Firebase token
// POST /api/auth/verify-token
// Body: { idToken }
router.post('/verify-token', verifyToken);

/**
 * Protected Routes (Require JWT Token)
 */

// Get user profile
// GET /api/auth/profile
// Headers: { Authorization: Bearer <token> }
router.get('/profile', auth, getUserProfile);

// Update user profile
// PUT /api/auth/profile
// Headers: { Authorization: Bearer <token> }
// Body: { name, email, department, profilePicture }
router.put('/profile', auth, updateUserProfile);

module.exports = router;

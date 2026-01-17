const admin = require('../config/firebase');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Register/Login user with phone number
 * Verifies Firebase ID token and creates/updates user in MongoDB
 */
const phoneRegister = async (req, res) => {
  try {
    const { name, email, phone, idToken } = req.body;

    // Validate input
    if (!name || !email || !phone || !idToken) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // The phone number from Firebase should match the request
    const firebasePhone = decodedToken.phone_number;
    if (firebasePhone !== phone) {
      return res.status(401).json({ message: 'Phone number mismatch' });
    }

    // Check if user exists by email or phone
    let user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone: phone }],
    });

    if (user) {
      // User exists - update phone if needed
      if (!user.phone) {
        user.phone = phone;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        name,
        email: email.toLowerCase(),
        phone,
        password: 'firebase-auth', // Placeholder - not used for phone auth
        role: 'user',
        isActive: true,
      });

      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        authMethod: 'phone',
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Return success response
    res.status(200).json({
      message: 'Phone authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Phone register error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

/**
 * Login with phone number
 * Simplified flow for existing users
 */
const phoneLogin = async (req, res) => {
  try {
    const { phone, idToken } = req.body;

    if (!phone || !idToken) {
      return res.status(400).json({ message: 'Phone and token required' });
    }

    // Verify Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Find user by phone
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is disabled' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        authMethod: 'phone',
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Phone login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * Verify Firebase token and get user info
 * Useful for checking if user is logged in
 */
const verifyToken = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Token required' });
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    res.status(200).json({
      message: 'Token verified',
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        phone: decodedToken.phone_number,
      },
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Get user profile by ID
 * Protected route - requires JWT token
 */
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Set by auth middleware

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User profile retrieved',
      user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user profile
 * Protected route - requires JWT token
 */
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, department, profilePicture } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (department) user.department = department;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  phoneRegister,
  phoneLogin,
  verifyToken,
  getUserProfile,
  updateUserProfile,
};

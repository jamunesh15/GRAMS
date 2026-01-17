const express = require('express');
const router = express.Router();
const {
  getWardMapData,
  getWardDetails,
  getGeoJSONData,
  getWardTrends,
} = require('../controllers/wardMapController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// All routes require authentication and admin privileges
router.use(auth);
router.use(adminAuth);

// @route   GET /api/ward-map/overview
// @desc    Get ward-wise grievance statistics and map data
// @access  Admin
router.get('/overview', getWardMapData);

// @route   GET /api/ward-map/ward/:wardNumber
// @desc    Get detailed statistics for a specific ward
// @access  Admin
router.get('/ward/:wardNumber', getWardDetails);

// @route   GET /api/ward-map/geojson
// @desc    Get GeoJSON data for map visualization
// @access  Admin
router.get('/geojson', getGeoJSONData);

// @route   GET /api/ward-map/trends
// @desc    Get ward-wise trend data over time
// @access  Admin
router.get('/trends', getWardTrends);

module.exports = router;

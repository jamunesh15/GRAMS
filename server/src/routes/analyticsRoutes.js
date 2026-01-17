const express = require('express');
const router = express.Router();
const {
  getResolutionTimeAnalytics,
  getEngineerPerformance,
  getStatusAnalysis,
  getCitizenAnalytics,
  getAreaAnalysis,
  getBacklogAnalysis,
} = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public analytics endpoints (accessible without authentication for transparency)
router.get('/resolution-time', getResolutionTimeAnalytics);
router.get('/status-analysis', getStatusAnalysis);
router.get('/area-analysis', getAreaAnalysis);
router.get('/backlog-analysis', getBacklogAnalysis);

// Admin-only analytics endpoints
router.get('/engineer-performance', auth, adminAuth, getEngineerPerformance);
router.get('/citizen-analytics', auth, adminAuth, getCitizenAnalytics);

module.exports = router;

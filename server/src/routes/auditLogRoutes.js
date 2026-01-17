const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
  getAuditLogs,
  getAuditStats,
  getRecentBudgetActivities,
} = require('../controllers/auditLogController');

// All routes require admin authentication
// @route   GET /api/audit-logs
router.get('/', auth, adminAuth, getAuditLogs);

// @route   GET /api/audit-logs/stats
router.get('/stats', auth, adminAuth, getAuditStats);

// @route   GET /api/audit-logs/recent-budget
router.get('/recent-budget', auth, adminAuth, getRecentBudgetActivities);

module.exports = router;

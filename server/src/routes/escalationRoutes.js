const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
  getEscalatedGrievances,
  escalateGrievance,
  deEscalateGrievance,
  getEscalationStats,
  bulkEscalate,
} = require('../controllers/escalationController');

// All routes require admin authentication
router.use(adminAuth);

// Get all escalated grievances
router.get('/grievances', getEscalatedGrievances);

// Get escalation statistics
router.get('/stats', getEscalationStats);

// Manually escalate a grievance
router.post('/escalate', escalateGrievance);

// De-escalate a grievance
router.post('/de-escalate', deEscalateGrievance);

// Bulk escalate grievances
router.post('/bulk-escalate', bulkEscalate);

module.exports = router;

const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
  generateReport,
  getReportHistory,
  downloadReport,
  getReportPreview,
  getRecentReports,
  downloadReportByFilename
} = require('../controllers/reportController');

// All routes require authentication and admin role
router.use(adminAuth);

// Generate report
router.post('/generate', generateReport);

// Get report history
router.get('/history', getReportHistory);

// Get recent reports (last 4)
router.get('/recent', getRecentReports);

// Download report
router.get('/download', downloadReport);

// Download report by filename
router.get('/download-file/:filename', downloadReportByFilename);

// Get report preview
router.get('/preview', getReportPreview);

module.exports = router;

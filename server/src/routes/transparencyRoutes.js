const express = require('express');
const router = express.Router();

const {
  getTransparencyReport,
  getOverdueIssues,
  upvoteIssue,
  getCategoryStats,
  getMonthlyTrends,
  getOfficerStats,
  getBudgetDetails,
  exportData,
  getIssueDetails,
} = require('../controllers/transparencyController');

/**
 * @route   GET /api/transparency/report
 * @desc    Get comprehensive transparency report
 * @access  Public
 */
router.get('/report', getTransparencyReport);

/**
 * @route   GET /api/transparency/overdue
 * @desc    Get all overdue issues with pagination
 * @access  Public
 * @query   page, limit, sortBy (daysOpen|upvotes|priority), category, priority
 */
router.get('/overdue', getOverdueIssues);

/**
 * @route   POST /api/transparency/upvote/:id
 * @desc    Upvote an overdue issue
 * @access  Public
 */
router.post('/upvote/:id', upvoteIssue);

/**
 * @route   GET /api/transparency/categories
 * @desc    Get category-wise statistics
 * @access  Public
 */
router.get('/categories', getCategoryStats);

/**
 * @route   GET /api/transparency/trends
 * @desc    Get monthly trends data
 * @access  Public
 * @query   months (default: 12)
 */
router.get('/trends', getMonthlyTrends);

/**
 * @route   GET /api/transparency/officers
 * @desc    Get officer performance statistics
 * @access  Public
 */
router.get('/officers', getOfficerStats);

/**
 * @route   GET /api/transparency/budget
 * @desc    Get detailed budget utilization
 * @access  Public
 */
router.get('/budget', getBudgetDetails);

/**
 * @route   GET /api/transparency/export
 * @desc    Export transparency data
 * @access  Public
 * @query   format (json|csv), type (summary|grievances|budget)
 */
router.get('/export', exportData);

/**
 * @route   GET /api/transparency/issue/:id
 * @desc    Get public details of a specific issue
 * @access  Public
 */
router.get('/issue/:id', getIssueDetails);

module.exports = router;

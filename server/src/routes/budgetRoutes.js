const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
  getBudgetOverview,
  updateGrievanceBudget,
  addExpense,
  getBudgetTrends,
  getCurrentSystemBudget,
  getAllSystemBudgets,
  createSystemBudget,
  activateSystemBudget,
  addEngineerSalary,
  updateEngineerSalary,
  updateCategoryBudget,
  getSystemBudgetStats,
  getPublicSystemBudget,
  approveGrievanceBudget,
  getPendingSalaryInfo,
  processMonthlySalary,
} = require('../controllers/budgetController');

// Public routes
router.get('/overview', getBudgetOverview);
router.get('/trends', getBudgetTrends);
router.get('/system/public', getPublicSystemBudget);

// Admin/Engineer only routes
router.put('/:id', auth, updateGrievanceBudget);
router.post('/:id/expense', auth, addExpense);

// System Budget Routes (Admin only)
router.get('/system/current', auth, adminAuth, getCurrentSystemBudget);
router.get('/system/all', auth, adminAuth, getAllSystemBudgets);
router.post('/system/create', auth, adminAuth, createSystemBudget);
router.put('/system/:id/activate', auth, adminAuth, activateSystemBudget);
router.get('/system/stats', auth, adminAuth, getSystemBudgetStats);
router.post('/system/salary/add', auth, adminAuth, addEngineerSalary);
router.put('/system/salary/:engineerId', auth, adminAuth, updateEngineerSalary);
router.get('/system/salary/pending', auth, adminAuth, getPendingSalaryInfo);
router.post('/system/salary/process', auth, adminAuth, processMonthlySalary);
router.put('/system/category/:category', auth, adminAuth, updateCategoryBudget);
router.put('/grievance/:id/approve', auth, adminAuth, approveGrievanceBudget);

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
  getDashboardStats,
  getAllUsers,
  getAllGrievancesAdmin,
  assignGrievance,
  updateUserRole,
  updateGrievanceStatus,
  getEngineers,
  getCompletedTasks,
  confirmCompletedTask,
  confirmAllCompletedTasks,
} = require('../controllers/adminController');

router.get('/dashboard', getDashboardStats);
router.get('/users', auth, adminAuth, getAllUsers);
router.get('/grievances', auth, adminAuth, getAllGrievancesAdmin);
router.get('/engineers', auth, adminAuth, getEngineers);
router.get('/completed-tasks', auth, adminAuth, getCompletedTasks);
router.post('/assign-grievance', auth, adminAuth, assignGrievance);
router.post('/confirm-task', auth, adminAuth, confirmCompletedTask);
router.post('/confirm-all-tasks', auth, adminAuth, confirmAllCompletedTasks);
router.put('/user-role', auth, adminAuth, updateUserRole);
router.put('/grievance-status', auth, adminAuth, updateGrievanceStatus);

module.exports = router;

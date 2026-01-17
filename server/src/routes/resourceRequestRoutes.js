const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
  createResourceRequest,
  getAllResourceRequests,
  getPendingRequests,
  getMyRequests,
  getResourceRequestById,
  approveResourceRequest,
  rejectResourceRequest,
  markAsDelivered,
  getRequestStats,
  refetchRemainingAmount,
  getAllocatedResources,
} = require('../controllers/resourceRequestController');

// Engineer routes
router.post('/create', auth, createResourceRequest);
router.get('/my-requests', auth, getMyRequests);

// Admin routes
router.get('/all', auth, adminAuth, getAllResourceRequests);
router.get('/pending', auth, adminAuth, getPendingRequests);
router.get('/allocated', auth, adminAuth, getAllocatedResources);
router.get('/stats', auth, adminAuth, getRequestStats);
router.put('/:id/approve', auth, adminAuth, approveResourceRequest);
router.put('/:id/reject', auth, adminAuth, rejectResourceRequest);
router.put('/:id/deliver', auth, adminAuth, markAsDelivered);
router.post('/:id/refetch', auth, adminAuth, refetchRemainingAmount);

// Shared routes - MUST be after specific routes
router.get('/:id', auth, getResourceRequestById);

module.exports = router;

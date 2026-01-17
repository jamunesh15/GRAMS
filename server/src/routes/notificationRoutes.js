const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// User routes (protected)
router.get('/recent', auth, notificationController.getRecentNotifications);
router.get('/all', auth, notificationController.getAllNotifications);
router.get('/unread-count', auth, notificationController.getUnreadCount);
router.put('/:notificationId/read', auth, notificationController.markAsRead);
router.put('/mark-all-read', auth, notificationController.markAllAsRead);
router.delete('/:notificationId', auth, notificationController.deleteNotification);

// Admin routes (protected)
router.post('/create', auth, adminAuth, notificationController.createNotification);

module.exports = router;

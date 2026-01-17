const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAllGrievances,
  getTransparencyReport,
  getUserGrievances,
  getGrievanceById,
  createGrievance,
  updateGrievance,
  deleteGrievance,
  addComment,
  upvoteGrievance,
  requestCancellation,
  trackByTrackingId,
  trackByEmail,
} = require('../controllers/grievanceController');

router.get('/', auth, getUserGrievances);
router.get('/my-grievances', auth, getUserGrievances);
router.get('/all', getAllGrievances);
router.get('/transparency', getTransparencyReport);
router.get('/track/id/:trackingId', trackByTrackingId);
router.get('/track/email/:email', trackByEmail);
router.get('/:id', auth, getGrievanceById);
router.post('/', auth, upload.array('files', 7), createGrievance);
router.put('/:id', auth, updateGrievance);
router.delete('/:id', auth, deleteGrievance);
router.post('/:id/comment', auth, addComment);
router.post('/:id/upvote', auth, upvoteGrievance);
router.post('/request-cancellation', auth, requestCancellation);

module.exports = router;

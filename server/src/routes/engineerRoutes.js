const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const engineerController = require('../controllers/engineerController');

// Routes for engineers to access their own data
router.get('/my-grievances', auth, engineerController.getMyAssignedGrievances);
router.get('/dashboard-stats', auth, engineerController.getEngineerDashboardStats);
router.get('/grievance/:id', auth, engineerController.getGrievanceDetails);
router.post('/start-work', auth, engineerController.startWork);
router.post('/upload-to-cloudinary', auth, upload.single('file'), engineerController.uploadToCloudinary);
router.post('/complete-task', auth, engineerController.completeTask);
router.post('/support-request', auth, engineerController.submitSupportRequest);

// All routes below require admin authentication
router.use(auth);
router.use(adminAuth);

// Engineer management routes
router.post('/create', engineerController.createEngineer);
router.get('/all', engineerController.getAllEngineers);
router.get('/stats', engineerController.getEngineerStats);
router.get('/:id', engineerController.getEngineerById);
router.put('/:id', engineerController.updateEngineer);
router.delete('/:id', engineerController.deleteEngineer);

// Task assignment routes
router.post('/assign', engineerController.assignGrievance);
router.post('/unassign', engineerController.unassignGrievance);

// Communication route
router.post('/message', engineerController.sendMessageToEngineer);

module.exports = router;

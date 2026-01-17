const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadFile, uploadMultipleFiles } = require('../controllers/uploadController');

// Upload single file
router.post('/single', auth, upload.single('file'), uploadFile);

// Upload multiple files
router.post('/multiple', auth, upload.array('files', 7), uploadMultipleFiles);

module.exports = router;

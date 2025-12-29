const express = require('express');
const generateController = require('../controllers/generate.controller');
const { auth } = require('../middleware/auth.middleware');
const { uploadMiddleware } = require('../middleware/upload.middleware');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Generate from text
router.post('/text', generateController.fromText);

// Generate from file upload
router.post('/file', uploadMiddleware('file'), generateController.fromFile);

// Improve existing presentation
router.post('/:id/improve', generateController.improve);

// Preview generation (without saving)
router.post('/preview', generateController.preview);

module.exports = router;

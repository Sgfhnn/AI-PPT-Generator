const express = require('express');
const presentationController = require('../controllers/presentation.controller');
const { auth } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(auth);

// CRUD operations
router.get('/', presentationController.getAll);
router.get('/:id', presentationController.getOne);
router.put('/:id', presentationController.update);
router.delete('/:id', presentationController.delete);

// Export and download
router.post('/:id/export', presentationController.export);
router.get('/:id/download', presentationController.download);

module.exports = router;

const express = require('express');
const { uploadAvatar, uploadClassDocument, getClassDocuments, getDocumentById } = require('../controllers/document.controller');
const upload = require('../middleware/upload.middleware');
const { protect } = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

const router = express.Router();

router.use(protect);

// Existing avatar upload
router.post('/avatar', upload.single('avatar'), uploadAvatar);

// Admin uploading document for a class
router.post('/class', authorize('admin', 'staff'), upload.single('document'), uploadClassDocument);

// Anyone can view class documents (filtered by class_name)
router.get('/class', getClassDocuments);

// View specific document
router.get('/:id', getDocumentById);

module.exports = router;

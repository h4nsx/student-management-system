const express = require('express');
const { verifyQR, getScanLogs } = require('../controllers/verification.controller');
const { protect } = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

const router = express.Router();

router.use(protect);

// Anyone authorized (staff/admin) can verify QR
router.post('/scan', authorize('admin', 'staff'), verifyQR);

// Only admin can view all logs
router.get('/logs', authorize('admin'), getScanLogs);

module.exports = router;

const express = require('express');
const { getStudentProfile, updateProfileRequest, getChangeRequests, updateProfileDirectly, getQrData, getScanHistory, getMyClasses, getClassDetail } = require('../controllers/student.controller');
const { protect } = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.get('/profile', getStudentProfile);
router.put('/profile', updateProfileDirectly);
router.post('/requests', updateProfileRequest);
router.get('/requests', getChangeRequests);

// QR routes
router.get('/qr', getQrData);
router.get('/qr/history', getScanHistory);

// Classes routes
router.get('/classes', getMyClasses);
router.get('/classes/:id', getClassDetail);

module.exports = router;

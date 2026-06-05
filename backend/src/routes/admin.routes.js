const express = require('express');
const { 
  getDashboardStats, 
  getStudents, 
  getStudentById, 
  getChangeRequests, 
  handleChangeRequest,
  toggleAccountStatus,
  resetStudentPassword,
  deleteStudent,
  editStudent
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'staff'));

router.get('/dashboard', getDashboardStats);
router.get('/students', getStudents);
router.get('/students/:id', getStudentById);

// New Student Management Actions
router.put('/students/:id', editStudent);
router.put('/students/:id/status', toggleAccountStatus);
router.put('/students/:id/reset-password', resetStudentPassword);
router.delete('/students/:id', authorize('admin'), deleteStudent);

router.get('/requests', getChangeRequests);
router.put('/requests/:id', handleChangeRequest);

module.exports = router;

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
router.get('/students/next-mssv', exports.getNextMssv || require('../controllers/admin.controller').getNextMssv);
router.get('/students/:id', getStudentById);

// New Student Management Actions
router.post('/students', exports.createStudent || require('../controllers/admin.controller').createStudent);
router.put('/students/:id', editStudent);
router.put('/students/:id/status', toggleAccountStatus);
router.put('/students/:id/reset-password', resetStudentPassword);
router.delete('/students/:id', authorize('admin'), deleteStudent);

router.get('/requests', getChangeRequests);
router.put('/requests/:id', handleChangeRequest);

// Class Routes
router.get('/classes', exports.getClasses || require('../controllers/admin.controller').getClasses);
router.post('/classes', exports.createClass || require('../controllers/admin.controller').createClass);
router.get('/classes/:id', exports.getClassById || require('../controllers/admin.controller').getClassById);
router.put('/classes/:id', exports.editClass || require('../controllers/admin.controller').editClass);

// Faculty Routes
router.get('/faculties', exports.getFaculties || require('../controllers/admin.controller').getFaculties);

// Schedule Routes
router.get('/schedules', exports.getSchedules || require('../controllers/admin.controller').getSchedules);
router.post('/schedules', exports.createSchedule || require('../controllers/admin.controller').createSchedule);
router.put('/schedules/:id', exports.editSchedule || require('../controllers/admin.controller').editSchedule);
router.delete('/schedules/:id', exports.deleteSchedule || require('../controllers/admin.controller').deleteSchedule);

// Document Routes
router.get('/documents', exports.getDocuments || require('../controllers/admin.controller').getDocuments);
router.post('/documents/upload', exports.uploadDocument || require('../controllers/admin.controller').uploadDocument);
router.delete('/documents/:id', exports.deleteDocument || require('../controllers/admin.controller').deleteDocument);

// Announcement Routes
router.get('/announcements', exports.getAnnouncements || require('../controllers/admin.controller').getAnnouncements);
router.post('/announcements', exports.createAnnouncement || require('../controllers/admin.controller').createAnnouncement);
router.get('/announcements/:id', exports.getAnnouncementById || require('../controllers/admin.controller').getAnnouncementById);
router.put('/announcements/:id', exports.editAnnouncement || require('../controllers/admin.controller').editAnnouncement);
router.put('/announcements/:id/archive', exports.archiveAnnouncement || require('../controllers/admin.controller').archiveAnnouncement);

module.exports = router;

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, restrictTo } = require('../middleware/auth');
const { handleResumeUpload } = require('../middleware/upload');

// All student routes require authentication
router.use(protect, restrictTo('student', 'admin'));

// Dashboard
router.get('/dashboard', studentController.getDashboard);

// Profile
router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);

// Resume
router.post('/upload-resume', handleResumeUpload, studentController.uploadResume);

// Skills
router.get('/skills', studentController.getSkills);
router.post('/skills', studentController.addSkill);
router.post('/skills/bulk', studentController.bulkAddSkills);
router.put('/skills/:id', studentController.updateSkill);
router.delete('/skills/:id', studentController.deleteSkill);

// Skill Report
router.get('/skill-report', studentController.getSkillReport);

// Progress
router.get('/progress', studentController.getProgress);
router.put('/progress', studentController.updateProgress);

module.exports = router;

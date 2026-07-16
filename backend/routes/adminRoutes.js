const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect, restrictTo('admin'));

// Analytics Dashboard
router.get('/analytics', adminController.getAnalytics);

// User Management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Skill Management (Master Catalog)
router.get('/skills', adminController.getSkills);
router.post('/skills', adminController.createSkill);
router.put('/skills/:id', adminController.updateSkill);
router.delete('/skills/:id', adminController.deleteSkill);

// Job Role Management
router.get('/job-roles', adminController.getJobRoles);
router.post('/job-roles', adminController.createJobRole);
router.put('/job-roles/:id', adminController.updateJobRole);
router.delete('/job-roles/:id', adminController.deleteJobRole);

// Resource Management
router.get('/resources', adminController.getResources);
router.post('/resources', adminController.createResource);
router.put('/resources/:id/approve', adminController.approveResource);
router.delete('/resources/:id', adminController.deleteResource);

module.exports = router;

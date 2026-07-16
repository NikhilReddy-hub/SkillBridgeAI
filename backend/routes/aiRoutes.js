const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// AI-specific rate limiting: 20 requests per 10 minutes per user
const aiRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: { success: false, message: 'Too many AI requests. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(protect);

// Skill Analysis
router.post('/analyze-skills', aiRateLimit, aiController.analyzeSkills);

// Roadmap Generation
router.post('/generate-roadmap', aiRateLimit, aiController.generateRoadmap);

// AI Chat
router.post('/chat', aiRateLimit, aiController.chat);
router.get('/chat/sessions', aiController.getChatSessions);
router.get('/chat/sessions/:sessionId', aiController.getChatSession);

// Interview Prep
router.get('/interview-tips', aiController.getInterviewTips);

// Resume Review
router.post('/resume-review', aiRateLimit, aiController.reviewResume);

module.exports = router;

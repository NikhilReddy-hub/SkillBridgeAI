const User = require('../models/User');
const UserSkill = require('../models/UserSkill');
const Roadmap = require('../models/Roadmap');
const Report = require('../models/Report');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');
const Achievement = require('../models/Achievement');
const { AppError, successResponse } = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const pdfService = require('../services/pdfService');
const achievementService = require('../services/achievementService');


// ─── GET STUDENT DASHBOARD ────────────────────────────────────────────────────
exports.getDashboard = catchAsync(async (req, res) => {
  const userId = req.user._id;

  // Parallel data fetch for performance
  const [user, skills, roadmap, report, recentProgress, notifications, achievements] =
    await Promise.all([
      User.findById(userId),
      UserSkill.find({ user: userId }),
      Roadmap.findOne({ user: userId }),
      Report.findOne({ user: userId, isLatest: true }),
      Progress.find({ user: userId }).sort({ weekStartDate: -1 }).limit(8),
      Notification.find({ user: userId, isRead: false }).limit(5),
      Achievement.find({ user: userId }).sort({ earnedAt: -1 }).limit(6),
    ]);

  // Build dashboard data
  const skillsByCategory = skills.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {});

  const weeklyProgressChart = recentProgress.reverse().map((p) => ({
    week: `W${p.weekNumber}`,
    hoursStudied: p.hoursStudied,
    readinessScore: p.readinessScore || 0,
    skillsLearned: p.skillsLearned.length,
  }));

  res.status(200).json({
    success: true,
    data: {
      user: {
        name: user.name,
        avatar: user.avatar,
        targetCareer: user.targetCareer,
        profileCompletion: user.profileCompletion,
        careerReadinessScore: user.careerReadinessScore,
        streak: user.streak,
      },
      stats: {
        totalSkills: skills.length,
        skillsByCategory,
        roadmapProgress: roadmap?.progressPercent || 0,
        completedWeeks: roadmap?.completedWeeks || 0,
        totalWeeks: roadmap?.totalWeeks || 0,
        reportScore: report?.careerReadinessScore || 0,
        skillMatchPercent: report?.skillMatchPercent || 0,
        achievements: achievements.length,
        projectsCompleted: user.totalProjectsCompleted,
        certificatesAdded: user.totalCertificatesAdded,
      },
      skillGapSummary: report
        ? {
            matchedSkills: report.matchedSkills,
            missingSkills: report.missingSkills?.slice(0, 5),
            strengthAreas: report.strengthAreas,
          }
        : null,
      roadmapSteps: roadmap?.steps
        ?.filter((s) => !s.isCompleted)
        ?.slice(0, 3)
        ?.map((s) => ({
          week: s.week,
          title: s.title,
          skills: s.skillNames,
          estimatedHours: s.estimatedHours,
        })) || [],
      weeklyProgressChart,
      notifications,
      achievements,
    },
  });
});

// ─── GET / UPDATE PROFILE ─────────────────────────────────────────────────────
exports.getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, data: { user } });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const allowedFields = [
    'name', 'bio', 'phone', 'college', 'branch', 'graduationYear', 'cgpa',
    'targetCareer', 'experienceLevel', 'githubProfile', 'linkedinProfile', 'portfolioUrl',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  // Recalculate profile completion
  user.calculateProfileCompletion();
  await user.save({ validateBeforeSave: false });

  // Award profile complete achievement
  if (user.profileCompletion === 100) {
    await achievementService.award(user._id, 'profile_complete');
  }

  successResponse(res, 200, 'Profile updated successfully.', { data: { user } });
});

// ─── SKILLS ───────────────────────────────────────────────────────────────────
exports.getSkills = catchAsync(async (req, res) => {
  const { category, proficiency } = req.query;
  const filter = { user: req.user._id };
  if (category) filter.category = category;
  if (proficiency) filter.proficiency = proficiency;

  const skills = await UserSkill.find(filter).sort({ category: 1, name: 1 });
  res.status(200).json({ success: true, count: skills.length, data: { skills } });
});

exports.addSkill = catchAsync(async (req, res, next) => {
  const { name, category, proficiency, selfRating, yearsOfExperience, projects, certifications } = req.body;

  if (!name) return next(new AppError('Skill name is required.', 400));

  const existing = await UserSkill.findOne({ user: req.user._id, name: name.trim() });
  if (existing) return next(new AppError(`You already have "${name}" in your skills.`, 409));

  const skill = await UserSkill.create({
    user: req.user._id,
    name: name.trim(),
    category: category || 'Other',
    proficiency: proficiency || 'beginner',
    selfRating,
    yearsOfExperience,
    projects,
    certifications,
    learningStatus: 'proficient',
  });

  // Update user stats
  await User.findByIdAndUpdate(req.user._id, { $inc: { totalSkillsAdded: 1 } });

  // Award first-skill achievement
  const skillCount = await UserSkill.countDocuments({ user: req.user._id });
  if (skillCount === 1) await achievementService.award(req.user._id, 'first_skill');
  if (skillCount === 10) await achievementService.award(req.user._id, 'skill_master');

  successResponse(res, 201, 'Skill added successfully.', { data: { skill } });
});

exports.updateSkill = catchAsync(async (req, res, next) => {
  const skill = await UserSkill.findOne({ _id: req.params.id, user: req.user._id });
  if (!skill) return next(new AppError('Skill not found.', 404));

  const allowedFields = ['proficiency', 'selfRating', 'yearsOfExperience', 'projects', 'certifications', 'notes', 'learningStatus'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) skill[field] = req.body[field];
  });
  await skill.save();

  successResponse(res, 200, 'Skill updated successfully.', { data: { skill } });
});

exports.deleteSkill = catchAsync(async (req, res, next) => {
  const skill = await UserSkill.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!skill) return next(new AppError('Skill not found.', 404));

  await User.findByIdAndUpdate(req.user._id, { $inc: { totalSkillsAdded: -1 } });

  successResponse(res, 200, 'Skill removed successfully.');
});

exports.bulkAddSkills = catchAsync(async (req, res, next) => {
  const { skills } = req.body; // Array of { name, category, proficiency }
  if (!Array.isArray(skills) || skills.length === 0) {
    return next(new AppError('Please provide an array of skills.', 400));
  }

  const ops = skills.map((s) => ({
    updateOne: {
      filter: { user: req.user._id, name: s.name?.trim() },
      update: { $setOnInsert: { user: req.user._id, ...s, name: s.name?.trim() } },
      upsert: true,
    },
  }));

  const result = await UserSkill.bulkWrite(ops);
  await User.findByIdAndUpdate(req.user._id, { $inc: { totalSkillsAdded: result.upsertedCount } });

  successResponse(res, 201, `${result.upsertedCount} skills added successfully.`);
});

// ─── UPLOAD RESUME ────────────────────────────────────────────────────────────
exports.uploadResume = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError('Please upload a PDF resume.', 400));

  // Extract text from PDF
  const resumeText = await pdfService.extractText(req.file.buffer);

  // Upload to Cloudinary (or save locally in dev)
  let resumeUrl = null;
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    resumeUrl = await pdfService.uploadToCloudinary(req.file.buffer, req.user._id);
  }

  // Save to user
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { resumeText, resumeUrl, ...(resumeUrl && { resumeUrl }) },
    { new: true }
  );

  // Award achievement
  await achievementService.award(req.user._id, 'resume_uploaded');

  // Recalculate profile completion
  user.calculateProfileCompletion();
  await user.save({ validateBeforeSave: false });

  successResponse(res, 200, 'Resume uploaded and processed successfully.', {
    data: { resumeUrl, textLength: resumeText.length },
  });
});

// ─── SKILL REPORT ─────────────────────────────────────────────────────────────
exports.getSkillReport = catchAsync(async (req, res) => {
  const report = await Report.findOne({ user: req.user._id, isLatest: true });
  if (!report) {
    return res.status(200).json({
      success: true,
      message: 'No skill report generated yet. Generate your roadmap to get started.',
      data: { report: null },
    });
  }
  res.status(200).json({ success: true, data: { report } });
});

// ─── PROGRESS ─────────────────────────────────────────────────────────────────
exports.getProgress = catchAsync(async (req, res) => {
  const progress = await Progress.find({ user: req.user._id })
    .sort({ weekStartDate: -1 })
    .limit(12);

  res.status(200).json({ success: true, count: progress.length, data: { progress } });
});

exports.updateProgress = catchAsync(async (req, res) => {
  const { weekNumber, hoursStudied, skillsLearned, projectsCompleted, notes, goals } = req.body;

  const weekStartDate = new Date();
  weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay()); // Monday
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  const progress = await Progress.findOneAndUpdate(
    { user: req.user._id, weekNumber: weekNumber || 1 },
    {
      user: req.user._id,
      weekNumber: weekNumber || 1,
      weekStartDate,
      weekEndDate,
      hoursStudied,
      skillsLearned,
      projectsCompleted,
      notes,
      goals,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Update roadmap step completion
  if (req.body.completedRoadmapWeek) {
    const roadmap = await Roadmap.findOne({ user: req.user._id });
    if (roadmap) {
      const step = roadmap.steps.find((s) => s.week === req.body.completedRoadmapWeek);
      if (step && !step.isCompleted) {
        step.isCompleted = true;
        step.completedAt = new Date();
        roadmap.completedWeeks += 1;
        roadmap.progressPercent = Math.round((roadmap.completedWeeks / roadmap.totalWeeks) * 100);
        await roadmap.save();

        // Award achievement
        if (roadmap.completedWeeks === 1) await achievementService.award(req.user._id, 'week_completed');
        if (roadmap.progressPercent >= 50) await achievementService.award(req.user._id, 'halfway');
        if (roadmap.progressPercent === 100) await achievementService.award(req.user._id, 'roadmap_completed');
      }
    }
  }

  successResponse(res, 200, 'Progress updated successfully.', { data: { progress } });
});

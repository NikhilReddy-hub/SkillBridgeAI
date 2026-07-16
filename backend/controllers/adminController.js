const User = require('../models/User');
const Skill = require('../models/Skill');
const JobRole = require('../models/JobRole');
const LearningResource = require('../models/LearningResource');
const Report = require('../models/Report');
const Roadmap = require('../models/Roadmap');
const UserSkill = require('../models/UserSkill');
const { AppError, successResponse } = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// ─── DASHBOARD ANALYTICS ──────────────────────────────────────────────────────
exports.getAnalytics = catchAsync(async (req, res) => {
  const [
    totalStudents,
    totalSkills,
    totalJobRoles,
    totalResources,
    totalRoadmaps,
    totalReports,
    recentStudents,
    topCareerChoices,
    avgReadinessScore,
    skillsByCategory,
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Skill.countDocuments({ isActive: true }),
    JobRole.countDocuments({ isActive: true }),
    LearningResource.countDocuments({ isApproved: true }),
    Roadmap.countDocuments(),
    Report.countDocuments(),
    User.find({ role: 'student' })
      .select('name email targetCareer careerReadinessScore createdAt')
      .sort({ createdAt: -1 })
      .limit(10),
    User.aggregate([
      { $match: { role: 'student', targetCareer: { $ne: null } } },
      { $group: { _id: '$targetCareer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    User.aggregate([
      { $match: { role: 'student', careerReadinessScore: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$careerReadinessScore' } } },
    ]),
    UserSkill.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalStudents,
        totalSkills,
        totalJobRoles,
        totalResources,
        totalRoadmaps,
        totalReports,
        avgReadinessScore: Math.round(avgReadinessScore[0]?.avg || 0),
      },
      recentStudents,
      topCareerChoices,
      skillsByCategory,
    },
  });
});

// ─── MANAGE USERS ──────────────────────────────────────────────────────────────
exports.getUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, role, search, targetCareer, sortBy = 'createdAt', order = 'desc' } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (targetCareer) filter.targetCareer = targetCareer;
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
    { college: { $regex: search, $options: 'i' } },
  ];

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -refreshToken -passwordResetToken')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    data: { users },
  });
});

exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password -refreshToken');
  if (!user) return next(new AppError('User not found.', 404));

  const [skills, roadmap, report] = await Promise.all([
    UserSkill.find({ user: user._id }),
    Roadmap.findOne({ user: user._id }),
    Report.findOne({ user: user._id, isLatest: true }),
  ]);

  res.status(200).json({ success: true, data: { user, skills, roadmap, report } });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { isActive, role } = req.body;
  const updates = {};
  if (isActive !== undefined) updates.isActive = isActive;
  if (role && ['student', 'admin'].includes(role)) updates.role = role;

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!user) return next(new AppError('User not found.', 404));

  successResponse(res, 200, 'User updated successfully.', { data: { user } });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError('User not found.', 404));

  // Cascade delete user data
  await Promise.all([
    UserSkill.deleteMany({ user: req.params.id }),
    Roadmap.deleteOne({ user: req.params.id }),
    Report.deleteMany({ user: req.params.id }),
  ]);

  successResponse(res, 200, 'User deleted successfully.');
});

// ─── MANAGE SKILLS (Master Catalog) ──────────────────────────────────────────
exports.getSkills = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, category, search } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };

  const [skills, total] = await Promise.all([
    Skill.find(filter)
      .sort({ priorityScore: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit)),
    Skill.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, count: skills.length, total, data: { skills } });
});

exports.createSkill = catchAsync(async (req, res) => {
  const skill = await Skill.create({ ...req.body, createdBy: req.user._id });
  successResponse(res, 201, 'Skill created successfully.', { data: { skill } });
});

exports.updateSkill = catchAsync(async (req, res, next) => {
  const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!skill) return next(new AppError('Skill not found.', 404));
  successResponse(res, 200, 'Skill updated successfully.', { data: { skill } });
});

exports.deleteSkill = catchAsync(async (req, res, next) => {
  const skill = await Skill.findByIdAndDelete(req.params.id);
  if (!skill) return next(new AppError('Skill not found.', 404));
  successResponse(res, 200, 'Skill deleted successfully.');
});

// ─── MANAGE JOB ROLES ────────────────────────────────────────────────────────
exports.getJobRoles = catchAsync(async (req, res) => {
  const roles = await JobRole.find({ isActive: true })
    .populate('requiredSkills.skill', 'name category')
    .sort({ title: 1 });
  res.status(200).json({ success: true, count: roles.length, data: { roles } });
});

exports.createJobRole = catchAsync(async (req, res) => {
  const role = await JobRole.create({ ...req.body, createdBy: req.user._id });
  successResponse(res, 201, 'Job role created.', { data: { role } });
});

exports.updateJobRole = catchAsync(async (req, res, next) => {
  const role = await JobRole.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!role) return next(new AppError('Job role not found.', 404));
  successResponse(res, 200, 'Job role updated.', { data: { role } });
});

exports.deleteJobRole = catchAsync(async (req, res, next) => {
  const role = await JobRole.findByIdAndDelete(req.params.id);
  if (!role) return next(new AppError('Job role not found.', 404));
  successResponse(res, 200, 'Job role deleted.');
});

// ─── MANAGE RESOURCES ─────────────────────────────────────────────────────────
exports.getResources = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, isApproved, type } = req.query;
  const filter = {};
  if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
  if (type) filter.type = type;

  const [resources, total] = await Promise.all([
    LearningResource.find(filter)
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit)),
    LearningResource.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, count: resources.length, total, data: { resources } });
});

exports.createResource = catchAsync(async (req, res) => {
  const resource = await LearningResource.create({
    ...req.body,
    submittedBy: req.user._id,
    isApproved: true, // Admin auto-approves
    approvedBy: req.user._id,
  });
  successResponse(res, 201, 'Resource created.', { data: { resource } });
});

exports.approveResource = catchAsync(async (req, res, next) => {
  const resource = await LearningResource.findByIdAndUpdate(
    req.params.id,
    { isApproved: true, approvedBy: req.user._id },
    { new: true }
  );
  if (!resource) return next(new AppError('Resource not found.', 404));
  successResponse(res, 200, 'Resource approved.', { data: { resource } });
});

exports.deleteResource = catchAsync(async (req, res, next) => {
  const resource = await LearningResource.findByIdAndDelete(req.params.id);
  if (!resource) return next(new AppError('Resource not found.', 404));
  successResponse(res, 200, 'Resource deleted.');
});

const UserSkill = require('../models/UserSkill');
const Skill = require('../models/Skill');
const JobRole = require('../models/JobRole');
const LearningResource = require('../models/LearningResource');
const catchAsync = require('../utils/catchAsync');

/**
 * Global search across skills, job roles, and resources.
 * Supports filters: type, category, difficulty
 */
exports.globalSearch = catchAsync(async (req, res) => {
  const { q, type, category, difficulty, page = 1, limit = 10 } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(200).json({ success: true, data: { results: [] } });
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const searchRegex = { $regex: q.trim(), $options: 'i' };

  const results = {};

  if (!type || type === 'skill') {
    const filter = { $or: [{ name: searchRegex }, { description: searchRegex }], isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    results.skills = await Skill.find(filter)
      .select('name category difficulty priorityScore icon estimatedHours')
      .limit(parseInt(limit))
      .skip(skip);
  }

  if (!type || type === 'role') {
    const roleFilter = {
      $or: [{ title: searchRegex }, { description: searchRegex }],
      isActive: true,
    };
    results.jobRoles = await JobRole.find(roleFilter)
      .select('title category demandLevel icon description')
      .limit(parseInt(limit))
      .skip(skip);
  }

  if (!type || type === 'resource') {
    const resFilter = {
      $or: [{ title: searchRegex }, { description: searchRegex }],
      isApproved: true,
    };
    if (difficulty) resFilter.difficulty = difficulty;

    results.resources = await LearningResource.find(resFilter)
      .select('title type difficulty estimatedHours url provider rating')
      .limit(parseInt(limit))
      .skip(skip);
  }

  res.status(200).json({ success: true, query: q, data: results });
});

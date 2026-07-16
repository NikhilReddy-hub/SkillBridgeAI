const Achievement = require('../models/Achievement');
const Notification = require('../models/Notification');

/**
 * Achievement definitions with metadata.
 * Time Complexity: O(1) lookup using a Map (DSA: HashMap)
 */
const ACHIEVEMENT_MAP = new Map([
  ['first_skill',       { title: '🎯 First Step',         description: 'Added your first skill', icon: '🎯', xp: 10 }],
  ['skill_master',      { title: '💪 Skill Master',        description: 'Added 10+ skills', icon: '💪', xp: 50 }],
  ['roadmap_started',   { title: '🗺️ Pathfinder',          description: 'Generated your first roadmap', icon: '🗺️', xp: 30 }],
  ['week_completed',    { title: '✅ Week Warrior',         description: 'Completed a roadmap week', icon: '✅', xp: 25 }],
  ['halfway',           { title: '⚡ Halfway There',        description: 'Reached 50% roadmap progress', icon: '⚡', xp: 75 }],
  ['roadmap_completed', { title: '🏆 Road Conqueror',       description: 'Completed your full roadmap!', icon: '🏆', xp: 200 }],
  ['streak_7',          { title: '🔥 7-Day Streak',         description: 'Active for 7 days in a row', icon: '🔥', xp: 40 }],
  ['streak_30',         { title: '💎 30-Day Streak',        description: '30 days of continuous learning!', icon: '💎', xp: 150 }],
  ['chat_explorer',     { title: '🤖 AI Explorer',          description: 'Had 10+ conversations with AI', icon: '🤖', xp: 20 }],
  ['resume_uploaded',   { title: '📄 Resume Ready',         description: 'Uploaded your resume', icon: '📄', xp: 15 }],
  ['profile_complete',  { title: '⭐ Profile Pro',           description: 'Completed 100% of your profile', icon: '⭐', xp: 30 }],
  ['top_learner',       { title: '🚀 Top Learner',          description: 'Career readiness > 80%', icon: '🚀', xp: 100 }],
  ['first_project',     { title: '🛠️ Builder',              description: 'Added your first project', icon: '🛠️', xp: 20 }],
  ['certificate_earner',{ title: '🎓 Certified',            description: 'Added a certification', icon: '🎓', xp: 35 }],
]);

/**
 * Award an achievement to a user.
 * Idempotent — won't duplicate if already awarded.
 * 
 * @param {ObjectId} userId
 * @param {string} type - Achievement type key
 */
exports.award = async (userId, type) => {
  try {
    const meta = ACHIEVEMENT_MAP.get(type);
    if (!meta) return;

    // Check if already awarded (prevent duplicates)
    const existing = await Achievement.findOne({ user: userId, type });
    if (existing) return;

    // Create achievement
    const achievement = await Achievement.create({
      user: userId,
      type,
      title: meta.title,
      description: meta.description,
      icon: meta.icon,
      xpEarned: meta.xp,
    });

    // Create notification for the achievement
    await Notification.create({
      user: userId,
      type: 'goal_completed',
      title: `Achievement Unlocked: ${meta.title}`,
      message: meta.description,
      icon: meta.icon,
      link: '/dashboard/achievements',
    });

    return achievement;
  } catch (err) {
    // Non-critical — don't crash request if achievement fails
    console.error('Achievement award error:', err.message);
  }
};

/**
 * Get all achievements for a user.
 * @param {ObjectId} userId
 */
exports.getUserAchievements = async (userId) => {
  return Achievement.find({ user: userId }).sort({ earnedAt: -1 });
};

/**
 * Get list of all possible achievements (for display purposes).
 */
exports.getAllAchievementTypes = () => {
  return Array.from(ACHIEVEMENT_MAP.entries()).map(([type, meta]) => ({
    type,
    ...meta,
  }));
};

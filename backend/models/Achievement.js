const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'first_skill',         // Added first skill
        'skill_master',        // 10+ skills added
        'roadmap_started',     // Generated first roadmap
        'week_completed',      // Completed a roadmap week
        'halfway',             // 50% roadmap progress
        'roadmap_completed',   // 100% roadmap done
        'streak_7',            // 7-day streak
        'streak_30',           // 30-day streak
        'chat_explorer',       // 10+ AI chats
        'resume_uploaded',     // Uploaded resume
        'profile_complete',    // 100% profile
        'top_learner',         // Top 10% readiness score
        'first_project',       // Added first project
        'certificate_earner',  // Added certification
      ],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    icon: { type: String }, // emoji or URL
    xpEarned: { type: Number, default: 0 },
    earnedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

achievementSchema.index({ user: 1, type: 1 });

const Achievement = mongoose.model('Achievement', achievementSchema);
module.exports = Achievement;

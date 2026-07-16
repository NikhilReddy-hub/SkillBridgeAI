const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ─── Weekly Log ───────────────────────────────────────────────────
    weekNumber: { type: Number, required: true },
    weekStartDate: { type: Date, required: true },
    weekEndDate: { type: Date, required: true },

    // ─── Activity ─────────────────────────────────────────────────────
    skillsLearned: [{ type: String }],
    hoursStudied: { type: Number, default: 0 },
    roadmapStepsCompleted: { type: Number, default: 0 },
    projectsCompleted: [{ type: String }],
    quizzesAttempted: { type: Number, default: 0 },
    quizzesPassed: { type: Number, default: 0 },

    // ─── Scores ───────────────────────────────────────────────────────
    readinessScore: { type: Number, min: 0, max: 100 }, // snapshot this week
    skillScore: { type: Number, min: 0, max: 100 },

    // ─── Badges/Achievements earned this week ────────────────────────
    achievementsEarned: [{ type: String }],
    goals: [
      {
        title: { type: String },
        isCompleted: { type: Boolean, default: false },
      },
    ],

    notes: { type: String },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
progressSchema.index({ user: 1, weekNumber: -1 });
progressSchema.index({ user: 1, weekStartDate: -1 });

const Progress = mongoose.model('Progress', progressSchema);
module.exports = Progress;

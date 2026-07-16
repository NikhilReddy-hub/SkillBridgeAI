const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetRole: { type: String, required: true },

    // ─── Skill Analysis ───────────────────────────────────────────────
    currentSkills: [{ type: String }],
    requiredSkills: [{ type: String }],
    missingSkills: [
      {
        name: { type: String },
        priority: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
        priorityScore: { type: Number }, // 1-100
        estimatedHours: { type: Number },
        category: { type: String },
        reason: { type: String },
      },
    ],
    matchedSkills: [{ type: String }],
    strengthAreas: [{ type: String }],
    improvementAreas: [{ type: String }],

    // ─── Scores ───────────────────────────────────────────────────────
    skillMatchPercent: { type: Number, min: 0, max: 100 },
    careerReadinessScore: { type: Number, min: 0, max: 100 },
    overallGrade: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'F'],
    },

    // ─── AI Summary ───────────────────────────────────────────────────
    summary: { type: String },       // AI-generated overall summary
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    actionPlan: [{ type: String }],  // top 5 action items

    // ─── Resume Feedback ──────────────────────────────────────────────
    resumeScore: { type: Number, min: 0, max: 100 },
    resumeFeedback: [{ type: String }],

    // ─── Meta ─────────────────────────────────────────────────────────
    aiModel: { type: String, default: 'gemini-1.5-flash' },
    isLatest: { type: Boolean, default: true }, // only one is "current" per user
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
reportSchema.index({ user: 1, createdAt: -1 });
reportSchema.index({ user: 1, isLatest: 1 });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;

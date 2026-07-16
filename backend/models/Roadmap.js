const mongoose = require('mongoose');

const roadmapStepSchema = new mongoose.Schema({
  week: { type: Number, required: true }, // Week number (1, 2, 3...)
  title: { type: String, required: true },
  description: { type: String },
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  skillNames: [{ type: String }], // denormalized for fast access
  resources: [
    {
      title: { type: String },
      url: { type: String },
      type: { type: String, enum: ['documentation', 'youtube', 'article', 'course', 'practice'] },
    },
  ],
  projects: [{ type: String }], // project names/descriptions
  estimatedHours: { type: Number, default: 10 },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  notes: { type: String },
});

const roadmapSchema = new mongoose.Schema(
  {
    // ─── Ownership ────────────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one roadmap per user
    },
    targetRole: { type: String, required: true },
    jobRole: { type: mongoose.Schema.Types.ObjectId, ref: 'JobRole' },

    // ─── AI-Generated Content ─────────────────────────────────────────
    title: { type: String },
    overview: { type: String }, // AI-generated overview paragraph
    totalWeeks: { type: Number, default: 12 },
    steps: [roadmapStepSchema],

    // ─── Skill Analysis ───────────────────────────────────────────────
    currentSkills: [{ type: String }],
    missingSkills: [
      {
        skill: { type: String },
        priority: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
        estimatedHours: { type: Number },
        reason: { type: String },
      },
    ],
    strengthAreas: [{ type: String }],

    // ─── Recommendations ──────────────────────────────────────────────
    projectRecommendations: [
      {
        title: { type: String },
        description: { type: String },
        skills: [{ type: String }],
        difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
        estimatedDays: { type: Number },
        githubTopics: [{ type: String }],
      },
    ],
    certificationRecommendations: [
      {
        name: { type: String },
        provider: { type: String },
        url: { type: String },
        cost: { type: String },
        duration: { type: String },
      },
    ],
    interviewTips: [{ type: String }],
    resumeSuggestions: [{ type: String }],

    // ─── Progress ─────────────────────────────────────────────────────
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    completedWeeks: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    estimatedCompletionDate: { type: Date },

    // ─── Meta ─────────────────────────────────────────────────────────
    aiModel: { type: String, default: 'gemini-1.5-flash' },
    generatedAt: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
roadmapSchema.index({ user: 1 });
roadmapSchema.index({ targetRole: 1 });

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
module.exports = Roadmap;

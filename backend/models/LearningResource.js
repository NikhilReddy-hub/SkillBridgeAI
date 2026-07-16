const mongoose = require('mongoose');

/**
 * LearningResource — master catalog of curated learning resources
 * that can be linked to skills or recommended independently.
 */
const learningResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, maxlength: 1000 },
    url: { type: String, required: true },
    type: {
      type: String,
      enum: ['documentation', 'youtube', 'article', 'course', 'practice', 'book', 'podcast'],
      required: true,
    },
    provider: { type: String }, // e.g., "Coursera", "MDN", "YouTube"
    author: { type: String },
    thumbnail: { type: String },

    // ─── Associations ─────────────────────────────────────────────────
    skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
    skillNames: [{ type: String }], // denormalized
    jobRoles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JobRole' }],

    // ─── Metadata ─────────────────────────────────────────────────────
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    estimatedHours: { type: Number, default: 5 },
    isPremium: { type: Boolean, default: false },
    isFree: { type: Boolean, default: true },
    language: { type: String, default: 'English' },
    tags: [{ type: String }],

    // ─── Rating ───────────────────────────────────────────────────────
    rating: { type: Number, min: 0, max: 5, default: 0 },
    totalRatings: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },

    // ─── Admin ────────────────────────────────────────────────────────
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
learningResourceSchema.index({ title: 'text', description: 'text', tags: 'text' });
learningResourceSchema.index({ type: 1 });
learningResourceSchema.index({ difficulty: 1 });
learningResourceSchema.index({ isApproved: 1, isActive: 1 });
learningResourceSchema.index({ skills: 1 });

const LearningResource = mongoose.model('LearningResource', learningResourceSchema);
module.exports = LearningResource;

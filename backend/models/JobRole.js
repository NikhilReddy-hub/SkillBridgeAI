const mongoose = require('mongoose');

const jobRoleSchema = new mongoose.Schema(
  {
    // ─── Core ─────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Job role title is required'],
      unique: true,
      trim: true,
    },
    slug: { type: String, lowercase: true },
    description: { type: String, maxlength: 2000 },
    icon: { type: String }, // emoji
    category: {
      type: String,
      enum: ['Development', 'Data', 'Cloud', 'Security', 'Mobile', 'AI/ML'],
    },
    industry: { type: String, default: 'Technology' },

    // ─── Required Skills ──────────────────────────────────────────────
    requiredSkills: [
      {
        skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
        importance: { type: String, enum: ['must-have', 'good-to-have', 'optional'], default: 'must-have' },
        minimumLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
        weightage: { type: Number, default: 1, min: 1, max: 10 }, // used for scoring
      },
    ],

    // ─── Market Info ──────────────────────────────────────────────────
    averageSalary: {
      entry: { type: String }, // e.g. "4-6 LPA"
      mid: { type: String },   // e.g. "8-15 LPA"
      senior: { type: String }, // e.g. "18-40 LPA"
    },
    demandLevel: { type: String, enum: ['low', 'medium', 'high', 'very-high'], default: 'high' },
    growthRate: { type: String }, // "35% YoY"

    // ─── Interview Prep ───────────────────────────────────────────────
    interviewTopics: [{ type: String }],
    commonCompanies: [{ type: String }],

    // ─── Admin ────────────────────────────────────────────────────────
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    totalStudents: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
jobRoleSchema.index({ title: 'text', description: 'text' });
jobRoleSchema.index({ category: 1 });
jobRoleSchema.index({ demandLevel: 1 });

jobRoleSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

const JobRole = mongoose.model('JobRole', jobRoleSchema);
module.exports = JobRole;

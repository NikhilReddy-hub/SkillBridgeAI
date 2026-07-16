const mongoose = require('mongoose');

/**
 * UserSkill — represents a single skill entry for a specific user.
 * Separate from the master Skill catalog to track user-specific proficiency.
 */
const userSkillSchema = new mongoose.Schema(
  {
    // ─── Ownership ────────────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ─── Skill Reference ──────────────────────────────────────────────
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }, // optional ref to master skill
    name: { type: String, required: true, trim: true }, // free-text skill name
    category: {
      type: String,
      enum: [
        'Programming Language',
        'Framework',
        'Database',
        'Cloud',
        'DevOps',
        'AI/ML',
        'Soft Skill',
        'Tool',
        'Cyber Security',
        'Mobile',
        'Other',
      ],
      default: 'Other',
    },

    // ─── Proficiency ──────────────────────────────────────────────────
    proficiency: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
    },
    selfRating: { type: Number, min: 1, max: 10, default: 5 },
    yearsOfExperience: { type: Number, default: 0, min: 0 },

    // ─── Evidence ─────────────────────────────────────────────────────
    projects: [{ type: String }],      // project names using this skill
    certifications: [{ type: String }], // certs earned
    isVerified: { type: Boolean, default: false }, // AI-verified

    // ─── Progress ─────────────────────────────────────────────────────
    learningStatus: {
      type: String,
      enum: ['not-started', 'learning', 'proficient', 'mastered'],
      default: 'proficient',
    },
    targetProficiency: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    },

    notes: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

// ─── Compound Index ───────────────────────────────────────────────────────────
userSkillSchema.index({ user: 1, name: 1 }, { unique: true });
userSkillSchema.index({ user: 1, category: 1 });

const UserSkill = mongoose.model('UserSkill', userSkillSchema);
module.exports = UserSkill;

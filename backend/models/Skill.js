const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['documentation', 'youtube', 'article', 'course', 'practice'],
    required: true,
  },
  title: { type: String, required: true },
  url: { type: String, required: true },
  isPremium: { type: Boolean, default: false },
  estimatedHours: { type: Number, default: 0 },
});

const skillSchema = new mongoose.Schema(
  {
    // ─── Core Info ────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: { type: String, maxlength: 1000 },
    icon: { type: String }, // emoji or icon URL
    category: {
      type: String,
      required: true,
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
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    estimatedHours: { type: Number, default: 20 },

    // ─── Dependency Graph (DSA: Graph) ───────────────────────────────
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
    dependents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }], // skills that depend on this

    // ─── Priority (DSA: Priority Queue) ──────────────────────────────
    priorityScore: { type: Number, default: 0 }, // higher = more important

    // ─── Job Role Association ─────────────────────────────────────────
    jobRoles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JobRole' }],

    // ─── Learning Resources ───────────────────────────────────────────
    resources: [resourceSchema],

    // ─── Admin ────────────────────────────────────────────────────────
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    totalStudents: { type: Number, default: 0 }, // students studying this
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
skillSchema.index({ name: 'text', description: 'text' }); // full-text search
skillSchema.index({ category: 1 });
skillSchema.index({ difficulty: 1 });
skillSchema.index({ priorityScore: -1 });
skillSchema.index({ slug: 1 }, { unique: true, sparse: true });

// ─── Pre-save: auto-generate slug ─────────────────────────────────────────────
skillSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

const Skill = mongoose.model('Skill', skillSchema);
module.exports = Skill;

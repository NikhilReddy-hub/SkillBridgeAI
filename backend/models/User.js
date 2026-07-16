const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    // ─── Authentication ───────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },

    // ─── Profile ─────────────────────────────────────────────────────
    avatar: { type: String, default: null },
    bio: { type: String, maxlength: 500 },
    phone: { type: String },
    college: { type: String },
    branch: { type: String },
    graduationYear: { type: Number },
    cgpa: { type: Number, min: 0, max: 10 },

    // ─── Career ──────────────────────────────────────────────────────
    targetCareer: {
      type: String,
      enum: [
        'Frontend Developer',
        'Backend Developer',
        'Full Stack Developer',
        'Data Analyst',
        'Data Scientist',
        'Java Developer',
        'Python Developer',
        'Cloud Engineer',
        'DevOps Engineer',
        'AI Engineer',
        'Cyber Security',
        'Mobile Developer',
      ],
      default: null,
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },

    // ─── Resume & Links ───────────────────────────────────────────────
    resumeUrl: { type: String, default: null },
    resumeText: { type: String, default: null }, // extracted text from PDF
    githubProfile: { type: String },
    linkedinProfile: { type: String },
    portfolioUrl: { type: String },

    // ─── Progress ─────────────────────────────────────────────────────
    profileCompletion: { type: Number, default: 0, min: 0, max: 100 },
    careerReadinessScore: { type: Number, default: 0, min: 0, max: 100 },
    totalSkillsAdded: { type: Number, default: 0 },
    totalProjectsCompleted: { type: Number, default: 0 },
    totalCertificatesAdded: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },

    // ─── Auth Tokens ─────────────────────────────────────────────────
    refreshToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    // ─── Status ───────────────────────────────────────────────────────
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ targetCareer: 1 });
userSchema.index({ careerReadinessScore: -1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────
userSchema.virtual('skills', {
  ref: 'Skill',
  localField: '_id',
  foreignField: 'user',
});

userSchema.virtual('roadmap', {
  ref: 'Roadmap',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});

// ─── Pre-save Hook ────────────────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Methods ──────────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

userSchema.methods.calculateProfileCompletion = function () {
  const fields = [
    this.name,
    this.email,
    this.bio,
    this.phone,
    this.college,
    this.branch,
    this.graduationYear,
    this.targetCareer,
    this.resumeUrl,
    this.githubProfile,
    this.linkedinProfile,
  ];
  const filled = fields.filter(Boolean).length;
  this.profileCompletion = Math.round((filled / fields.length) * 100);
  return this.profileCompletion;
};

const User = mongoose.model('User', userSchema);
module.exports = User;

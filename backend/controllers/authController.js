const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { AppError, successResponse } = require('../utils/AppError');
const { sendTokenResponse, generateAccessToken } = require('../utils/tokenUtils');
const catchAsync = require('../utils/catchAsync');
const emailService = require('../services/emailService');

// ─── REGISTER ─────────────────────────────────────────────────────────────────
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Prevent admin self-registration
  const assignedRole = role === 'admin' ? 'student' : (role || 'student');

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('An account with this email already exists.', 409));
  }

  const user = await User.create({ name, email, password, role: assignedRole });

  // Create welcome notification
  await Notification.create({
    user: user._id,
    type: 'profile_incomplete',
    title: 'Welcome to SkillBridge AI! 🚀',
    message: 'Complete your profile and select a target career to get started.',
    icon: '🎉',
    link: '/dashboard/profile',
  });

  sendTokenResponse(user, 201, res, 'Account created successfully! Welcome to SkillBridge AI.');
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }

  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Contact support.', 401));
  }

  // Update last login
  user.lastLogin = new Date();
  user.lastActiveDate = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, 'Logged in successfully.');
});

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
exports.logout = catchAsync(async (req, res) => {
  // Clear refresh token in DB
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  successResponse(res, 200, 'Logged out successfully.');
});

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
exports.refreshToken = catchAsync(async (req, res, next) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (!token) {
    return next(new AppError('No refresh token provided.', 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return next(new AppError('Invalid or expired refresh token. Please log in again.', 401));
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    return next(new AppError('User not found or account deactivated.', 401));
  }

  const newAccessToken = generateAccessToken(user._id, user.role);

  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully.',
    accessToken: newAccessToken,
  });
});

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError('Please provide an email address.', 400));

  const user = await User.findOne({ email });
  // Don't reveal if user exists
  if (!user) {
    return successResponse(res, 200, 'If an account with that email exists, a reset link has been sent.');
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await emailService.sendPasswordReset(user.email, user.name, resetURL);
    successResponse(res, 200, 'Password reset link sent to your email.');
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Failed to send email. Please try again later.', 500));
  }
});

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Password reset token is invalid or has expired.', 400));
  }

  if (!req.body.password || req.body.password.length < 8) {
    return next(new AppError('Password must be at least 8 characters.', 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successful. You are now logged in.');
});

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
exports.getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, data: { user } });
});

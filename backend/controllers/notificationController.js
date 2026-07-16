const Notification = require('../models/Notification');
const { successResponse } = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// ─── GET NOTIFICATIONS ────────────────────────────────────────────────────────
exports.getNotifications = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const filter = { user: req.user._id };
  if (unreadOnly === 'true') filter.isRead = false;

  const [notifications, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit)),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
  ]);

  res.status(200).json({
    success: true,
    count: notifications.length,
    unreadCount,
    data: { notifications },
  });
});

// ─── MARK AS READ ─────────────────────────────────────────────────────────────
exports.markAsRead = catchAsync(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true, readAt: new Date() }
  );
  successResponse(res, 200, 'Notification marked as read.');
});

// ─── MARK ALL AS READ ─────────────────────────────────────────────────────────
exports.markAllAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  successResponse(res, 200, 'All notifications marked as read.');
});

// ─── DELETE NOTIFICATION ──────────────────────────────────────────────────────
exports.deleteNotification = catchAsync(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  successResponse(res, 200, 'Notification deleted.');
});

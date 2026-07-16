const mongoose = require('mongoose');
const socketIO = require('../utils/socketIO');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'roadmap_reminder',
        'goal_completed',
        'new_resource',
        'profile_incomplete',
        'skill_added',
        'report_ready',
        'streak_milestone',
        'weekly_summary',
        'admin_message',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    icon: { type: String },
    link: { type: String },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });

// ─── Real-time Push Hook ───────────────────────────────────────────────────────
notificationSchema.post('save', function (doc) {
  socketIO.emitToUser(doc.user, 'new_notification', {
    _id: doc._id,
    type: doc.type,
    title: doc.title,
    message: doc.message,
    icon: doc.icon,
    link: doc.link,
    isRead: doc.isRead,
    createdAt: doc.createdAt,
  });
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;

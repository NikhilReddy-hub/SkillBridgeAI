const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionTitle: { type: String, default: 'New Chat' },
    messages: [chatMessageSchema],
    context: {
      targetRole: { type: String },
      currentSkills: [{ type: String }],
      roadmapStep: { type: Number },
    },
    isActive: { type: Boolean, default: true },
    messageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
chatHistorySchema.index({ user: 1, createdAt: -1 });

// ─── Update message count on save ─────────────────────────────────────────────
chatHistorySchema.pre('save', function (next) {
  this.messageCount = this.messages.length;
  // Auto-title from first user message
  if (this.messages.length === 1 && this.messages[0].role === 'user') {
    this.sessionTitle = this.messages[0].content.substring(0, 60);
  }
  next();
});

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
module.exports = ChatHistory;

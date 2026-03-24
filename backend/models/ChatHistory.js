const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  created_at: { type: Date, default: Date.now },
});

chatHistorySchema.index({ user_id: 1, created_at: -1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);

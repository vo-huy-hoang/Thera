const mongoose = require('mongoose');

const notificationTokenSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  token: { type: String, required: true },
  platform: { type: String, enum: ['ios', 'android'], required: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('NotificationToken', notificationTokenSchema);

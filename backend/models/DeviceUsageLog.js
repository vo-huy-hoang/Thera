const mongoose = require('mongoose');

const deviceUsageLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pain_log_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PainLog' },
  device_level: { type: Number, required: true, min: 1, max: 6 },
  duration_minutes: { type: Number, required: true },
  started_at: { type: Date, required: true },
  completed_at: { type: Date },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DeviceUsageLog', deviceUsageLogSchema);

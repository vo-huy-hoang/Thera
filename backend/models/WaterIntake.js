const mongoose = require('mongoose');

const waterIntakeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  // Local date key from client, format YYYY-MM-DD
  date: { type: String, required: true },
  cups: { type: Number, default: 0, min: 0, max: 50 },
  goal: { type: Number, default: 8, min: 1, max: 50 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

waterIntakeSchema.index({ user_id: 1, date: 1 }, { unique: true });

waterIntakeSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('WaterIntake', waterIntakeSchema);

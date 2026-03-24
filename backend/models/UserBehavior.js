const mongoose = require('mongoose');

const userBehaviorSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  total_workouts: { type: Number, default: 0 },
  streak_days: { type: Number, default: 0 },
  favorite_exercises: [{ type: String }],
  avoided_exercises: [{ type: String }],
  avg_session_duration: { type: Number, default: 0 },
  last_workout_at: { type: Date },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserBehavior', userBehaviorSchema);

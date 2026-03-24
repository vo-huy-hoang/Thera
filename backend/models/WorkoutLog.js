const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exercise_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutPlan' },
  day_number: { type: Number },
  started_at: { type: Date, default: Date.now },
  completed_at: { type: Date },
  is_completed: { type: Boolean, default: false },
  skipped: { type: Boolean, default: false },
  feedback: { type: String, enum: ['better', 'same', 'worse', null], default: null },
  duration_seconds: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

workoutLogSchema.index({ user_id: 1, created_at: -1 });
workoutLogSchema.index({ user_id: 1, plan_id: 1 });

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);

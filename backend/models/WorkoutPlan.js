const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  duration_days: { type: Number, required: true },
  target_area: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  thumbnail_url: { type: String, default: '' },
  is_pro: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);

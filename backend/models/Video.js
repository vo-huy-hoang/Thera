const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  workout_plan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutPlan',
    required: true,
    index: true,
  },
  // Day number in the plan: 1..14 (or more for other plans)
  order: { type: Number, required: true, min: 1, max: 365 },
  link: { type: String, required: true, trim: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

videoSchema.index({ workout_plan_id: 1, order: 1 }, { unique: true });

videoSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('Video', videoSchema);

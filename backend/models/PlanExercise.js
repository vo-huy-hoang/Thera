const mongoose = require('mongoose');

const planExerciseSchema = new mongoose.Schema({
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutPlan', required: true },
  exercise_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  day_number: { type: Number, required: true },
  order_in_day: { type: Number, required: true },
});

planExerciseSchema.index({ plan_id: 1, day_number: 1, order_in_day: 1 });

module.exports = mongoose.model('PlanExercise', planExerciseSchema);

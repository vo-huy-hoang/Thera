const mongoose = require('mongoose');

const workoutFeedbackSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workout_log_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutLog', required: true },
  feeling: { type: String, enum: ['good', 'neutral', 'bad', null], default: null },
  skip_reason: { type: String, enum: ['do_later', 'just_looking', 'too_hard', 'too_easy', 'distracted', 'other', null], default: null },
  comment: { type: String, default: '' },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('WorkoutFeedback', workoutFeedbackSchema);

const mongoose = require('mongoose');

const dailyRecommendationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  nutrition_advice: { type: String, required: true },
  sport_advice: { type: String, required: true },
  device_level: { type: Number },
  device_duration: { type: Number },
  created_at: { type: Date, default: Date.now },
});

dailyRecommendationSchema.index({ user_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyRecommendation', dailyRecommendationSchema);

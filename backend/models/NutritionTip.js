const mongoose = require('mongoose');

const nutritionTipSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  content: { type: String, required: true },
  category: { type: String, default: 'general' },
  target_area: { type: String, enum: ['neck', 'back', 'both', null], default: null },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('NutritionTip', nutritionTipSchema);

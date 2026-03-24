const mongoose = require('mongoose');

const healthTipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  target_area: { type: String },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('HealthTip', healthTipSchema);

const mongoose = require('mongoose');

const painLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  pain_areas: { type: mongoose.Schema.Types.Mixed, default: {} }, // { neck: 5, back: 3 }
  pain_level: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  created_at: { type: Date, default: Date.now },
});

painLogSchema.index({ user_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('PainLog', painLogSchema);

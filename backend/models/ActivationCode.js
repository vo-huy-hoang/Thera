const mongoose = require('mongoose');

const activationCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  is_used: { type: Boolean, default: false },
  used_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  used_at: { type: Date },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ActivationCode', activationCodeSchema);

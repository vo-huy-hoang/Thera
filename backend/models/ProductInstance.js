const mongoose = require('mongoose');

const productInstanceSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  activation_code: { type: String, required: true, unique: true, index: true },
  is_activated: { type: Boolean, default: false },
  activated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  activated_at: { type: Date },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ProductInstance', productInstanceSchema);

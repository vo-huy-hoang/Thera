const mongoose = require('mongoose');

const productAssessmentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    default: '',
    trim: true,
    maxlength: 1000,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, {
  collection: 'product_assessments',
});

productAssessmentSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

productAssessmentSchema.pre('save', function updateTimestamp(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('ProductAssessment', productAssessmentSchema);

const mongoose = require('mongoose');

const postureSchema = new mongoose.Schema({
  category: { type: String, required: true, trim: true },
  image_url: { type: String, required: true, trim: true },
  image_urls: {
    type: [String],
    default: [],
    validate: {
      validator(value) {
        return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && item.trim());
      },
      message: 'image_urls phải có ít nhất 1 URL ảnh hợp lệ',
    },
  },
  is_correct: { type: Boolean, required: true, default: true },
  description: { type: String, required: true, trim: true },
  sort_order: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

postureSchema.pre('validate', function syncPrimaryImage(next) {
  if ((!Array.isArray(this.image_urls) || this.image_urls.length === 0) && this.image_url) {
    this.image_urls = [this.image_url];
  }

  if (Array.isArray(this.image_urls) && this.image_urls.length > 0) {
    this.image_urls = this.image_urls
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
    this.image_url = this.image_urls[0];
  }

  next();
});

postureSchema.pre('save', function updateTimestamp(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('Posture', postureSchema);

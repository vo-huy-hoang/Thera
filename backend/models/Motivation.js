const mongoose = require('mongoose');

const motivationSchema = new mongoose.Schema({
  authorName: { type: String, trim: true, default: 'Khách hàng' },
  image: { type: String, trim: true, default: '' },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  content: { type: String, trim: true, default: '' },
  image_url: { type: String, required: true, trim: true },
  star: { type: Number, required: true, min: 1, max: 5, default: 5 },
  message: { type: String, required: true, trim: true },
  badge: { type: String, trim: true, default: '' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

motivationSchema.pre('save', function(next) {
  if (!this.image && this.image_url) this.image = this.image_url;
  if ((!this.rating || this.rating < 1) && this.star) this.rating = this.star;
  if (!this.content && this.message) this.content = this.message;
  if (!this.image_url && this.image) this.image_url = this.image;
  if ((!this.star || this.star < 1) && this.rating) this.star = this.rating;
  if (!this.message && this.content) this.message = this.content;
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('Motivation', motivationSchema);

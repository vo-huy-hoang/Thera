const express = require('express');
const router = express.Router();
const Motivation = require('../models/Motivation');
const { protect, adminOnly } = require('../middleware/auth');

const buildPayload = (body = {}) => {
  const image = typeof body.image === 'string' ? body.image.trim() : '';
  const imageUrl = typeof body.image_url === 'string' ? body.image_url.trim() : '';
  const rating = body.rating !== undefined ? Number(body.rating) : Number(body.star);
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  return {
    authorName: typeof body.authorName === 'string' ? body.authorName.trim() : 'Khách hàng',
    image: image || imageUrl,
    rating,
    content: content || message,
    image_url: imageUrl || image,
    star: rating,
    message: message || content,
    badge: typeof body.badge === 'string' ? body.badge.trim() : '',
  };
};

const serializeItem = (item) => ({
  id: item._id.toString(),
  authorName: item.authorName || 'Khách hàng',
  image: item.image || item.image_url,
  rating: item.rating || item.star,
  content: item.content || item.message,
  image_url: item.image_url || item.image,
  star: item.star || item.rating,
  message: item.message || item.content,
  badge: item.badge || '',
  created_at: item.created_at,
  updated_at: item.updated_at,
});

const validatePayload = (payload) => {
  if (!payload.image_url) return 'Thiếu image';
  if (!payload.message) return 'Thiếu content';
  if (!Number.isInteger(payload.star) || payload.star < 1 || payload.star > 5) {
    return 'Rating phải từ 1 đến 5';
  }
  return null;
};

// GET /api/motivations
router.get('/', protect, async (req, res) => {
  try {
    const items = await Motivation.find({}).sort({ created_at: -1 });
    res.json(items.map(serializeItem));
  } catch (error) {
    console.error('Get motivations error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/motivations/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const item = await Motivation.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Không tìm thấy' });
    res.json(serializeItem(item));
  } catch (error) {
    console.error('Get motivation detail error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/motivations
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const payload = buildPayload(req.body);
    const validationError = validatePayload(payload);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const item = await Motivation.create(payload);
    res.status(201).json(serializeItem(item));
  } catch (error) {
    console.error('Create motivation error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// PUT /api/motivations/:id
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const payload = buildPayload(req.body);
    const validationError = validatePayload(payload);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    payload.updated_at = new Date();

    const item = await Motivation.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!item) return res.status(404).json({ error: 'Không tìm thấy' });
    res.json(serializeItem(item));
  } catch (error) {
    console.error('Update motivation error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// DELETE /api/motivations/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await Motivation.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Không tìm thấy' });
    res.json({ message: 'Đã xóa' });
  } catch (error) {
    console.error('Delete motivation error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Motivation = require('../models/Motivation');

const serializeReview = (item) => ({
  id: item._id.toString(),
  authorName: item.authorName || 'Khách hàng',
  image: item.image || item.image_url,
  rating: item.rating || item.star,
  content: item.content || item.message,
  badge: item.badge || undefined,
});

// GET /api/reviews
router.get('/', async (req, res) => {
  try {
    const items = await Motivation.find({}).sort({ created_at: -1 });
    res.json(items.map(serializeReview));
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;

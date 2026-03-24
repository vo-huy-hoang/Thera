const express = require('express');
const router = express.Router();
const KnowledgeBase = require('../models/KnowledgeBase');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/knowledge
router.get('/', protect, async (req, res) => {
  try {
    const { category, limit } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    
    let query = KnowledgeBase.find(filter).sort({ created_at: -1 });
    if (limit) query = query.limit(parseInt(limit));
    
    const items = await query;
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/knowledge
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const item = await KnowledgeBase.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// PUT /api/knowledge/:id
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await KnowledgeBase.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Không tìm thấy' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// DELETE /api/knowledge/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await KnowledgeBase.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;

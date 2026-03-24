const express = require('express');
const router = express.Router();
const AiPrompt = require('../models/AiPrompt');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/ai-prompts - Get all prompts
router.get('/', protect, async (req, res) => {
  try {
    const { prompt_type, is_active } = req.query;
    const filter = {};
    if (prompt_type) filter.prompt_type = prompt_type;
    if (is_active !== undefined) filter.is_active = is_active === 'true';
    
    const prompts = await AiPrompt.find(filter).sort({ prompt_type: 1 });
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// PUT /api/ai-prompts/:id - Update prompt (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const prompt = await AiPrompt.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: new Date() },
      { new: true }
    );
    if (!prompt) return res.status(404).json({ error: 'Không tìm thấy prompt' });
    res.json(prompt);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;

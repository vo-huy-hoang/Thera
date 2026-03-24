const express = require('express');
const router = express.Router();
const PainLog = require('../models/PainLog');
const { protect } = require('../middleware/auth');

// GET /api/pain-logs - Get pain logs for user
router.get('/', protect, async (req, res) => {
  try {
    const { days, date } = req.query;
    const filter = { user_id: req.user._id };

    if (date) {
      filter.date = date;
    } else if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      filter.date = { $gte: startDate.toISOString().split('T')[0] };
    }

    const logs = await PainLog.find(filter).sort({ date: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/pain-logs/today
router.get('/today', protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const log = await PainLog.findOne({ user_id: req.user._id, date: today });
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/pain-logs - Create or update pain log (upsert by user_id + date)
router.post('/', protect, async (req, res) => {
  try {
    const data = { ...req.body, user_id: req.user._id };
    const log = await PainLog.findOneAndUpdate(
      { user_id: req.user._id, date: data.date },
      data,
      { new: true, upsert: true, runValidators: true }
    );
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// PUT /api/pain-logs/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const log = await PainLog.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      req.body,
      { new: true }
    );
    if (!log) return res.status(404).json({ error: 'Không tìm thấy' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;

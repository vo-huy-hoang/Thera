const express = require('express');
const router = express.Router();
const WorkoutFeedback = require('../models/WorkoutFeedback');
const ChatHistory = require('../models/ChatHistory');
const DailyRecommendation = require('../models/DailyRecommendation');
const DeviceUsageLog = require('../models/DeviceUsageLog');
const HealthTip = require('../models/HealthTip');
const NutritionTip = require('../models/NutritionTip');
const NotificationToken = require('../models/NotificationToken');
const { protect } = require('../middleware/auth');

// === Workout Feedback ===
router.post('/workout-feedback', protect, async (req, res) => {
  try {
    const feedback = await WorkoutFeedback.create({
      ...req.body,
      user_id: req.user._id,
    });
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.get('/workout-feedback', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const feedbacks = await WorkoutFeedback.find({ user_id: req.user._id })
      .populate({
        path: 'workout_log_id',
        populate: { path: 'exercise_id' }
      })
      .sort({ created_at: -1 })
      .limit(limit);
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// === Chat History ===
router.get('/chat-history', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const messages = await ChatHistory.find({ user_id: req.user._id })
      .sort({ created_at: -1 })
      .limit(limit);
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.post('/chat-history', protect, async (req, res) => {
  try {
    const message = await ChatHistory.create({
      ...req.body,
      user_id: req.user._id,
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.delete('/chat-history', protect, async (req, res) => {
  try {
    await ChatHistory.deleteMany({ user_id: req.user._id });
    res.json({ message: 'Đã xóa lịch sử chat' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// === Daily Recommendations ===
router.get('/daily-recommendations', protect, async (req, res) => {
  try {
    const { date } = req.query;
    const filter = { user_id: req.user._id };
    if (date) filter.date = date;
    
    const recs = await DailyRecommendation.find(filter).sort({ date: -1 }).limit(7);
    res.json(recs);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.post('/daily-recommendations', protect, async (req, res) => {
  try {
    const data = { ...req.body, user_id: req.user._id };
    const rec = await DailyRecommendation.findOneAndUpdate(
      { user_id: req.user._id, date: data.date },
      data,
      { new: true, upsert: true }
    );
    res.json(rec);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// === Device Usage Logs ===
router.post('/device-usage', protect, async (req, res) => {
  try {
    const log = await DeviceUsageLog.create({
      ...req.body,
      user_id: req.user._id,
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.get('/device-usage', protect, async (req, res) => {
  try {
    const logs = await DeviceUsageLog.find({ user_id: req.user._id })
      .sort({ created_at: -1 })
      .limit(30);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// === Health Tips ===
router.get('/health-tips', protect, async (req, res) => {
  try {
    const { category, limit } = req.query;
    const filter = {};
    if (category) filter.category = category;
    
    let query = HealthTip.find(filter);
    if (limit) query = query.limit(parseInt(limit));
    
    const tips = await query;
    res.json(tips);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// === Nutrition Tips ===
router.get('/nutrition-tips', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const tips = await NutritionTip.find().limit(limit);
    res.json(tips);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// === Notification Tokens ===
router.post('/notification-token', protect, async (req, res) => {
  try {
    const token = await NotificationToken.findOneAndUpdate(
      { user_id: req.user._id },
      { ...req.body, user_id: req.user._id },
      { new: true, upsert: true }
    );
    res.json(token);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;

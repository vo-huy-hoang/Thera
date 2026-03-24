const express = require('express');
const router = express.Router();
const User = require('../models/User');
const WorkoutLog = require('../models/WorkoutLog');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/users/stats - Dashboard stats (admin)
// CRITICAL: This route MUST come before /:id to prevent Express treating 'stats' as an ID
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalExercises = (await require('../models/Exercise').countDocuments());
    
    const today = new Date().toISOString().split('T')[0];
    const todayWorkouts = await WorkoutLog.countDocuments({
      completed_at: { $gte: new Date(today) }
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = await WorkoutLog.distinct('user_id', {
      completed_at: { $gte: sevenDaysAgo }
    });

    res.json({
      totalUsers,
      totalExercises,
      todayWorkouts,
      activeUsers: activeUsers.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/users - Get all users (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().sort({ created_at: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// PUT /api/users/:id/devices - Update user devices (admin)
router.put('/:id/devices', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { owned_devices: req.body.owned_devices },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'Không tìm thấy user' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;

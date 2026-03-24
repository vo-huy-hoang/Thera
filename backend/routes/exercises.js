const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');
const WorkoutLog = require('../models/WorkoutLog');
const UserBehavior = require('../models/UserBehavior');
const { protect } = require('../middleware/auth');

// GET /api/exercises - Get all exercises (with filters)
router.get('/', protect, async (req, res) => {
  try {
    const { category, is_pro, pain_areas } = req.query;
    const filter = {};

    if (category && category !== 'all') filter.category = category;
    if (is_pro !== undefined) filter.is_pro = is_pro === 'true';

    if (pain_areas) {
      const areas = pain_areas.split(',');
      filter.category = { $in: areas };
    }

    const exercises = await Exercise.find(filter).sort({ order_index: 1 });
    res.json(exercises);
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/exercises/:id - Get exercise by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ error: 'Không tìm thấy bài tập' });
    res.json(exercise);
  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/exercises - Create exercise (admin)
router.post('/', protect, async (req, res) => {
  try {
    const exercise = await Exercise.create(req.body);
    res.status(201).json(exercise);
  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// PUT /api/exercises/:id - Update exercise (admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!exercise) return res.status(404).json({ error: 'Không tìm thấy bài tập' });
    res.json(exercise);
  } catch (error) {
    console.error('Update exercise error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// DELETE /api/exercises/:id - Delete exercise (admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!exercise) return res.status(404).json({ error: 'Không tìm thấy bài tập' });
    res.json({ message: 'Đã xóa bài tập' });
  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/exercises/workout-log - Log a workout
router.post('/workout-log', protect, async (req, res) => {
  try {
    const log = await WorkoutLog.create({
      ...req.body,
      user_id: req.user._id,
    });
    res.status(201).json(log);
  } catch (error) {
    console.error('Create workout log error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// PUT /api/exercises/workout-log/:id - Update workout log
router.put('/workout-log/:id', protect, async (req, res) => {
  try {
    const log = await WorkoutLog.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      req.body,
      { new: true }
    );
    if (!log) return res.status(404).json({ error: 'Không tìm thấy log' });
    res.json(log);
  } catch (error) {
    console.error('Update workout log error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/exercises/workout-history/:userId - Get workout history
router.get('/workout-history/:userId', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const logs = await WorkoutLog.find({ user_id: req.params.userId })
      .populate('exercise_id')
      .sort({ created_at: -1 })
      .limit(limit);
    
    // Transform to match Supabase response format
    const data = logs.map(log => ({
      ...log.toObject(),
      exercise: log.exercise_id,
    }));

    res.json(data);
  } catch (error) {
    console.error('Get workout history error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/exercises/user-behavior/:userId - Get user behavior
router.get('/user-behavior/:userId', protect, async (req, res) => {
  try {
    let behavior = await UserBehavior.findOne({ user_id: req.params.userId });

    if (!behavior) {
      behavior = await UserBehavior.create({
        user_id: req.params.userId,
        total_workouts: 0,
        streak_days: 0,
        favorite_exercises: [],
        avoided_exercises: [],
        avg_session_duration: 0,
      });
    }

    res.json(behavior);
  } catch (error) {
    console.error('Get user behavior error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;

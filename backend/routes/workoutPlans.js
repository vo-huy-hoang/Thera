const express = require('express');
const router = express.Router();
const WorkoutPlan = require('../models/WorkoutPlan');
const PlanExercise = require('../models/PlanExercise');
const WorkoutLog = require('../models/WorkoutLog');
const { protect } = require('../middleware/auth');

// GET /api/workout-plans
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.is_pro !== undefined) filter.is_pro = req.query.is_pro === 'true';
    const plans = await WorkoutPlan.find(filter).sort({ duration_days: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/workout-plans/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Không tìm thấy plan' });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/workout-plans
router.post('/', protect, async (req, res) => {
  try {
    const plan = await WorkoutPlan.create(req.body);
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// PUT /api/workout-plans/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const plan = await WorkoutPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ error: 'Không tìm thấy plan' });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// DELETE /api/workout-plans/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await PlanExercise.deleteMany({ plan_id: req.params.id });
    const plan = await WorkoutPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Không tìm thấy plan' });
    res.json({ message: 'Đã xóa' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/workout-plans/:id/exercises
router.get('/:id/exercises', protect, async (req, res) => {
  try {
    const planExercises = await PlanExercise.find({ plan_id: req.params.id })
      .populate('exercise_id')
      .sort({ day_number: 1, order_in_day: 1 });
    
    const data = planExercises.map(pe => ({
      ...pe.toObject(),
      exercise: pe.exercise_id,
    }));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/workout-plans/:id/exercises - Replace all exercises for a plan
router.post('/:id/exercises', protect, async (req, res) => {
  try {
    // Delete old exercises first (important for edit flow)
    await PlanExercise.deleteMany({ plan_id: req.params.id });
    
    const exercises = req.body.exercises || req.body;
    const planExercises = (Array.isArray(exercises) ? exercises : [exercises]).map(e => ({
      ...e,
      plan_id: req.params.id,
    }));
    const result = await PlanExercise.insertMany(planExercises);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/workout-plans/:planId/progress/:userId
router.get('/:planId/progress/:userId', protect, async (req, res) => {
  try {
    const logs = await WorkoutLog.find({
      user_id: req.params.userId,
      plan_id: req.params.planId,
      is_completed: true,
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;

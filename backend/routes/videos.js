const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Video = require('../models/Video');
const WorkoutPlan = require('../models/WorkoutPlan');
const { protect, adminOnly } = require('../middleware/auth');

const buildPayload = (body = {}) => ({
  workout_plan_id: body.workout_plan_id,
  order: Number(body.order),
  link: typeof body.link === 'string' ? body.link.trim() : '',
});

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validatePayload = async (payload) => {
  if (!payload.workout_plan_id || !isValidObjectId(payload.workout_plan_id)) {
    return 'workout_plan_id không hợp lệ';
  }
  if (!Number.isInteger(payload.order) || payload.order < 1 || payload.order > 365) {
    return 'order phải là số nguyên từ 1 đến 365';
  }
  if (!payload.link) {
    return 'Thiếu link video';
  }
  const plan = await WorkoutPlan.findById(payload.workout_plan_id).select('_id');
  if (!plan) {
    return 'Không tìm thấy workout plan';
  }
  return null;
};

// GET /api/videos?planId=<workout_plan_id>
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.planId && isValidObjectId(req.query.planId)) {
      filter.workout_plan_id = req.query.planId;
    }

    const items = await Video.find(filter)
      .populate('workout_plan_id', 'title target_area duration_days')
      .sort({ workout_plan_id: 1, order: 1 });

    res.json(items);
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/videos/resolve?planId=<id>&order=<day>
// Returns one video for plan/day, or null if not found.
router.get('/resolve', protect, async (req, res) => {
  try {
    const { planId, order } = req.query;
    const day = Number(order);

    if (!planId || !isValidObjectId(planId)) {
      return res.status(400).json({ error: 'planId không hợp lệ' });
    }
    if (!Number.isInteger(day) || day < 1) {
      return res.status(400).json({ error: 'order không hợp lệ' });
    }

    const item = await Video.findOne({ workout_plan_id: planId, order: day })
      .populate('workout_plan_id', 'title target_area duration_days');

    res.json(item || null);
  } catch (error) {
    console.error('Resolve video error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/videos/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const item = await Video.findById(req.params.id).populate(
      'workout_plan_id',
      'title target_area duration_days'
    );
    if (!item) return res.status(404).json({ error: 'Không tìm thấy video' });
    res.json(item);
  } catch (error) {
    console.error('Get video detail error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/videos
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const payload = buildPayload(req.body);
    const validationError = await validatePayload(payload);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const item = await Video.create(payload);
    res.status(201).json(item);
  } catch (error) {
    console.error('Create video error:', error);
    if (error && error.code === 11000) {
      return res.status(409).json({ error: 'Ngày này đã có video trong lộ trình' });
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// PUT /api/videos/:id
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const payload = buildPayload(req.body);
    const validationError = await validatePayload(payload);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    payload.updated_at = new Date();

    const item = await Video.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!item) return res.status(404).json({ error: 'Không tìm thấy video' });
    res.json(item);
  } catch (error) {
    console.error('Update video error:', error);
    if (error && error.code === 11000) {
      return res.status(409).json({ error: 'Ngày này đã có video trong lộ trình' });
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// DELETE /api/videos/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await Video.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Không tìm thấy video' });
    res.json({ message: 'Đã xóa' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;

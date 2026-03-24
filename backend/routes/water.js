const express = require('express');
const router = express.Router();
const WaterIntake = require('../models/WaterIntake');
const { protect } = require('../middleware/auth');

const DEFAULT_GOAL = 8;

function toDateKey(input) {
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }
  return new Date().toISOString().slice(0, 10);
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(dateKey, offset) {
  const d = parseDateKey(dateKey);
  d.setUTCDate(d.getUTCDate() + offset);
  return formatDateKey(d);
}

router.get('/today', protect, async (req, res) => {
  try {
    const date = toDateKey(req.query.date);
    const doc = await WaterIntake.findOne({ user_id: req.user._id, date });

    res.json({
      date,
      cups: doc?.cups ?? 0,
      goal: doc?.goal ?? DEFAULT_GOAL,
    });
  } catch (error) {
    console.error('Get today water error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.put('/today', protect, async (req, res) => {
  try {
    const date = toDateKey(req.body.date);
    const cupsInput = Number(req.body.cups);
    const goalInput =
      req.body.goal !== undefined ? Number(req.body.goal) : undefined;

    if (Number.isNaN(cupsInput)) {
      return res.status(400).json({ error: 'cups không hợp lệ' });
    }

    const safeGoal = goalInput !== undefined ? Math.max(1, Math.min(50, goalInput)) : undefined;
    const effectiveGoal = safeGoal ?? DEFAULT_GOAL;
    const safeCups = Math.max(0, Math.min(effectiveGoal, cupsInput));

    const updates = {
      cups: safeCups,
      updated_at: new Date(),
    };
    if (safeGoal !== undefined) updates.goal = safeGoal;

    const doc = await WaterIntake.findOneAndUpdate(
      { user_id: req.user._id, date },
      { $set: updates, $setOnInsert: { created_at: new Date(), goal: DEFAULT_GOAL } },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      date: doc.date,
      cups: doc.cups,
      goal: doc.goal,
    });
  } catch (error) {
    console.error('Update today water error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.post('/increment', protect, async (req, res) => {
  try {
    const date = toDateKey(req.body.date);
    const delta = Number(req.body.delta);
    const goalInput =
      req.body.goal !== undefined ? Number(req.body.goal) : undefined;

    if (Number.isNaN(delta) || delta === 0) {
      return res.status(400).json({ error: 'delta không hợp lệ' });
    }

    let doc = await WaterIntake.findOne({ user_id: req.user._id, date });
    if (!doc) {
      doc = await WaterIntake.create({
        user_id: req.user._id,
        date,
        cups: 0,
        goal: goalInput ? Math.max(1, Math.min(50, goalInput)) : DEFAULT_GOAL,
      });
    } else if (goalInput !== undefined) {
      doc.goal = Math.max(1, Math.min(50, goalInput));
    }

    doc.cups = Math.max(0, Math.min(doc.goal, doc.cups + delta));
    doc.updated_at = new Date();
    await doc.save();

    // Debug log to verify exactly where water data is persisted
    console.log('[water/increment]', {
      dbName: WaterIntake.db?.name,
      user_id: String(req.user._id),
      date: doc.date,
      cups: doc.cups,
      goal: doc.goal,
      delta,
      updated_at: doc.updated_at,
    });

    res.json({
      date: doc.date,
      cups: doc.cups,
      goal: doc.goal,
    });
  } catch (error) {
    console.error('Increment water error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.get('/week', protect, async (req, res) => {
  try {
    const endDate = toDateKey(req.query.date);
    const startDate = addDays(endDate, -6);

    const docs = await WaterIntake.find({
      user_id: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    const byDate = new Map(docs.map((d) => [d.date, d]));
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(startDate, i);
      const found = byDate.get(date);
      days.push({
        date,
        cups: found?.cups ?? 0,
        goal: found?.goal ?? DEFAULT_GOAL,
      });
    }

    const averageCups =
      days.reduce((sum, item) => sum + item.cups, 0) / days.length;

    res.json({
      range: { start: startDate, end: endDate },
      days,
      average_cups: Number(averageCups.toFixed(1)),
    });
  } catch (error) {
    console.error('Get week water error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;

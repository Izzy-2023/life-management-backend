const express = require('express');
const Habit = require('../models/Habit');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create a habit
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, frequency } = req.body;
        const habit = new Habit({ user: req.user.id, name, frequency });
        await habit.save();
        res.json(habit);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all habits for a user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const habits = await Habit.find({ user: req.user.id });
        res.json(habits);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark habit as completed for a date
router.put('/:id/complete', authMiddleware, async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);
        if (!habit) return res.status(404).json({ error: 'Habit not found' });

        if (habit.user.toString() !== req.user.id) return res.status(401).json({ error: 'Unauthorized' });

        habit.completedDates.push(new Date());
        await habit.save();

        res.json(habit);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

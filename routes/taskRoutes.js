const express = require('express');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new task
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, dueDate } = req.body;
        const task = new Task({ user: req.user.id, title, description, dueDate });
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all tasks for a user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({ dueDate: 1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a task (mark as completed)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });

        if (task.user.toString() !== req.user.id) return res.status(401).json({ error: 'Unauthorized' });

        task.completed = req.body.completed ?? task.completed;
        task.title = req.body.title ?? task.title;
        task.description = req.body.description ?? task.description;
        await task.save();

        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a task
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });

        if (task.user.toString() !== req.user.id) return res.status(401).json({ error: 'Unauthorized' });

        await task.remove();
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

const express = require('express');
const JournalEntry = require('../models/JournalEntry');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create a journal entry
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;
        const entry = new JournalEntry({ user: req.user.id, title, content });
        await entry.save();
        res.json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all journal entries for a user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const entries = await JournalEntry.find({ user: req.user.id }).sort({ date: -1 });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a journal entry
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const entry = await JournalEntry.findById(req.params.id);
        if (!entry) return res.status(404).json({ error: 'Entry not found' });

        if (entry.user.toString() !== req.user.id) return res.status(401).json({ error: 'Unauthorized' });

        await entry.remove();
        res.json({ message: 'Entry deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

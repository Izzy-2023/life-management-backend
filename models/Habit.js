const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
    completedDates: [Date], // Stores dates when the habit was completed
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Habit', HabitSchema);

const mongoose = require('mongoose');

const JournalEntrySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: String,
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('JournalEntry', JournalEntrySchema);

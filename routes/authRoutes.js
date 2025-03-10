const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/emailService');

const router = express.Router();

// Register
router.post('/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });

        const user = new User({ name, email, password: hashedPassword, verificationToken });
        await user.save();

        await sendVerificationEmail(email, verificationToken);

        res.json({ message: 'User registered. Please verify your email.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Verify Email
router.get('/verify/:token', async (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
        const user = await User.findOneAndUpdate(
            { email: decoded.email },
            { isVerified: true, verificationToken: null }
        );

        if (!user) return res.status(400).json({ error: 'Invalid token' });
        res.json({ message: 'Email verified successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Token expired or invalid' });
    }
});

// Login
router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found' });
        if (!user.isVerified) return res.status(400).json({ error: 'Email not verified' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        await sendResetPasswordEmail(email, resetToken);
        res.json({ message: 'Password reset email sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body;
    try {
        const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });

        if (!user || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ error: 'Token expired or invalid' });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Token expired or invalid' });
    }
});

module.exports = router;

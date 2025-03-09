const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendVerificationEmail = async (email, token) => {
    const link = `${process.env.CLIENT_URL}/verify/${token}`;
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email',
        text: `Click the link to verify your email: ${link}`,
    });
};

const sendResetPasswordEmail = async (email, token) => {
    const link = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset Your Password',
        text: `Click the link to reset your password: ${link}`,
    });
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail };


const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendOtpEmail = async (toEmail, otp) => {
    try {
        const mailOptions = {
            from: `"LSP Service" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Verify Your LSP Account - OTP Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #3182ce; text-align: center;">Welcome to LSP!</h2>
                    <p>Thank you for signing up. Please use the following One-Time Password (OTP) to verify your account:</p>
                    <div style="background-color: #f7fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2d3748;">${otp}</span>
                    </div>
                    <p style="color: #718096; font-size: 14px;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="text-align: center; color: #a0aec0; font-size: 12px;">&copy; 2026 Local Service Provider Inc.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] OTP sent to ${toEmail}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('[EMAIL ERROR]', error);
        return false;
    }
};

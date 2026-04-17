const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'local.serviceprovider001@gmail.com',
        pass: 'lvpu akzv chea lfpg'
    }
});

const sendEmail = async (to, subject, text, html) => {
    const mailOptions = {
        from: '"Local Service Provider" <local.serviceprovider001@gmail.com>',
        to,
        subject,
        text,
        html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Email error:', error);
        throw error;
    }
};

const sendOTPEmail = async (to, otp) => {
    const subject = 'Email Verification OTP - Local Service Provider';
    const text = `Your OTP for registration is ${otp}. It will expire in 10 minutes.`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">Email Verification</h2>
            <p>Hello,</p>
            <p>Thank you for registering with Local Service Provider. Please use the following One-Time Password (OTP) to verify your email address:</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
                ${otp}
            </div>
            <p>This OTP will expire in 10 minutes. If you did not request this, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #888; text-align: center;">© 2026 Local Service Provider. All rights reserved.</p>
        </div>
    `;
    return sendEmail(to, subject, text, html);
};

const sendApprovalEmail = async (to, name) => {
    const subject = 'Account Approved - Local Service Provider';
    const text = `Congratulations ${name}! Your account has been approved by our admin. You can now login and start offering your services.`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #28a745; text-align: center;">Account Approved!</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Congratulations! Your partner account has been approved by our administrator.</p>
            <p>You can now log in to your dashboard and start managing your services and bookings.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Your Account</a>
            </div>
            <p>If you have any questions, feel free to contact our support team.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #888; text-align: center;">© 2026 Local Service Provider. All rights reserved.</p>
        </div>
    `;
    return sendEmail(to, subject, text, html);
};

const sendBookingConfirmationEmail = async (to, bookingDetails) => {
    const { id, service_name, booking_date, booking_time, total_cost } = bookingDetails;
    const subject = `Booking Confirmed - #${id}`;
    const text = `Your booking for ${service_name} on ${booking_date} at ${booking_time} has been confirmed. Total Cost: £${total_cost}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">Booking Confirmation</h2>
            <p>Hello,</p>
            <p>Your booking has been successfully created. Here are the details:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Booking ID:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">#${id}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Service:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${service_name}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Date:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking_date}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Time:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking_time}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Total Cost:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">£${total_cost}</td>
                </tr>
            </table>
            <p>The service professional will be notified and will contact you if needed.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #888; text-align: center;">© 2026 Local Service Provider. All rights reserved.</p>
        </div>
    `;
    return sendEmail(to, subject, text, html);
};

const sendNewBookingRequestEmail = async (to, bookingDetails) => {
    const { id, service_name, booking_date, booking_time, user_name } = bookingDetails;
    const subject = `New Booking Request - #${id}`;
    const text = `You have a new booking request for ${service_name} from ${user_name} on ${booking_date} at ${booking_time}.`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">New Booking Request</h2>
            <p>Hello,</p>
            <p>You have received a new booking request. Please review the details below:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Booking ID:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">#${id}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Customer:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${user_name}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Service:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${service_name}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Date:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking_date}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Time:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking_time}</td>
                </tr>
            </table>
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Booking in Dashboard</a>
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #888; text-align: center;">© 2026 Local Service Provider. All rights reserved.</p>
        </div>
    `;
    return sendEmail(to, subject, text, html);
};

module.exports = {
    sendOTPEmail,
    sendApprovalEmail,
    sendBookingConfirmationEmail,
    sendNewBookingRequestEmail,
    sendEmail
};

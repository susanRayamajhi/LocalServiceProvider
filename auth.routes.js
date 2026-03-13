module.exports = app => {
    const router = require('express').Router();
    const users = require('../controllers/user.controller.js');

    // Signup
    router.post('/signup', users.signup);

    // Login
    router.post('/login', users.login);

    // OTP Verification
    router.post('/verify-otp', users.verifyOtp);

    app.use('/api/auth', router);
};

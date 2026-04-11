const auth = require('../controllers/auth.controller.js');

module.exports = router => {
    // Signup
    router.post('/api/auth/signup', auth.signup);
    router.post('/api/partners/signup', auth.partnerSignup);

    // Login (Decoupled for each role)
    router.post('/api/auth/login', auth.customerLogin); // Customer login
    router.post('/api/partners/login', auth.partnerLogin); // Partner login
    router.post('/api/admin/login', auth.adminLogin); // Admin login

    // OTP Verification
    router.post('/api/auth/verify-otp', auth.verifyOtp);
};

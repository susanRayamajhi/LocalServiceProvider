module.exports = app => {
    const router = require('express').Router();
    const partners = require('../controllers/partner.controller.js');

    router.post('/signup', partners.signup);
    router.post('/login', partners.login);

    // Other API routes
    router.get('/:id', partners.getProfile);
    router.put('/:id', partners.updateProfile);
    router.post('/bookings/:id/accept', partners.acceptBooking);
    router.post('/bookings/:id/reject', partners.rejectBooking);
    router.post('/bookings/:bookingId/status/:status', partners.updateBookingStatus);
    router.post('/withdraw', partners.requestWithdrawal);

    app.use('/api/partners', router);
};

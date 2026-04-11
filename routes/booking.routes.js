const booking = require('../controllers/booking.controller.js');
const { isAuthenticated } = require('../middleware/auth.middleware');

module.exports = router => {
    // UI Routes
    router.get('/bookings', isAuthenticated, booking.listMyBookings);
    router.get('/bookings/:id/details', isAuthenticated, booking.getBookingDetails);
    router.get('/bookings/:id/payment', isAuthenticated, booking.getPaymentPage);
    router.get('/feedback/:bookingId', isAuthenticated, booking.getFeedbackPage);

    // Action Routes
    router.post('/api/bookings/create', isAuthenticated, booking.createBooking);
    router.post('/api/bookings/:id/pay', isAuthenticated, booking.processPayment);
    router.post('/api/bookings/:id/cancel', isAuthenticated, booking.cancelBooking);
    router.post('/api/bookings/feedback', isAuthenticated, booking.submitFeedback);
};

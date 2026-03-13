module.exports = app => {
    const router = require('express').Router();
    const admin = require('../controllers/admin.controller.js');
    const { verifyToken } = require('../middleware/authJwt');

    // Public route for admin login
    router.post('/login', admin.login);

    // Apply verifyToken middleware to all routes below this line
    router.use(verifyToken);

    // Get all users
    router.get('/users', admin.getAllUsers);

    // Get all partners
    router.get('/partners', admin.getAllPartners);

    // Update partner details (includes approval, description, pricing)
    router.put('/partners/:id', admin.updatePartner);

    // Approve partner
    router.put('/partners/approve/:id', admin.approvePartner);

    // Manage service categories
    router.post('/services', admin.createService);
    router.put('/services/:id', admin.updateService);
    router.delete('/services/:id', admin.deleteService);

    // Get all bookings
    router.get('/bookings', admin.getAllBookings);

    // Cancel booking
    router.put('/bookings/cancel/:id', admin.cancelBooking);

    // Update booking status
    router.put('/bookings/:id/status', admin.updateBookingStatus);

    app.use('/api/admin', router);
};

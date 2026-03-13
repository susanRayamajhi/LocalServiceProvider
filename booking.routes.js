module.exports = app => {
    const router = require('express').Router();
    const bookings = require('../controllers/booking.controller.js');
    const { verifyToken } = require('../middleware/authJwt');

    // Apply verifyToken middleware to all routes in this router
    router.use(verifyToken);

    // Create a new booking
    router.post('/', bookings.create);

    // Get a booking by id
    router.get('/:id', bookings.getById);

    // Cancel a booking
    router.put('/cancel/:id', bookings.cancel);

    app.use('/api/bookings', router);
};

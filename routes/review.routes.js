module.exports = app => {
    const router = require('express').Router();
    const reviews = require('../controllers/review.controller.js');
    const { verifyToken } = require('../middleware/authJwt');

    // Apply verifyToken middleware
    router.use(verifyToken);

    // Create a new review
    router.post('/', reviews.create);

    // Get review by bookingId
    router.get('/booking/:bookingId', reviews.getByBookingId);

    app.use('/api/reviews', router);
};

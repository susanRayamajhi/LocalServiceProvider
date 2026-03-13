module.exports = app => {
    const router = require('express').Router();
    const profile = require('../controllers/profile.controller.js');
    const { verifyToken } = require('../middleware/authJwt');

    // Apply verifyToken middleware to all routes in this router
    router.use(verifyToken);

    // Get user profile
    router.get('/:id', profile.getProfile);

    // Update user profile
    router.put('/:id', profile.updateProfile);

    // Get user addresses
    router.get('/:id/addresses', profile.getAddresses);

    // Add user address
    router.post('/:id/addresses', profile.addAddress);

    // Update user address
    router.put('/addresses/:id', profile.updateAddress);

    // Delete user address
    router.delete('/addresses/:id', profile.deleteAddress);

    // Get user bookings
    router.get('/:id/bookings', profile.getBookings);

    app.use('/api/profile', router);
};

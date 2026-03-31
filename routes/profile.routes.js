module.exports = app => {
    const router = require('express').Router();
    const profile = require('../controllers/profile.controller.js');

    // Simple middleware to check if user is logged in
    const isLoggedIn = (req, res, next) => {
        if (req.session.uid) next();
        else res.status(401).send({ message: "Unauthorized!" });
    };

    router.use(isLoggedIn);

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

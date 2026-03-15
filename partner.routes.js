module.exports = app => {
    const router = require('express').Router();
    const partners = require('../controllers/partner.controller.js');
    const partnerAvailability = require('../controllers/partner_availability.controller.js'); // New import
    const { verifyToken } = require('../middleware/authJwt');

    // Public routes (no token required)
    
    router.post('/signup', partners.signup);
    router.post('/login', partners.login);

    // Protected routes (token required)
    router.use(verifyToken); // All routes below this line will require a token

    // Get partner profile
    router.get('/:id', partners.getProfile);

    // Update partner profile
    router.put('/:id', partners.updateProfile);

    // Accept booking
    router.put('/bookings/:id/accept', partners.acceptBooking);

    // Reject booking
    
    router.put('/bookings/:id/reject', partners.rejectBooking);

    // Partner Availability Routes
    router.post('/availability', partnerAvailability.create); // Create availability
    router.get('/availability', partnerAvailability.findAllByPartner); // Get all availability for partner
    router.get('/availability/:id', partnerAvailability.findOne); // Get single availability
    router.put('/availability/:id', partnerAvailability.update); // Update availability
    router.delete('/availability/:id', partnerAvailability.delete); // Delete availability

    app.use('/api/partners', router);
};

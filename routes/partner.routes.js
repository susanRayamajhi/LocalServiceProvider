module.exports = app => {
    const router = require('express').Router();
    const partners = require('../controllers/partner.controller.js');
    const partnerAvailability = require('../controllers/partner_availability.controller.js');
    const partnerDocuments = require('../controllers/partner_document.controller.js');
    const partnerServices = require('../controllers/partner_service.controller.js');
    const { verifyToken } = require('../middleware/authJwt');

    // Public routes (no token required)
    router.get('/', partners.search);
    router.post('/signup', partners.signup);
    router.post('/verify-otp', partners.verifyOtp);
    router.post('/login', partners.login);
    router.get('/:partnerId/availability', partnerAvailability.getAvailabilityByPartnerId);

    // Protected routes (token required)
    router.use(verifyToken); // All routes below this line will require a token

    // Get partner profile
    router.get('/:id', partners.getProfile);

    // Get partner bookings
    router.get('/:id/bookings', partners.getBookings);

    // Update partner profile
    router.put('/:id', partners.updateProfile);

    // Unified Booking Status Actions
    router.put('/bookings/:id/accept', partners.updateBookingStatus);
    router.put('/bookings/:id/reject', partners.updateBookingStatus);
    router.put('/bookings/:id/status', partners.updateBookingStatus);

    // Partner Availability Routes
    router.post('/availability', partnerAvailability.create); // Create availability
    router.get('/availability', partnerAvailability.findAllByPartner); // Get all availability for partner
    router.get('/availability/:id', partnerAvailability.findOne); // Get single availability
    router.put('/availability/:id', partnerAvailability.update); // Update availability
    router.delete('/availability/:id', partnerAvailability.delete); // Delete availability

    // Partner Document Routes
    router.post('/documents/upload', partnerDocuments.uploadDocument);
    router.get('/documents/my', partnerDocuments.getPartnerDocuments);

    // Partner Service Management
    router.post('/services', partnerServices.addService);
    router.get('/services/my', partnerServices.getMyServices);
    router.delete('/services/:id', partnerServices.deleteService);

    app.use('/api/partners', router);
};

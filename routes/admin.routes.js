module.exports = app => {
    const router = require('express').Router();
    const admin = require('../controllers/admin.controller.js');
    const partnerDocuments = require('../controllers/partner_document.controller.js');
    const { verifyToken, isAdmin } = require('../middleware/authJwt');

    // Public route for admin login
    router.post('/login', admin.login);

    // Apply verifyToken AND isAdmin middleware to all routes below this line
    router.use(verifyToken);
    router.use(isAdmin);

    // Get all users
    router.get('/users', admin.getAllUsers);
    router.put('/users/:id/suspend', admin.toggleUserSuspension);

    // Get all partners
    router.get('/partners', admin.getAllPartners);
    router.get('/partners/:id', admin.getPartnerById);
    router.put('/partners/:id/suspend', admin.togglePartnerSuspension);

    // Update partner details (includes approval, description, pricing)
    router.put('/partners/:id', admin.updatePartner);

    // Approve partner
    router.put('/partners/approve/:id', admin.approvePartner);

    // Reject partner
    router.put('/partners/reject/:id', admin.rejectPartner);

    // Manage service categories
    router.get('/categories', admin.getAllCategories);
    router.post('/categories', admin.createCategory);
    router.put('/categories/:id', admin.updateCategory);
    router.delete('/categories/:id', admin.deleteCategory);

    // Manage service categories (legacy/existing if any)
    router.post('/services', admin.createService);
    router.put('/services/:id', admin.updateService);
    router.delete('/services/:id', admin.deleteService);

    // Get all bookings
    router.get('/bookings', admin.getAllBookings);

    // Cancel booking
    router.put('/bookings/cancel/:id', admin.cancelBooking);

    // Update booking status
    router.put('/bookings/:id/status', admin.updateBookingStatus);

    // Withdrawal Management
    router.get('/withdrawals', admin.getAllWithdrawals);
    router.put('/withdrawals/:id/status', admin.updateWithdrawalStatus);

    // Dispute Management
    router.get('/disputes', admin.getAllDisputes);
    router.put('/disputes/:id/status', admin.updateDisputeStatus);

    // Payment Tracking
    router.get('/payments', admin.getAllPayments);
    router.get('/payments/summary', admin.getFinancialSummary);

    // Analytics
    router.get('/analytics', admin.getAnalytics);

    // Partner Document Verification
    router.get('/partners/:id/documents', partnerDocuments.getPartnerDocuments);
    router.post('/partners/documents/verify', partnerDocuments.verifyDocument);

    app.use('/api/admin', router);
};

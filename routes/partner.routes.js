const partner = require('../controllers/partner.controller.js');
const { isAuthenticated, requireRole } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

module.exports = router => {
    // UI Routes
    router.get('/partner/dashboard', isAuthenticated, requireRole('partner'), partner.getDashboard);
    router.get('/partner/bookings', isAuthenticated, requireRole('partner'), partner.getBookings);
    router.get('/partner/availability', isAuthenticated, requireRole('partner'), partner.getAvailability);
    router.get('/partner/earnings', isAuthenticated, requireRole('partner'), partner.getEarnings);
    router.get('/partner/withdraw', isAuthenticated, requireRole('partner'), (req, res) => {
        res.render("partner/withdrawal", { title: 'Withdraw Funds' });
    });
    router.get('/partner/profile', isAuthenticated, requireRole('partner'), partner.getProfileUI);

    // Action Routes
    router.post('/partner/profile', isAuthenticated, requireRole('partner'), partner.updateProfile);
    router.post('/partner/upload-document', isAuthenticated, requireRole('partner'), upload.single('document'), partner.uploadDocument);
    router.post('/api/partners/withdraw', isAuthenticated, requireRole('partner'), partner.requestWithdrawal);
    router.post('/api/partners/bookings/:bookingId/status/:status', isAuthenticated, requireRole('partner'), partner.updateBookingStatus);
};

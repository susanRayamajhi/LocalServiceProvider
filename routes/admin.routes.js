const admin = require('../controllers/admin.controller.js');
const { isAuthenticated, requireRole } = require('../middleware/auth.middleware');

module.exports = router => {
    // UI Routes
    router.get("/admin/dashboard", isAuthenticated, requireRole('admin'), admin.getDashboard);
    router.get("/admin/partners", isAuthenticated, requireRole('admin'), admin.getAllPartners);
    router.get("/admin/users", isAuthenticated, requireRole('admin'), admin.getAllUsers);
    router.get("/admin/services", isAuthenticated, requireRole('admin'), admin.getAllServices);
    router.get("/admin/bookings", isAuthenticated, requireRole('admin'), admin.getAllBookings);
    router.get("/admin/disputes", isAuthenticated, requireRole('admin'), admin.getDisputes);
    router.get("/admin/payments", isAuthenticated, requireRole('admin'), admin.getPayments);
    router.get("/admin/reports", isAuthenticated, requireRole('admin'), admin.getReports);

    // API Actions
    router.post('/api/admin/partners/:id/approve', isAuthenticated, requireRole('admin'), admin.approvePartner);
    router.post('/api/admin/partners/:id/reject', isAuthenticated, requireRole('admin'), admin.rejectPartner);
    router.post('/api/admin/partners/:id/toggle-suspend', isAuthenticated, requireRole('admin'), admin.togglePartnerSuspend);
    router.post('/api/admin/users/:id/toggle-suspend', isAuthenticated, requireRole('admin'), admin.toggleSuspend);
    router.post('/api/admin/categories', isAuthenticated, requireRole('admin'), admin.addCategory);
    router.post('/api/admin/categories/:id/delete', isAuthenticated, requireRole('admin'), admin.deleteCategory);
    router.post('/api/admin/disputes/:id/resolve', isAuthenticated, requireRole('admin'), admin.resolveDispute);
};

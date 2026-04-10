module.exports = app => {
    const router = require('express').Router();
    const admin = require('../controllers/admin.controller.js');

    // Partner actions
    router.post('/partners/:id/approve', admin.approvePartner);
    router.post('/partners/:id/reject', admin.rejectPartner);
    router.post('/partners/:id/toggle-suspend', admin.togglePartnerSuspend);
    
    // User actions
    router.post('/users/:id/toggle-suspend', admin.toggleSuspend);

    // Category actions
    router.post('/categories', admin.addCategory);
    router.post('/categories/:id/delete', admin.deleteCategory);

    // Dispute actions
    router.post('/disputes/:id/resolve', admin.resolveDispute);

    app.use('/api/admin', router);
};

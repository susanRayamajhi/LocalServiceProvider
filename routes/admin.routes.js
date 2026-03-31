module.exports = app => {
    const router = require('express').Router();
    const admin = require('../controllers/admin.controller.js');

    // Partner actions
    router.post('/partners/:id/approve', admin.approvePartner);
    router.post('/partners/:id/reject', admin.rejectPartner);
    
    // User actions
    router.post('/users/:id/toggle-suspend', admin.toggleSuspend);

    app.use('/api/admin', router);
};

module.exports = app => {
    const router = require('express').Router();
    const services = require('../controllers/service.controller.js');

    // Get all services
    router.get('/', services.getAll);

    // Search for services
    router.get('/search', services.search);

    // Get all partners for a service
    router.get('/:id/partners', services.getPartners);

    app.use('/api/services', router);
};

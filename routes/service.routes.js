module.exports = app => {
    const express = require('express');
    const router = express.Router();
    const Service = require('../models/service.model');

    // Get all services
    router.get('/', async (req, res) => {
        try {
            const services = await Service.getAll();
            res.json(services);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server Error' });
        }
    });

    // Get single service
    router.get('/:id', async (req, res) => {
        try {
            const service = await Service.getById(req.params.id);
            if (!service) return res.status(404).json({ message: 'Service not found' });
            res.json(service);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server Error' });
        }
    });

    app.use('/api/services', router);
};

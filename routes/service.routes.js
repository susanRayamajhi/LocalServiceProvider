const Service = require('../models/Service');

module.exports = router => {
    // API Routes
    router.get('/api/services', async (req, res, next) => {
        try {
            const services = await Service.getAll();
            res.json(services);
        } catch (err) {
            next(err);
        }
    });

    router.get('/api/services/:id', async (req, res, next) => {
        try {
            const service = await Service.getById(req.params.id);
            if (!service) return res.status(404).json({ message: 'Service not found' });
            res.json(service);
        } catch (err) {
            next(err);
        }
    });
};

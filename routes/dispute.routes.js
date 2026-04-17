module.exports = app => {
    const router = require('express').Router();
    const dispute = require('../controllers/dispute.controller.js');
    const { verifyToken } = require('../middleware/authJwt');

    router.use(verifyToken);
    router.post('/', dispute.createDispute);

    app.use('/api/disputes', router);
};

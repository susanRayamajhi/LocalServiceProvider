module.exports = app => {
    const router = require('express').Router();
    const payments = require('../controllers/payment.controller.js');
    const { verifyToken } = require('../middleware/authJwt');

    // Apply verifyToken middleware
    router.use(verifyToken);

    // Create an order on Razorpay
    router.post('/order', payments.createOrder);

    // Verify a payment after completion
    router.post('/verify', payments.verifyPayment);

    app.use('/api/payments', router);
};

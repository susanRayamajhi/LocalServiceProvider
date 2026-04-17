module.exports = app => {
    const router = require('express').Router();
    const withdrawals = require('../controllers/withdrawal.controller.js');
    const { verifyToken } = require('../middleware/authJwt');

    // Apply verifyToken middleware
    router.use(verifyToken);

    // Request a withdrawal
    router.post('/', withdrawals.requestWithdrawal);

    // Get withdrawal history for current partner
    router.get('/my', withdrawals.getPartnerWithdrawals);

    // Get summary (total earnings, available balance)
    router.get('/summary', withdrawals.getSummary);

    app.use('/api/withdrawals', router);
};

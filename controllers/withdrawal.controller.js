const WithdrawalRequest = require("../models/withdrawal_request.model.js");

exports.requestWithdrawal = (req, res) => {
    // Role check
    if (req.role !== 'partner') {
        return res.status(403).send({ message: "Access denied: Only partners can request withdrawals." });
    }

    // Validate request
    if (!req.body || !req.body.amount) {
        return res.status(400).send({
            message: "Amount is required!"
        });
    }

    const amount = parseFloat(req.body.amount);
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).send({
            message: "Withdrawal amount must be a positive number greater than zero."
        });
    }

    const partner_id = req.userId;

    // Check available balance
    WithdrawalRequest.getSummary(partner_id, (err, summary) => {
        if (err) {
            return res.status(500).send({ message: "Error calculating balance." });
        }

        if (amount > summary.availableBalance) {
            return res.status(400).send({ 
                message: "Insufficient balance. Your available balance is £" + summary.availableBalance.toFixed(2)
            });
        }

        // Create a Withdrawal Request
        const withdrawalRequest = new WithdrawalRequest({
            partner_id: partner_id,
            amount: amount,
            status: "Pending"
        });

        // Save in database
        WithdrawalRequest.create(withdrawalRequest, (err, data) => {
            if (err)
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the withdrawal request."
                });
            else res.status(201).send(data);
        });
    });
};

exports.getPartnerWithdrawals = (req, res) => {
    WithdrawalRequest.findByPartnerId(req.userId, (err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving withdrawal history."
            });
        else res.send(data);
    });
};

exports.getSummary = (req, res) => {
    WithdrawalRequest.getSummary(req.userId, (err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving earnings summary."
            });
        else res.send(data);
    });
};

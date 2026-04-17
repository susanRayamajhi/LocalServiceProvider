const sql = require('./db.js');

const WithdrawalRequest = function(request) {
    this.partner_id = request.partner_id;
    this.amount = request.amount;
    this.status = request.status || 'Pending';
};

WithdrawalRequest.create = (newRequest, result) => {
    sql.query("INSERT INTO withdrawal_requests SET ?", newRequest, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        console.log("created withdrawal request: ", { id: res.insertId, ...newRequest });
        result(null, { id: res.insertId, ...newRequest });
    });
};

WithdrawalRequest.findByPartnerId = (partnerId, result) => {
    sql.query("SELECT * FROM withdrawal_requests WHERE partner_id = ? ORDER BY created_at DESC", [partnerId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

WithdrawalRequest.getSummary = (partnerId, result) => {
    // 1. Get total earnings (Completed or Paid jobs)
    sql.query(
        "SELECT SUM(total_cost) as total_earnings FROM bookings WHERE partner_id = ? AND status IN ('Completed', 'Paid')",
        [partnerId],
        (err, resEarnings) => {
            if (err) {
                result(err, null);
                return;
            }

            const totalEarnings = resEarnings[0].total_earnings || 0;

            // 2. Get total withdrawn (Approved or Processed) and Pending withdrawals
            sql.query(
                "SELECT SUM(CASE WHEN status IN ('Approved', 'Processed', 'Pending') THEN amount ELSE 0 END) as total_deducted FROM withdrawal_requests WHERE partner_id = ?",
                [partnerId],
                (err, resWithdrawals) => {
                    if (err) {
                        result(err, null);
                        return;
                    }

                    const totalDeducted = resWithdrawals[0].total_deducted || 0;
                    const availableBalance = totalEarnings - totalDeducted;

                    result(null, {
                        totalEarnings,
                        totalDeducted,
                        availableBalance
                    });
                }
            );
        }
    );
};

module.exports = WithdrawalRequest;

const db = require('../config/db');

class Withdrawal {
    static async getByPartner(partnerId) {
        const [rows] = await db.query("SELECT * FROM withdrawal_requests WHERE partner_id = ? ORDER BY requested_at DESC", [partnerId]);
        return rows;
    }

    static async sumCompletedByPartner(partnerId) {
        const [rows] = await db.query("SELECT SUM(amount) as total FROM withdrawal_requests WHERE partner_id = ? AND status = 'Completed'", [partnerId]);
        return rows[0].total || 0;
    }

    static async sumPendingOrApprovedByPartner(partnerId) {
        const [rows] = await db.query("SELECT SUM(amount) as total FROM withdrawal_requests WHERE partner_id = ? AND status IN ('Pending', 'Approved', 'Completed')", [partnerId]);
        return rows[0].total || 0;
    }

    static async create(partnerId, amount) {
        await db.query(
            "INSERT INTO withdrawal_requests (partner_id, amount, status, requested_at) VALUES (?, ?, 'Pending', NOW())",
            [partnerId, amount]
        );
    }

    static async sumAllCompleted() {
        const [rows] = await db.query("SELECT SUM(amount) as total FROM withdrawal_requests WHERE status = 'Completed'");
        return rows[0].total || 0;
    }
}

module.exports = Withdrawal;

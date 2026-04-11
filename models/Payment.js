const db = require('../config/db');

class Payment {
    static async getAll() {
        const sql = `
            SELECT p.*, u.name as customer_name 
            FROM payments p 
            JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC
        `;
        const [results] = await db.query(sql);
        return results;
    }

    static async sumCompleted() {
        const [rows] = await db.query("SELECT SUM(amount) as total FROM payments WHERE status = 'Completed'");
        return rows[0].total || 0;
    }
}

module.exports = Payment;

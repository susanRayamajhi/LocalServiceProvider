const db = require('../config/db');

class Dispute {
    static async getAll() {
        const sql = `
            SELECT d.*, u.name as raised_by_name 
            FROM disputes d 
            JOIN users u ON d.raised_by_id = u.id 
            WHERE d.status != 'Closed'
            ORDER BY d.created_at DESC
        `;
        const [results] = await db.query(sql);
        return results;
    }

    static async countOpen() {
        const [rows] = await db.query("SELECT COUNT(*) as count FROM disputes WHERE status = 'Open'");
        return rows[0].count;
    }

    static async resolve(id, resolution) {
        await db.query(
            "UPDATE disputes SET status = 'Resolved', resolution = ?, resolved_at = NOW() WHERE id = ?",
            [resolution, id]
        );
    }
}

module.exports = Dispute;

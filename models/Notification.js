const db = require('../config/db');

class Notification {
    static async getByUser(userId) {
        const sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC";
        const [results] = await db.query(sql, [userId]);
        return results;
    }

    static async markAsRead(id) {
        const sql = "UPDATE notifications SET is_read = 1 WHERE id = ?";
        await db.query(sql, [id]);
    }

    static async create(data) {
        const { user_id, title, message, type = 'info' } = data;
        const [result] = await db.query(
            "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
            [user_id, title, message, type]
        );
        return result.insertId;
    }
}

module.exports = Notification;

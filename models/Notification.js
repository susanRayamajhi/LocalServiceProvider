const db = require('./../db');

class Notification {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.title = data.title;
        this.message = data.message;
        this.type = data.type;
        this.is_read = data.is_read;
        this.created_at = data.created_at;
    }

    static async getByUser(user_id) {
        const sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC";
        const [results] = await db.query(sql, [user_id]);
        return results;
    }

    static async markAsRead(id) {
        const sql = "UPDATE notifications SET is_read = 1 WHERE id = ?";
        await db.query(sql, [id]);
    }

    static async create(data) {
        const sql = "INSERT INTO notifications SET ?";
        const [result] = await db.query(sql, [data]);
        return { id: result.insertId, ...data };
    }
}

module.exports = Notification;

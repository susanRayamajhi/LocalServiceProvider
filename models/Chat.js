const db = require('./../db');

class Chat {
    constructor(data) {
        this.id = data.id;
        this.booking_id = data.booking_id;
        this.sender_id = data.sender_id;
        this.sender_type = data.sender_type;
        this.message = data.message;
        this.is_read = data.is_read;
        this.created_at = data.created_at;
    }

    static async getChatThreadsByUser(user_id) {
        const sql = `
            SELECT cm.*, s.name as service_name, p.name as partner_name
            FROM chat_messages cm
            JOIN bookings b ON cm.booking_id = b.id
            JOIN services s ON b.service_id = s.id
            JOIN partners p ON b.partner_id = p.id
            WHERE b.user_id = ?
            GROUP BY cm.booking_id
            ORDER BY cm.created_at DESC
        `;
        const [results] = await db.query(sql, [user_id]);
        return results;
    }

    static async getMessagesByBooking(booking_id) {
        const sql = `
            SELECT cm.*, p.name as partner_name
            FROM chat_messages cm
            JOIN bookings b ON cm.booking_id = b.id
            JOIN partners p ON b.partner_id = p.id
            WHERE cm.booking_id = ?
            ORDER BY cm.created_at ASC
        `;
        const [results] = await db.query(sql, [booking_id]);
        return results;
    }

    static async create(data) {
        const sql = "INSERT INTO chat_messages SET ?";
        const [result] = await db.query(sql, [data]);
        return { id: result.insertId, ...data };
    }
}

module.exports = Chat;

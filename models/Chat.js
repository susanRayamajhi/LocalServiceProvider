const db = require('../config/db');

class Chat {
    static async getChatThreadsByUser(userId) {
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
        const [results] = await db.query(sql, [userId]);
        return results;
    }

    static async getMessagesByBooking(bookingId) {
        const sql = `
            SELECT cm.*, p.name as partner_name
            FROM chat_messages cm
            JOIN bookings b ON cm.booking_id = b.id
            JOIN partners p ON b.partner_id = p.id
            WHERE cm.booking_id = ?
            ORDER BY cm.created_at ASC
        `;
        const [results] = await db.query(sql, [bookingId]);
        return results;
    }

    static async create(data) {
        const { booking_id, sender_id, sender_type, message } = data;
        const [result] = await db.query(
            "INSERT INTO chat_messages (booking_id, sender_id, sender_type, message) VALUES (?, ?, ?, ?)",
            [booking_id, sender_id, sender_type, message]
        );
        return result.insertId;
    }
}

module.exports = Chat;

const db = require('../config/db');

class Booking {
    static async getByUser(userId) {
        const sql = `
            SELECT b.*, s.name as service_name, p.name as partner_name
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN partners p ON b.partner_id = p.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `;
        const [results] = await db.query(sql, [userId]);
        return results;
    }

    static async getByPartner(partnerId) {
        const sql = `
            SELECT b.*, u.name as customer_name, s.name as service_name 
            FROM bookings b 
            JOIN users u ON b.user_id = u.id 
            JOIN services s ON b.service_id = s.id 
            WHERE b.partner_id = ? 
            ORDER BY b.created_at DESC`;
        const [results] = await db.query(sql, [partnerId]);
        return results;
    }

    static async getAll() {
        const sql = `
            SELECT b.*, u.name as customer_name, p.name as partner_name, s.name as service_name 
            FROM bookings b 
            JOIN users u ON b.user_id = u.id 
            JOIN partners p ON b.partner_id = p.id 
            JOIN services s ON b.service_id = s.id
            ORDER BY b.created_at DESC
        `;
        const [results] = await db.query(sql);
        return results;
    }

    static async getById(id) {
        const sql = `
            SELECT b.*, s.name as service_name, p.name as partner_name, u.name as customer_name
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN partners p ON b.partner_id = p.id
            JOIN users u ON b.user_id = u.id
            WHERE b.id = ?
        `;
        const [results] = await db.query(sql, [id]);
        return results.length ? results[0] : null;
    }

    static async create(data) {
        const { user_id, partner_id, service_id, booking_date, booking_time, total_cost, note } = data;
        const [result] = await db.query(
            "INSERT INTO bookings (user_id, partner_id, service_id, booking_date, booking_time, total_cost, note, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')",
            [user_id, partner_id, service_id, booking_date, booking_time, total_cost, note]
        );
        
        const bookingId = result.insertId;
        
        // Add to history
        await db.query(
            "INSERT INTO booking_status_history (booking_id, status, changed_by_type, changed_by_id, note) VALUES (?, 'Pending', 'user', ?, 'Booking created')",
            [bookingId, user_id]
        );

        return bookingId;
    }

    static async updateStatus(id, status, changedByType, changedById, note = '') {
        await db.query("UPDATE bookings SET status = ? WHERE id = ?", [status, id]);
        
        // Add to history
        await db.query(
            "INSERT INTO booking_status_history (booking_id, status, changed_by_type, changed_by_id, note) VALUES (?, ?, ?, ?, ?)",
            [id, status, changedByType, changedById, note]
        );
    }

    static async countAll() {
        const [rows] = await db.query("SELECT COUNT(*) as count FROM bookings");
        return rows[0].count;
    }

    static async countPendingByPartner(partnerId) {
        const [rows] = await db.query("SELECT COUNT(*) as count FROM bookings WHERE partner_id = ? AND status = 'Pending'", [partnerId]);
        return rows[0].count;
    }

    static async sumEarningsByPartner(partnerId) {
        const [rows] = await db.query("SELECT SUM(total_cost) as total FROM bookings WHERE partner_id = ? AND status = 'Completed'", [partnerId]);
        return rows[0].total || 0;
    }
}

module.exports = Booking;

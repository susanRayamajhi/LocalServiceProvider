const db = require('./../db');

class Booking {
    // Booking note
    note;

    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.partner_id = data.partner_id;
        this.service_id = data.service_id;
        this.address_id = data.address_id;
        this.booking_date = data.booking_date;
        this.booking_time = data.booking_time;
        this.total_cost = data.total_cost;
        this.status = data.status;
        this.note = data.note;
    }

    static async getByUser(user_id) {
        const sql = `
            SELECT b.id, b.booking_date, b.booking_time, b.status, b.total_cost, b.note,
                   s.name as service_name, p.name as provider_name
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN partners p ON b.partner_id = p.id
            WHERE b.user_id = ?
        `;
        const [results] = await db.query(sql, [user_id]);
        return results;
    }

    static async getById(id) {
        const sql = `
            SELECT b.*, s.name as service_name, p.name as provider_name
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN partners p ON b.partner_id = p.id
            WHERE b.id = ?
        `;
        const [results] = await db.query(sql, [id]);
        if (results.length > 0) return results[0];
        return null;
    }

    static async create(data) {
        const sql = "INSERT INTO bookings SET ?";
        const [result] = await db.query(sql, [data]);
        return { id: result.insertId, ...data };
    }

    static async addBookingNote(id, note) {
        const sql = "UPDATE bookings SET note = ? WHERE id = ?";
        const [result] = await db.query(sql, [note, id]);
        return result;
    }
}

module.exports = Booking;

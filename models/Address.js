const db = require('../config/db');

class Address {
    static async getByUserId(userId) {
        const [rows] = await db.query("SELECT * FROM addresses WHERE user_id = ?", [userId]);
        return rows;
    }

    static async create(userId, address, city, state, zip) {
        await db.query(
            "INSERT INTO addresses (user_id, address, city, state, zip_code) VALUES (?, ?, ?, ?, ?)",
            [userId, address, city, state, zip]
        );
    }

    static async update(id, address, city, state, zip) {
        await db.query(
            "UPDATE addresses SET address = ?, city = ?, state = ?, zip_code = ? WHERE id = ?",
            [address, city, state, zip, id]
        );
    }

    static async delete(id) {
        await db.query("DELETE FROM addresses WHERE id = ?", [id]);
    }
}

module.exports = Address;

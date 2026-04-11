const db = require('../config/db');
const bcrypt = require("bcryptjs");

class User {
    static async findByEmail(email) {
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        return rows.length ? rows[0] : null;
    }

    static async findById(id) {
        const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
        return rows.length ? rows[0] : null;
    }

    static async create(userData) {
        const { email, password, name, phone, role = 'customer' } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            "INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)",
            [email, hashedPassword, name, phone, role]
        );
        return result.insertId;
    }

    static async comparePassword(submittedPassword, hashedPassword) {
        return await bcrypt.compare(submittedPassword, hashedPassword);
    }

    static async verify(email) {
        await db.query("UPDATE users SET is_verified = 1 WHERE email = ?", [email]);
    }

    static async countCustomers() {
        const [rows] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
        return rows[0].count;
    }

    static async getAllCustomers() {
        const [rows] = await db.query("SELECT * FROM users WHERE role = 'customer' ORDER BY created_at DESC");
        return rows;
    }

    static async toggleSuspension(id) {
        await db.query("UPDATE users SET is_suspended = NOT is_suspended WHERE id = ?", [id]);
    }
}

module.exports = User;

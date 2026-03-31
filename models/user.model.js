const db = require('../db');
const bcrypt = require("bcryptjs");

class User {
    // Id of the user
    id;
    // Email of the user
    email;

    constructor(email) {
        this.email = email;
    }

    // Get an existing user id from an email address, or return false if not found
    async getIdFromEmail() {
        var sql = "SELECT id FROM users WHERE email = ?";
        const [result] = await db.query(sql, [this.email]);
        if (result && result.length > 0) {
            this.id = result[0].id;
            return this.id;
        } else {
            return false;
        }
    }

    // Add a password to an existing user
    async setUserPassword(password) {
        const pw = await bcrypt.hash(password, 10);
        var sql = "UPDATE users SET password = ? WHERE id = ?"
        const [result] = await db.query(sql, [pw, this.id]);
        return true;
    }

    // Add a new record to the users table
    async addUser(password, name = 'User', phone = '') {
        const pw = await bcrypt.hash(password, 10);
        var sql = "INSERT INTO users (email, password, name, phone) VALUES (?, ?, ?, ?)";
        const [result] = await db.query(sql, [this.email, pw, name, phone]);
        this.id = result.insertId;
        return true;
    }

    // Test a submitted password against a stored password
    async authenticate(submitted) {
        var sql = "SELECT password FROM users WHERE id = ?";
        const [result] = await db.query(sql, [this.id]);
        if (result && result.length > 0) {
            const match = await bcrypt.compare(submitted, result[0].password);
            return match;
        }
        return false;
    }

    static async findByEmail(email) {
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length) return rows[0];
        return null;
    }
}

module.exports = User;

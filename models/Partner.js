const db = require('../config/db');
const bcrypt = require("bcryptjs");

class Partner {
    static async findByEmail(email) {
        const [rows] = await db.query("SELECT * FROM partners WHERE email = ?", [email]);
        return rows.length ? rows[0] : null;
    }

    static async findById(id) {
        const [rows] = await db.query(`
            SELECT p.*, s.name as service_name 
            FROM partners p 
            LEFT JOIN services s ON p.service_id = s.id 
            WHERE p.id = ?`, [id]);
        return rows.length ? rows[0] : null;
    }

    static async create(partnerData) {
        const { name, email, password, phone, service_id, description, pricing, experience, profile_image } = partnerData;
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            "INSERT INTO partners (name, email, password, phone, service_id, description, pricing, experience, profile_image, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)",
            [name, email, hashedPassword, phone, service_id, description, pricing, experience, profile_image]
        );
        return result.insertId;
    }

    static async comparePassword(submittedPassword, hashedPassword) {
        return await bcrypt.compare(submittedPassword, hashedPassword);
    }

    static async verify(email) {
        await db.query("UPDATE partners SET is_verified = 1 WHERE email = ?", [email]);
    }

    static async getAll() {
        const [rows] = await db.query("SELECT * FROM partners ORDER BY created_at DESC");
        return rows;
    }

    static async countAll() {
        const [rows] = await db.query("SELECT COUNT(*) as count FROM partners");
        return rows[0].count;
    }

    static async getPending() {
        const [rows] = await db.query(`
            SELECT p.*, s.name as service_name 
            FROM partners p 
            LEFT JOIN services s ON p.service_id = s.id 
            WHERE p.is_approved = 0
            ORDER BY p.created_at DESC`);
        return rows;
    }

    static async approve(id) {
        await db.query("UPDATE partners SET is_approved = 1 WHERE id = ?", [id]);
    }

    static async delete(id) {
        await db.query("DELETE FROM partners WHERE id = ?", [id]);
    }

    static async toggleSuspension(id) {
        await db.query("UPDATE partners SET is_suspended = NOT is_suspended WHERE id = ?", [id]);
    }

    static async updateProfile(id, data) {
        const { name, description, service_id, pricing } = data;
        await db.query(
            "UPDATE partners SET name = ?, description = ?, service_id = ?, pricing = ? WHERE id = ?",
            [name, description, service_id, pricing, id]
        );
    }
}

module.exports = Partner;

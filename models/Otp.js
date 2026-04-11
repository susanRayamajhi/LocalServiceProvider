const db = require('../config/db');

class Otp {
    static async create(email, otp) {
        await db.query("DELETE FROM otps WHERE email = ?", [email]);
        await db.query("INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))", [email, otp]);
    }

    static async verify(email, otp) {
        const [rows] = await db.query(
            "SELECT * FROM otps WHERE email = ? AND otp = ? AND expires_at > NOW()",
            [email, otp]
        );
        return rows.length > 0;
    }

    static async delete(email) {
        await db.query("DELETE FROM otps WHERE email = ?", [email]);
    }
}

module.exports = Otp;

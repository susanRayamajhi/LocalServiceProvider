const db = require('../config/db');

class Category {
    static async getAll(limit = 0) {
        let sql = "SELECT * FROM service_categories ORDER BY name ASC";
        if (limit > 0) {
            sql += " LIMIT " + parseInt(limit);
        }
        const [results] = await db.query(sql);
        return results;
    }

    static async getById(id) {
        const [results] = await db.query("SELECT * FROM service_categories WHERE id = ?", [id]);
        return results.length ? results[0] : null;
    }

    static async create(data) {
        const { name, description, image } = data;
        const [result] = await db.query(
            "INSERT INTO service_categories (name, description, image) VALUES (?, ?, ?)",
            [name, description, image]
        );
        return result.insertId;
    }

    static async delete(id) {
        await db.query("DELETE FROM service_categories WHERE id = ?", [id]);
    }
}

module.exports = Category;

const db = require('../config/db');

class Service {
    static async getAll(filters = {}) {
        let query = "SELECT s.*, c.name as category_name FROM services s JOIN service_categories c ON s.category_id = c.id WHERE 1=1";
        const params = [];

        if (filters.search) {
            query += " AND (s.name LIKE ? OR s.description LIKE ?)";
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        if (filters.category) {
            query += " AND s.category_id = ?";
            params.push(filters.category);
        }

        if (filters.minPrice) {
            query += " AND s.base_price >= ?";
            params.push(filters.minPrice);
        }

        if (filters.maxPrice) {
            query += " AND s.base_price <= ?";
            params.push(filters.maxPrice);
        }

        query += " ORDER BY s.name ASC";

        const [rows] = await db.query(query, params);
        return rows;
    }

    static async getFeatured(limit = 6) {
        const [rows] = await db.query("SELECT * FROM services LIMIT ?", [limit]);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(`
            SELECT s.*, c.name as category_name 
            FROM services s 
            JOIN service_categories c ON s.category_id = c.id 
            WHERE s.id = ?`, [id]);
        return rows.length ? rows[0] : null;
    }

    static async countAll() {
        const [rows] = await db.query("SELECT COUNT(*) as count FROM services");
        return rows[0].count;
    }
}

module.exports = Service;

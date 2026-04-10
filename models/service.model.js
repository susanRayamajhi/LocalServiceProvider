const db = require('../db');

class Service {
    constructor(data) {
        this.id = data.id;
        this.category_id = data.category_id;
        this.name = data.name;
        this.description = data.description;
        this.image = data.image;
        this.base_price = data.base_price;
    }

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

    static async getCategories() {
        const [rows] = await db.query("SELECT * FROM service_categories ORDER BY name ASC");
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
        if (rows.length) return rows[0];
        return null;
    }
}

module.exports = Service;

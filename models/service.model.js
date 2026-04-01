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

    static async getAll() {
        const [rows] = await db.query("SELECT * FROM services");
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

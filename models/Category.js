const db = require('./../db');

class Category {
    id;
    name;
    description;
    image;

    constructor(id) {
        this.id = id;
    }

    async getCategoryDetails() {
        const sql = "SELECT * FROM service_categories WHERE id = ?";
        const [results] = await db.query(sql, [this.id]);
        if (results.length > 0) {
            const data = results[0];
            this.name = data.name;
            this.description = data.description;
            this.image = data.image;
        }
    }

    static async getAllCategories(limit = 0) {
        let sql = "SELECT * FROM service_categories";
        if (limit > 0) {
            sql += " LIMIT " + limit;
        }
        const [results] = await db.query(sql);
        return results;
    }
}

module.exports = { Category };

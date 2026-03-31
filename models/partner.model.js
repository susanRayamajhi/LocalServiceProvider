const db = require('../db');

class Partner {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.phone = data.phone;
        this.service_id = data.service_id;
        this.description = data.description;
        this.profile_image = data.profile_image;
        this.pricing = data.pricing;
        this.experience = data.experience;
        this.rating = data.rating;
        this.is_approved = data.is_approved;
    }

    static async getAll() {
        const [rows] = await db.query("SELECT * FROM partners");
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query("SELECT * FROM partners WHERE id = ?", [id]);
        if (rows.length) return rows[0];
        return null;
    }

    static async getProvidersByService(serviceId) {
        const [rows] = await db.query("SELECT * FROM partners WHERE service_id = ?", [serviceId]);
        return rows;
    }

    static async getServicesByPartner(partnerId) {
        const [rows] = await db.query(`
            SELECT s.* 
            FROM services s 
            JOIN partners p ON p.service_id = s.id 
            WHERE p.id = ?`, [partnerId]);
        return rows;
    }

    static async findByEmail(email) {
        const [rows] = await db.query("SELECT * FROM partners WHERE email = ?", [email]);
        if (rows.length) return rows[0];
        return null;
    }
}

module.exports = Partner;

const db = require('../config/db');

class Document {
    static async getByPartner(partnerId) {
        const [rows] = await db.query("SELECT * FROM partner_documents WHERE partner_id = ?", [partnerId]);
        return rows;
    }

    static async create(partnerId, type, url) {
        await db.query(
            "INSERT INTO partner_documents (partner_id, document_type, document_url, status) VALUES (?, ?, ?, 'Pending')",
            [partnerId, type, url]
        );
    }
}

module.exports = Document;

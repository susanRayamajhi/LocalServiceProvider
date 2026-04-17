const sql = require('./db.js');

const PartnerDocument = function(document) {
    this.partner_id = document.partner_id;
    this.document_type = document.document_type;
    this.document_url = document.document_url;
    this.status = document.status || 'Pending';
};

PartnerDocument.create = (newDocument, result) => {
    sql.query("INSERT INTO partner_documents SET ?", newDocument, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        console.log("created partner document: ", { id: res.insertId, ...newDocument });
        result(null, { id: res.insertId, ...newDocument });
    });
};

PartnerDocument.findByPartnerId = (partnerId, result) => {
    sql.query("SELECT * FROM partner_documents WHERE partner_id = ?", [partnerId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

PartnerDocument.updateStatus = (id, status, result) => {
    sql.query(
        "UPDATE partner_documents SET status = ? WHERE id = ?",
        [status, id],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                result({ kind: "not_found" }, null);
                return;
            }

            result(null, { id: id, status: status });
        }
    );
};

PartnerDocument.findById = (id, result) => {
    sql.query("SELECT * FROM partner_documents WHERE id = ?", [id], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if (res.length) {
            result(null, res[0]);
            return;
        }

        result({ kind: "not_found" }, null);
    });
};

module.exports = PartnerDocument;

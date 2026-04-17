const sql = require('./db.js');

const PartnerService = function(partnerService) {
    this.partner_id = partnerService.partner_id;
    this.service_id = partnerService.service_id;
    this.price = partnerService.price;
    this.description = partnerService.description;
};

PartnerService.create = (newPartnerService, result) => {
    sql.query("INSERT INTO partner_services SET ?", newPartnerService, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        console.log("added partner service: ", { id: res.insertId, ...newPartnerService });
        result(null, { id: res.insertId, ...newPartnerService });
    });
};

PartnerService.findAllByPartnerId = (partnerId, result) => {
    sql.query(`
        SELECT ps.*, s.name as service_name 
        FROM partner_services ps 
        JOIN services s ON ps.service_id = s.id 
        WHERE ps.partner_id = ?`, [partnerId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

PartnerService.remove = (id, result) => {
    sql.query("DELETE FROM partner_services WHERE id = ?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, res);
    });
};

module.exports = PartnerService;

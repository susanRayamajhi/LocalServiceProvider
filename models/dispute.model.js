const sql = require('./db.js');

const Dispute = function(dispute) {
    this.booking_id = dispute.booking_id;
    this.raised_by_id = dispute.raised_by_id;
    this.raised_by_type = dispute.raised_by_type;
    this.reason = dispute.reason;
    this.status = dispute.status || 'Open';
};

Dispute.create = (newDispute, result) => {
    sql.query("INSERT INTO disputes SET ?", newDispute, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, { id: res.insertId, ...newDispute });
    });
};

Dispute.getAll = (result) => {
    sql.query(`
        SELECT d.*, 
               b.booking_date, b.booking_time, b.total_cost,
               u.name as customer_name, u.email as customer_email,
               p.name as partner_name, p.email as partner_email,
               s.name as service_name
        FROM disputes d
        JOIN bookings b ON d.booking_id = b.id
        JOIN users u ON b.user_id = u.id
        JOIN partners p ON b.partner_id = p.id
        JOIN services s ON b.service_id = s.id
        ORDER BY d.created_at DESC`, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};

Dispute.updateStatus = (id, status, result) => {
    sql.query(
        "UPDATE disputes SET status = ? WHERE id = ?",
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

module.exports = Dispute;

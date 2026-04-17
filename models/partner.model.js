const sql = require('./db.js');

// constructor
const Partner = function(partner) {
    this.name = partner.name;
    this.email = partner.email;
    this.password = partner.password;
    this.phone = partner.phone;
    this.service_id = partner.service_id;
    this.description = partner.description;
    this.profile_image = partner.profile_image;
    this.work_images = partner.work_images;
    this.pricing = partner.pricing;
    this.is_approved = partner.is_approved === undefined ? 0 : partner.is_approved;
    this.is_verified = partner.is_verified === undefined ? 0 : partner.is_verified;
};

Partner.create = (newPartner, result) => {
    // Remove undefined fields to prevent SQL errors
    Object.keys(newPartner).forEach(key => newPartner[key] === undefined && delete newPartner[key]);

    sql.query("INSERT INTO partners SET ?", newPartner, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        console.log("created partner: ", { id: res.insertId, ...newPartner });
        result(null, { id: res.insertId, ...newPartner });
    });
};

Partner.findByEmail = (email, result) => {
    sql.query("SELECT * FROM partners WHERE email = ?", [email], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if (res.length) {
            console.log("found partner: ", res[0]);
            result(null, res[0]);
            return;
        }

        // not found Partner with the email
        result({ kind: "not_found" }, null);
    });
};

Partner.findById = (id, result) => {
    sql.query(`
        SELECT p.*, s.name as service_name 
        FROM partners p 
        LEFT JOIN services s ON p.service_id = s.id 
        WHERE p.id = ?`, [id], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if (res.length) {
            console.log("found partner: ", res[0]);
            result(null, res[0]);
            return;
        }

        // not found Partner with the id
        result({ kind: "not_found" }, null);
    });
};

Partner.getBookings = (partnerId, result) => {
    sql.query(`
        SELECT 
            b.id, 
            b.user_id, 
            b.status, 
            b.booking_date, 
            b.booking_time, 
            b.total_cost,
            s.name as service_name,
            u.name as user_name
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN users u ON b.user_id = u.id
        WHERE b.partner_id = ?
        ORDER BY b.created_at DESC
    `, [partnerId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        console.log("partner bookings: ", res);
        result(null, res);
    });
};

Partner.updateById = (id, partner, result) => {
    sql.query(
        "UPDATE partners SET name = ?, phone = ?, service_id = ?, description = ?, profile_image = ?, work_images = ?, pricing = ? WHERE id = ?",
        [partner.name, partner.phone, partner.service_id, partner.description, partner.profile_image, partner.work_images, partner.pricing, id],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                // not found Partner with the id
                result({ kind: "not_found" }, null);
                return;
            }

            console.log("updated partner: ", { id: id, ...partner });
            result(null, { id: id, ...partner });
        }
    );
};

Partner.updateBookingStatus = (id, status, result) => {
    sql.query(
        "UPDATE bookings SET status = ? WHERE id = ?",
        [status, id],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                // not found Booking with the id
                result({ kind: "not_found" }, null);
                return;
            }

            console.log("updated booking status: ", { id: id, status: status });
            result(null, { id: id, status: status });
        }
    );
};

module.exports = Partner;

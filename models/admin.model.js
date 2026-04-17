const sql = require('./db.js');

// constructor
const Admin = function(admin) {
    this.email = admin.email;
    this.password = admin.password;
};

Admin.findByEmail = (email, result) => {
    sql.query("SELECT * FROM admins WHERE email = ?", [email], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if (res.length) {
            console.log("found admin: ", res[0]);
            result(null, res[0]);
            return;
        }

        // not found Admin with the email
        result({ kind: "not_found" }, null);
    });
};

Admin.getAllUsers = (result) => {
    sql.query("SELECT * FROM users", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        console.log("users: ", res);
        result(null, res);
    });
};

Admin.getAllPartners = (result) => {
    sql.query("SELECT * FROM partners", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        console.log("partners: ", res);
        result(null, res);
    });
};

Admin.approvePartner = (id, result) => {
    sql.query(
        "UPDATE partners SET is_approved = true, is_verified = true WHERE id = ?",
        id,
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

            console.log("approved partner: ", { id: id });
            result(null, { id: id });
        }
    );
};

Admin.rejectPartner = (id, result) => {
    sql.query(
        "UPDATE partners SET is_approved = false, is_verified = false WHERE id = ?",
        id,
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

            console.log("rejected partner: ", { id: id });
            result(null, { id: id });
        }
    );
};

Admin.updatePartner = (id, partner, result) => {
    sql.query(
        "UPDATE partners SET description = ?, pricing = ?, is_approved = ? WHERE id = ?",
        [partner.description, partner.pricing, partner.is_approved, id],
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

            console.log("updated partner: ", { id: id, ...partner });
            result(null, { id: id, ...partner });
        }
    );
};

Admin.createService = (newService, result) => {
    sql.query("INSERT INTO services SET ?", newService, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        console.log("created service: ", { id: res.insertId, ...newService });
        result(null, { id: res.insertId, ...newService });
    });
};

Admin.updateService = (id, service, result) => {
    sql.query(
        "UPDATE services SET name = ?, description = ?, image = ? WHERE id = ?",
        [service.name, service.description, service.image, id],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                // not found Service with the id
                result({ kind: "not_found" }, null);
                return;
            }

            console.log("updated service: ", { id: id, ...service });
            result(null, { id: id, ...service });
        }
    );
};

Admin.deleteService = (id, result) => {
    sql.query("DELETE FROM services WHERE id = ?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if (res.affectedRows == 0) {
            // not found Service with the id
            result({ kind: "not_found" }, null);
            return;
        }

        console.log("deleted service with id: ", id);
        result(null, res);
    });
};

Admin.getAllBookings = (result) => {
    sql.query(`
        SELECT 
            b.*, 
            u.name as user_name, u.email as user_email,
            p.name as partner_name,
            s.name as service_name
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN partners p ON b.partner_id = p.id
        JOIN services s ON b.service_id = s.id
        ORDER BY b.created_at DESC`, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        console.log("bookings with details: ", res.length);
        result(null, res);
    });
};

Admin.cancelBooking = (id, result) => {
    sql.query(
        "UPDATE bookings SET status = 'Cancelled' WHERE id = ?",
        id,
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

            console.log("cancelled booking: ", { id: id });
            result(null, { id: id });
        }
    );
};

Admin.updateBookingStatus = (id, status, result) => {
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

Admin.getAllPayments = (result) => {
    sql.query(`
        SELECT p.*, 
               u.name as customer_name, u.email as customer_email,
               pt.name as partner_name,
               s.name as service_name
        FROM payments p
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN bookings b ON p.booking_id = b.id
        LEFT JOIN partners pt ON b.partner_id = pt.id
        LEFT JOIN services s ON b.service_id = s.id
        ORDER BY p.created_at DESC`, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};

Admin.getFinancialSummary = (result) => {
    sql.query(`
        SELECT 
            COALESCE(SUM(CASE WHEN status = 'Completed' THEN amount ELSE 0 END), 0) as total_revenue,
            COUNT(CASE WHEN status = 'Completed' THEN 1 END) as successful_payments,
            COUNT(CASE WHEN status = 'Failed' THEN 1 END) as failed_payments,
            COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_payments
        FROM payments`, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res[0]);
    });
};

Admin.setUserSuspension = (id, is_suspended, result) => {
    sql.query(
        "UPDATE users SET is_suspended = ? WHERE id = ?",
        [is_suspended, id],
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
            result(null, { id: id, is_suspended: is_suspended });
        }
    );
};

Admin.setPartnerSuspension = (id, is_suspended, result) => {
    sql.query(
        "UPDATE partners SET is_suspended = ? WHERE id = ?",
        [is_suspended, id],
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
            result(null, { id: id, is_suspended: is_suspended });
        }
    );
};

Admin.getOverallStats = (result) => {
    const statsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM users) as total_users,
            (SELECT COUNT(*) FROM users WHERE is_suspended = false) as active_users,
            (SELECT COUNT(*) FROM users WHERE is_suspended = true) as suspended_users,
            (SELECT COUNT(*) FROM partners) as total_partners,
            (SELECT COUNT(*) FROM partners WHERE is_approved = false) as pending_partners,
            (SELECT COUNT(*) FROM services) as total_services,
            (SELECT COUNT(*) FROM bookings) as total_bookings,
            (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'Completed') as total_revenue,
            (SELECT COUNT(*) FROM payments WHERE status = 'Completed') as successful_payments,
            (SELECT COUNT(*) FROM payments WHERE status = 'Failed') as failed_payments
    `;
    sql.query(statsQuery, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res[0]);
    });
};

Admin.getAnalyticsTrend = (result) => {
    // Get booking trends for last 30 days
    const trendQuery = `
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as booking_count,
            SUM(total_cost) as daily_revenue
        FROM bookings
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
    `;
    sql.query(trendQuery, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};

Admin.getBookingStatusDistribution = (result) => {
    sql.query("SELECT status, COUNT(*) as count FROM bookings GROUP BY status", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};

module.exports = Admin;

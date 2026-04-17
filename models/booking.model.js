const sql = require('./db.js');

// constructor
const Booking = function(booking) {
    this.user_id = booking.user_id;
    this.partner_id = booking.partner_id;
    this.service_id = booking.service_id;
    this.booking_date = booking.booking_date;
    this.booking_time = booking.booking_time;
    this.address_id = booking.address_id;
    this.total_cost = booking.total_cost;
};

Booking.create = (newBooking, result) => {
    sql.query("INSERT INTO bookings SET ?", newBooking, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        console.log("created booking: ", { id: res.insertId, ...newBooking });
        result(null, { id: res.insertId, ...newBooking });
    });
};

Booking.getById = (id, result) => {
    sql.query(`
        SELECT 
            b.*, 
            s.name AS service_name, 
            p.name AS partner_name,
            a.address, a.city, a.state, a.zip_code
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN partners p ON b.partner_id = p.id
        LEFT JOIN addresses a ON b.address_id = a.id
        WHERE b.id = ?`, [id], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if (res.length) {
            console.log("found booking: ", res[0]);
            result(null, res[0]);
            return;
        }

        // not found Booking with the id
        result({ kind: "not_found" }, null);
    });
};

Booking.cancel = (id, result) => {
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

Booking.checkAvailability = (partner_id, booking_date, booking_time, result) => {
    // Check if there is already a booking for this partner at this date and time
    sql.query(
        "SELECT * FROM bookings WHERE partner_id = ? AND booking_date = ? AND booking_time = ? AND status != 'Cancelled'",
        [partner_id, booking_date, booking_time],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            if (res.length > 0) {
                // Slot is already booked
                result(null, false);
            } else {
                // Slot is available in bookings, now check partner_availability table
                sql.query(
                    "SELECT * FROM partner_availability WHERE partner_id = ? AND available_date = ? AND start_time <= ? AND end_time >= ? AND status = 'Available'",
                    [partner_id, booking_date, booking_time, booking_time],
                    (err, res) => {
                        if (err) {
                            console.log("error: ", err);
                            result(err, null);
                            return;
                        }

                        if (res.length > 0) {
                            result(null, true);
                        } else {
                            result(null, false);
                        }
                    }
                );
            }
        }
    );
};

module.exports = Booking;

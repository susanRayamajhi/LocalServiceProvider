const sql = require('./db.js');

const Profile = {};

Profile.getProfile = (id, result) => {
    // Fetch user details and join with the default address from the addresses table
    const query = `
        SELECT u.id, u.name, u.email, u.phone, u.created_at,
               a.address, a.city, a.state, a.zip_code
        FROM users u
        LEFT JOIN addresses a ON u.id = a.user_id AND a.is_default = 1
        WHERE u.id = ?`;

    sql.query(query, [id], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if (res.length) {
            const userData = res[0];
            const combinedData = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                created_at: userData.created_at,
                address: userData.address ? {
                    address: userData.address,
                    city: userData.city,
                    state: userData.state,
                    zip_code: userData.zip_code
                } : null
            };
            console.log("found user with address: ", combinedData);
            result(null, combinedData);
            return;
        }

        result({ kind: "not_found" }, null);
    });
};

Profile.updateProfile = (id, data, result) => {
    // 1. Update basic user info
    sql.query(
        "UPDATE users SET name = ?, phone = ? WHERE id = ?",
        [data.name, data.phone, id],
        (err, res) => {
            if (err) {
                console.log("error updating user: ", err);
                result(err, null);
                return;
            }

            // 2. Handle Address Upsert
            if (data.address) {
                const addr = data.address;
                // Check if user already has an address
                sql.query("SELECT id FROM addresses WHERE user_id = ?", [id], (err, rows) => {
                    if (err) {
                        console.log("error checking address: ", err);
                        result(null, { id: id, ...data }); // Still return success for user update
                        return;
                    }

                    if (rows.length > 0) {
                        // UPDATE existing address
                        sql.query(
                            "UPDATE addresses SET address = ?, city = ?, state = ?, zip_code = ?, is_default = 1 WHERE user_id = ?",
                            [addr.address, addr.city, addr.state, addr.zip_code, id],
                            (err, resAddr) => {
                                if (err) console.log("error updating address: ", err);
                                result(null, { id: id, ...data });
                            }
                        );
                    } else {
                        // INSERT new address
                        sql.query(
                            "INSERT INTO addresses (user_id, address, city, state, zip_code, is_default) VALUES (?, ?, ?, ?, ?, 1)",
                            [id, addr.address, addr.city, addr.state, addr.zip_code],
                            (err, resAddr) => {
                                if (err) console.log("error inserting address: ", err);
                                result(null, { id: id, ...data });
                            }
                        );
                    }
                });
            } else {
                result(null, { id: id, ...data });
            }
        }
    );
};

Profile.getAddresses = (userId, result) => {
    sql.query("SELECT * FROM addresses WHERE user_id = ?", [userId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        console.log("addresses: ", res);
        result(null, res);
    });
};

Profile.addAddress = (newAddress, result) => {
    sql.query("INSERT INTO addresses SET ?", newAddress, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        console.log("created address: ", { id: res.insertId, ...newAddress });
        result(null, { id: res.insertId, ...newAddress });
    });
};

Profile.updateAddress = (id, address, result) => {
    sql.query(
        "UPDATE addresses SET address = ?, city = ?, state = ?, zip_code = ? WHERE id = ?",
        [address.address, address.city, address.state, address.zip_code, id],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(null, err);
                return;
            }

            if (res.affectedRows == 0) {
                // not found Address with the id
                result({ kind: "not_found" }, null);
                return;
            }

            console.log("updated address: ", { id: id, ...address });
            result(null, { id: id, ...address });
        }
    );
};

Profile.deleteAddress = (id, result) => {
    sql.query("DELETE FROM addresses WHERE id = ?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        if (res.affectedRows == 0) {
            // not found Address with the id
            result({ kind: "not_found" }, null);
            return;
        }

        console.log("deleted address with id: ", id);
        result(null, res);
    });
};

Profile.getBookings = (userId, result) => {
    sql.query(`
        SELECT 
            b.id AS booking_id, 
            s.name AS service_name, 
            p.name AS partner_name, 
            b.booking_date, 
            b.booking_time, 
            b.status, 
            b.total_cost 
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN partners p ON b.partner_id = p.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
    `, [userId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        console.log("bookings: ", res);
        result(null, res);
    });
};

module.exports = Profile;

const sql = require('./db.js');

// constructor
const User = function(user) {
    this.name = user.name;
    this.email = user.email;
    this.password = user.password;
    this.phone = user.phone;
    this.address = user.address;
};

User.create = (newUser, result) => {
    sql.query("INSERT INTO users SET ?", newUser, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        console.log("created user: ", { id: res.insertId, ...newUser });
        result(null, { id: res.insertId, ...newUser });
    });
};

User.findByEmail = (email, result) => {
    sql.query("SELECT * FROM users WHERE email = ?", [email], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if (res.length) {
            console.log("found user: ", res[0]);
            result(null, res[0]);
            return;
        }

        // not found User with the email
        result({ kind: "not_found" }, null);
    });
};

module.exports = User;

const sql = require('./db.js');

const Payment = function(payment) {
    this.booking_id = payment.booking_id;
    this.user_id = payment.user_id;
    this.amount = payment.amount;
    this.payment_method = payment.payment_method;
    this.transaction_id = payment.transaction_id;
    this.status = payment.status;
};

Payment.create = (newPayment, result) => {
    sql.query("INSERT INTO payments SET ?", newPayment, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        console.log("created payment: ", { id: res.insertId, ...newPayment });
        result(null, { id: res.insertId, ...newPayment });
    });
};

Payment.updateStatus = (transactionId, status, result) => {
    sql.query(
        "UPDATE payments SET status = ? WHERE transaction_id = ?",
        [status, transactionId],
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

            console.log("updated payment status: ", { transaction_id: transactionId, status: status });
            result(null, { transaction_id: transactionId, status: status });
        }
    );
};

Payment.getByBookingId = (bookingId, result) => {
    sql.query("SELECT * FROM payments WHERE booking_id = ?", [bookingId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

module.exports = Payment;

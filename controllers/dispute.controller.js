const Dispute = require("../models/dispute.model.js");
const Booking = require("../models/booking.model.js");

exports.createDispute = (req, res) => {
    if (!req.body || !req.body.booking_id || !req.body.reason) {
        return res.status(400).send({ message: "Booking ID and reason are required." });
    }

    const booking_id = req.body.booking_id;
    const reason = req.body.reason;
    const user_id = req.userId;
    const role = req.role; // 'user' or 'partner'

    Booking.getById(booking_id, (err, booking) => {
        if (err || !booking) {
            return res.status(404).send({ message: "Booking not found." });
        }

        // Verify authorization
        const isAuthorized = (role === 'user' && booking.user_id == user_id) || 
                             (role === 'partner' && booking.partner_id == user_id);

        if (!isAuthorized) {
            return res.status(403).send({ message: "Access denied." });
        }

        const dispute = new Dispute({
            booking_id: booking_id,
            raised_by_id: user_id,
            raised_by_type: role === 'user' ? 'Customer' : 'Partner',
            reason: reason,
            status: 'Open'
        });

        Dispute.create(dispute, (err, data) => {
            if (err) res.status(500).send({ message: "Error raising dispute." });
            else res.status(201).send(data);
        });
    });
};

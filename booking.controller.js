const Booking = require('../models/booking.model.js');

// Create a new booking
exports.create = (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    const { user_id, partner_id, service_id, booking_date, booking_time, address_id, total_cost, is_first_booking } = req.body;

    let final_cost = total_cost;
    // 5% handling fee
    const handling_fee = total_cost * 0.05;
    // 2% government tax
    const tax = total_cost * 0.02;

    if (is_first_booking) {
        final_cost = total_cost + tax;
    } else {
        final_cost = total_cost + handling_fee + tax;
    }


    // Create a Booking
    const booking = new Booking({
        user_id,
        partner_id,
        service_id,
        booking_date,
        booking_time,
        address_id,
        total_cost: final_cost
    });

    // Save Booking in the database
    Booking.create(booking, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Booking."
            });
        else {
            // Send email confirmation
            // This is a dummy email for the project
            console.log('Sending email confirmation to user...');
            res.send(data);
        }
    });
};

// Get a booking by id
exports.getById = (req, res) => {
    Booking.getById(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Booking with id ${req.params.id}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving Booking with id " + req.params.id
                });
            }
        } else res.send(data);
    });
};

// Cancel a booking
exports.cancel = (req, res) => {
    Booking.cancel(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Booking with id ${req.params.id}.`
                });
            } else {
                res.status(500).send({
                    message: "Error updating Booking with id " + req.params.id
                });
            }
        } else res.send({ message: "Booking was cancelled successfully." });
    });
};

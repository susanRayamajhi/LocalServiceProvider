const Booking = require('../models/booking.model.js');
const Partner = require('../models/partner.model.js');
const User = require('../models/user.model.js');
const emailService = require('../services/email.service.js');
const db = require('../models/db.js');

// Create a new booking
exports.create = (req, res) => {
    // Validate request
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    const { partner_id, service_id, booking_date, booking_time, is_first_booking } = req.body;
    const user_id = req.userId; // Use userId from authenticated token

    // Robust boolean conversion
    const isFirst = String(is_first_booking) === 'true';

    if (!user_id) {
        return res.status(401).send({ message: "User not authenticated." });
    }

    // Backend Date Validation
    const selectedDate = new Date(booking_date);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (selectedDate < today) {
        return res.status(400).send({
            message: "Please select a current or future date."
        });
    }

    // Fetch actual price from Partner model to prevent price manipulation
    Partner.findById(partner_id, (err, partner) => {
        if (err) {
            if (err.kind === "not_found") {
                return res.status(404).send({ message: `Partner with id ${partner_id} not found.` });
            } else {
                return res.status(500).send({ message: "Error retrieving Partner info." });
            }
        }

        const basePrice = parseFloat(partner.pricing);
        
        // Recalculate cost on backend
        let final_cost = basePrice;
        const handling_fee = basePrice * 0.05;
        const tax = basePrice * 0.02;

        if (isFirst) {
            final_cost = basePrice + tax;
        } else {
            final_cost = basePrice + handling_fee + tax;
        }

        // Check availability
        Booking.checkAvailability(partner_id, booking_date, booking_time, (err, isAvailable) => {
            if (err) {
                return res.status(500).send({ message: "Error checking availability." });
            }

            if (!isAvailable) {
                return res.status(400).send({ message: "The selected time slot is either already booked or not in the professional's schedule." });
            }

            // 1. Strict Address Validation: Ensure user has a default address before booking
            db.query("SELECT id FROM addresses WHERE user_id = ? AND is_default = 1", [user_id], (err, addressRows) => {
                if (err) return res.status(500).send({ message: "Error validating address." });
                
                if (addressRows.length === 0) {
                    return res.status(400).send({ 
                        message: "Please add your address in your profile before booking a service." 
                    });
                }

                const address_id = addressRows[0].id;

                // 2. Create a Booking
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
                    if (err) {
                        res.status(500).send({
                            message: err.message || "Some error occurred while creating the Booking."
                        });
                    } else {
                        const bookingId = data.id;
                        
                        // Fetch full details for email
                        Booking.getById(bookingId, (err, fullBooking) => {
                            if (!err && fullBooking) {
                                // Fetch user email
                                db.query("SELECT email, name FROM users WHERE id = ?", [user_id], (err, userRows) => {
                                    if (!err && userRows.length > 0) {
                                        const userEmail = userRows[0].email;
                                        const userName = userRows[0].name;

                                        // Send email to Customer
                                        emailService.sendBookingConfirmationEmail(userEmail, {
                                            id: bookingId,
                                            service_name: fullBooking.service_name,
                                            booking_date: fullBooking.booking_date,
                                            booking_time: fullBooking.booking_time,
                                            total_cost: fullBooking.total_cost
                                        }).catch(e => console.log("Customer Email error:", e));

                                        // Send email to Partner
                                        db.query("SELECT email FROM partners WHERE id = ?", [partner_id], (err, partnerRows) => {
                                            if (!err && partnerRows.length > 0) {
                                                const partnerEmail = partnerRows[0].email;
                                                emailService.sendNewBookingRequestEmail(partnerEmail, {
                                                    id: bookingId,
                                                    service_name: fullBooking.service_name,
                                                    booking_date: fullBooking.booking_date,
                                                    booking_time: fullBooking.booking_time,
                                                    user_name: userName
                                                }).catch(e => console.log("Partner Email error:", e));
                                            }
                                        });
                                    }
                                });
                            }
                        });
                        
                        res.send(data);
                    }
                });
            });
        });
    });
};

// Get all bookings
exports.findAll = (req, res) => {
    Booking.getAll((err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving bookings."
            });
        else res.send(data);
    });
};

// Find a single booking by id
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

// Update booking status
exports.updateStatus = (req, res) => {
    // Validate Request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    Booking.updateStatus(
        req.params.id,
        req.body.status,
        (err, data) => {
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
            } else res.send(data);
        }
    );
};

// Cancel booking
exports.cancel = (req, res) => {
    Booking.updateStatus(req.params.id, 'Cancelled', (err, data) => {
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
        } else res.send(data);
    });
};

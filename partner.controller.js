const Partner = require('../models/partner.model.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Signup 

exports.signup = (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    const { name, email, password, service_id } = req.body;

    // Hash password
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).send({
                message: "Error hashing password."
            });
        }

        // Create a Partner
        const partner = new Partner({
            name: name,
            email: email,
            password: hash,
            service_id: service_id
        });

        // Save Partner in the database
        Partner.create(partner, (err, data) => {
            if (err)
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while creating the Partner."
                });
            else res.send(data);
        });
    });
};

// Login
exports.login = (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    const { email, password } = req.body;

    Partner.findByEmail(email, (err, partner) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Partner with email ${email}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving Partner with email " + email
                });
            }
        } else {
            // Check password
            bcrypt.compare(password, partner.password, (err, result) => {
                if (result) {
                    // Create a token
                    const token = jwt.sign({ id: partner.id }, 'MyProject2026SecureKey', { // Add your secret key
                        expiresIn: 86400 // 24 hours
                    });
                    res.status(200).send({
                        id: partner.id,
                        email: partner.email,
                        accessToken: token
                    });
                } else {
                    res.status(401).send({
                        message: "Invalid Password!"
                    });
                }
            });
        }
    });
};

// Get partner profile
exports.getProfile = (req, res) => {
    Partner.findById(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Partner with id ${req.params.id}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving Partner with id " + req.params.id
                });
            }
        } else res.send(data);
    });
};

// Update partner profile
exports.updateProfile = (req, res) => {
    // Validate Request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    Partner.updateById(
        req.params.id,
        new Partner(req.body),
        (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found Partner with id ${req.params.id}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Error updating Partner with id " + req.params.id
                    });
                }
            } else res.send(data);
        }
    );
};

// Accept booking
exports.acceptBooking = (req, res) => {
    Partner.updateBookingStatus(req.params.id, 'Confirmed', (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Booking with id ${req.params.id}.`
                });
            } else {
                res.status(500).send({
                    message: "Error accepting booking with id " + req.params.id
                });
            }
        } else res.send({ message: "Booking accepted successfully." });
    });
};

// Reject booking
exports.rejectBooking = (req, res) => {
    Partner.updateBookingStatus(req.params.id, 'Cancelled', (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Booking with id ${req.params.id}.`
                });
            } else {
                res.status(500).send({
                    message: "Error rejecting booking with id " + req.params.id
                });
            }
        } else res.send({ message: "Booking rejected successfully." });
    });
};

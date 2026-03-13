const Admin = require('../models/admin.model.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login
exports.login = (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    const { email, password } = req.body;

    // !!! WARNING !!!
    // This is a HIGHLY INSECURE way to handle admin login and is ONLY for
    // demonstration or testing purposes for a college project.
    // NEVER use hardcoded credentials in a production environment.
    //
    // For a secure solution, ensure the admin user is created in the database
    // with a properly hashed password, and then use bcrypt.compare as below.

    if (email === 'admin@gmail.com' && password === 'admin') {
        // Since we are bypassing database lookup for this hardcoded user,
        // we'll simulate an admin ID. In a real app, this would come from the DB.
        const simulatedAdminId = 1; // Assuming admin ID 1 is for our hardcoded admin

        // Create a token
        const token = jwt.sign({ id: simulatedAdminId }, 'MyProject2026SecureKey', {
            expiresIn: 86400 // 24 hours
        });
        res.status(200).send({
            id: simulatedAdminId,
            email: email,
            accessToken: token
        });
    } else {
        // Fallback to database check for other admins or if hardcoded fails (less likely with direct check)
        Admin.findByEmail(email, (err, admin) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found Admin with email ${email}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Error retrieving Admin with email " + email
                    });
                }
            } else {
                // Check password
                bcrypt.compare(password, admin.password, (err, result) => {
                    if (result) {
                        // Create a token
                        const token = jwt.sign({ id: admin.id }, 'MyProject2026SecureKey', {
                            expiresIn: 86400 // 24 hours
                        });
                        res.status(200).send({
                            id: admin.id,
                            email: admin.email,
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
    }
};

// Get all users
exports.getAllUsers = (req, res) => {
    Admin.getAllUsers((err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving users."
            });
        else res.send(data);
    });
};

// Get all partners
exports.getAllPartners = (req, res) => {
    Admin.getAllPartners((err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving partners."
            });
        else res.send(data);
    });
};

// Approve partner
exports.approvePartner = (req, res) => {
    Admin.approvePartner(req.params.id, (err, data) => {
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
        } else res.send({ message: "Partner was approved successfully." });
    });
};

// Update partner
exports.updatePartner = (req, res) => {
    // Validate Request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    const partner = {
        description: req.body.description,
        pricing: req.body.pricing,
        is_approved: req.body.is_approved
    };

    Admin.updatePartner(
        req.params.id,
        partner,
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

// Create service
exports.createService = (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    const { name, description, image } = req.body;

    const service = { name, description, image };

    Admin.createService(service, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Service."
            });
        else res.send(data);
    });
};

// Update service
exports.updateService = (req, res) => {
    // Validate Request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    const service = {
        name: req.body.name,
        description: req.body.description,
        image: req.body.image
    };

    Admin.updateService(
        req.params.id,
        service,
        (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found Service with id ${req.params.id}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Error updating Service with id " + req.params.id
                    });
                }
            } else res.send(data);
        }
    );
};

// Delete service
exports.deleteService = (req, res) => {
    Admin.deleteService(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Service with id ${req.params.id}.`
                });
            } else {
                res.status(500).send({
                    message: "Could not delete Service with id " + req.params.id
                });
            }
        } else res.send({ message: `Service was deleted successfully!` });
    });
};

// Get all bookings
exports.getAllBookings = (req, res) => {
    Admin.getAllBookings((err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving bookings."
            });
        else res.send(data);
    });
};

// Cancel booking
exports.cancelBooking = (req, res) => {
    Admin.cancelBooking(req.params.id, (err, data) => {
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

// Update booking status
exports.updateBookingStatus = (req, res) => {
    Admin.updateBookingStatus(req.params.id, req.body.status, (err, data) => {
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
        } else res.send({ message: "Booking status was updated successfully." });
    });
};

const Profile = require('../models/profile.model.js');

// Get user profile
exports.getProfile = (req, res) => {
    Profile.getProfile(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found User with id ${req.params.id}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving User with id " + req.params.id
                });
            }
        } else res.send(data);
    });
};

// Update user profile
exports.updateProfile = (req, res) => {
    // Validate Request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    Profile.updateProfile(
        req.params.id,
        req.body,
        (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found User with id ${req.params.id}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Error updating User with id " + req.params.id
                    });
                }
            } else res.send(data);
        }
    );
};

// Get user addresses
exports.getAddresses = (req, res) => {
    Profile.getAddresses(req.params.id, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving addresses."
            });
        else res.send(data);
    });
};

// Add user address
exports.addAddress = (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    const address = {
        user_id: req.params.id,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zip_code: req.body.zip_code
    };

    Profile.addAddress(address, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Address."
            });
        else res.send(data);
    });
};

// Update user address
exports.updateAddress = (req, res) => {
    // Validate Request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    Profile.updateAddress(
        req.params.id,
        req.body,
        (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found Address with id ${req.params.id}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Error updating Address with id " + req.params.id
                    });
                }
            } else res.send(data);
        }
    );
};

// Delete user address
exports.deleteAddress = (req, res) => {
    Profile.deleteAddress(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Address with id ${req.params.id}.`
                });
            } else {
                res.status(500).send({
                    message: "Could not delete Address with id " + req.params.id
                });
            }
        } else res.send({ message: `Address was deleted successfully!` });
    });
};

// Get user bookings
exports.getBookings = (req, res) => {
    Profile.getBookings(req.params.id, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving bookings."
            });
        else res.send(data);
    });
};

const PartnerAvailability = require('../models/partner_availability.model.js');

// Create and Save a new PartnerAvailability
exports.create = (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    // Ensure partner_id is from the authenticated user
    const partner_id = req.partnerId; // Assuming req.partnerId is set by authJwt middleware

    // Create a PartnerAvailability
    const partnerAvailability = new PartnerAvailability({
        partner_id: partner_id,
        available_date: req.body.available_date,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        status: req.body.status || "Available" // Default to 'Available'
    });

    // Save PartnerAvailability in the database
    PartnerAvailability.create(partnerAvailability, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the PartnerAvailability."
            });
        else res.status(201).send(data);
    });
};

// Retrieve all PartnerAvailability for a partner from the database.
exports.findAllByPartner = (req, res) => {
    const partner_id = req.partnerId; // Assuming req.partnerId is set by authJwt middleware

    PartnerAvailability.findByPartnerId(partner_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `No availability found for partner with id ${partner_id}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving availability for partner with id " + partner_id
                });
            }
        } else res.send(data);
    });
};

// Find a single PartnerAvailability with an id
exports.findOne = (req, res) => {
    PartnerAvailability.findById(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found PartnerAvailability with id ${req.params.id}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving PartnerAvailability with id " + req.params.id
                });
            }
        } else res.send(data);
    });
};

// Update a PartnerAvailability identified by the id in the request
exports.update = (req, res) => {
    // Validate Request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    PartnerAvailability.updateById(
        req.params.id,
        new PartnerAvailability(req.body),
        (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found PartnerAvailability with id ${req.params.id}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Error updating PartnerAvailability with id " + req.params.id
                    });
                }
            } else res.send(data);
        }
    );
};

// Delete a PartnerAvailability with the specified id in the request
exports.delete = (req, res) => {
    PartnerAvailability.remove(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found PartnerAvailability with id ${req.params.id}.`
                });
            } else {
                res.status(500).send({
                    message: "Could not delete PartnerAvailability with id " + req.params.id
                });
            }
        } else res.send({ message: `PartnerAvailability was deleted successfully!` });
    });
};

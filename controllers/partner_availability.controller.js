const PartnerAvailability = require('../models/partner_availability.model.js');

// Create and Save a new PartnerAvailability
exports.create = (req, res) => {
    // Validate request
    if (!req.body || !req.body.available_date || !req.body.start_time || !req.body.end_time) {
        return res.status(400).send({
            message: "All fields are required!"
        });
    }

    // Ensure partner_id is from the authenticated user
    const partner_id = req.userId; 

    const date = new Date(req.body.available_date);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (date < today) {
        return res.status(400).send({
            message: "Available date cannot be in the past."
        });
    }

    if (req.body.start_time >= req.body.end_time) {
        return res.status(400).send({
            message: "Start time must be before end time."
        });
    }

    // Check for overlap
    PartnerAvailability.checkOverlap(partner_id, req.body.available_date, req.body.start_time, req.body.end_time, (err, hasOverlap) => {
        if (err) {
            return res.status(500).send({ message: "Error checking for overlap." });
        }
        if (hasOverlap) {
            return res.status(400).send({ message: "This time slot overlaps with an existing one." });
        }

        // Create a PartnerAvailability
        const partnerAvailability = new PartnerAvailability({
            partner_id: partner_id,
            available_date: req.body.available_date,
            start_time: req.body.start_time,
            end_time: req.body.end_time,
            status: req.body.status || "Available"
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
    });
};

// Retrieve all PartnerAvailability for a partner from the database.
exports.findAllByPartner = (req, res) => {
    const partner_id = req.userId; 

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

// Public method to get availability by partner ID
exports.getAvailabilityByPartnerId = (req, res) => {
    PartnerAvailability.findByPartnerId(req.params.partnerId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `No availability found for partner with id ${req.params.partnerId}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving availability for partner with id " + req.params.partnerId
                });
            }
        } else {
            // Only return 'Available' slots for public view
            const availableSlots = data.filter(slot => slot.status === 'Available');
            res.send(availableSlots);
        }
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
        } else {
            // Ownership check
            if (data.partner_id != req.userId) {
                return res.status(403).send({ message: "Access denied: You can only view your own availability." });
            }
            res.send(data);
        }
    });
};

// Update a PartnerAvailability identified by the id in the request
exports.update = (req, res) => {
    // Validate Request
    if (!req.body) {
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    // First check ownership
    PartnerAvailability.findById(req.params.id, (err, data) => {
        if (err || !data) {
            return res.status(404).send({ message: "Availability slot not found." });
        }

        if (data.partner_id != req.userId) {
            return res.status(403).send({ message: "Access denied: You can only update your own availability." });
        }

        PartnerAvailability.updateById(
            req.params.id,
            new PartnerAvailability({ ...req.body, partner_id: req.userId }),
            (err, data) => {
                if (err) {
                    res.status(500).send({
                        message: "Error updating PartnerAvailability with id " + req.params.id
                    });
                } else res.send(data);
            }
        );
    });
};

// Delete a PartnerAvailability with the specified id in the request
exports.delete = (req, res) => {
    // First check ownership
    PartnerAvailability.findById(req.params.id, (err, data) => {
        if (err || !data) {
            return res.status(404).send({ message: "Availability slot not found." });
        }

        if (data.partner_id != req.userId) {
            return res.status(403).send({ message: "Access denied: You cannot delete this slot." });
        }

        PartnerAvailability.remove(req.params.id, (err, result) => {
            if (err) {
                res.status(500).send({
                    message: "Could not delete PartnerAvailability with id " + req.params.id
                });
            } else res.send({ message: `PartnerAvailability was deleted successfully!` });
        });
    });
};

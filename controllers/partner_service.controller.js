const PartnerService = require("../models/partner_service.model.js");

exports.addService = (req, res) => {
    // Validate request
    if (!req.body || !req.body.service_id || !req.body.price) {
        return res.status(400).send({
            message: "Service ID and price are required!"
        });
    }

    const price = parseFloat(req.body.price);
    if (isNaN(price) || price < 0) {
        return res.status(400).send({
            message: "Price must be a valid positive number."
        });
    }

    // Basic Sanitization
    const sanitize = (str) => {
        if (!str) return str;
        return str.replace(/[<>]/g, "");
    };

    const newPartnerService = new PartnerService({
        partner_id: req.userId,
        service_id: req.body.service_id,
        price: price,
        description: sanitize(req.body.description) || ""
    });

    PartnerService.create(newPartnerService, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while adding the service."
            });
        } else {
            res.status(201).send(data);
        }
    });
};

exports.getMyServices = (req, res) => {
    PartnerService.findAllByPartnerId(req.userId, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving your services."
            });
        } else {
            res.send(data);
        }
    });
};

exports.deleteService = (req, res) => {
    PartnerService.remove(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found partner service with id ${req.params.id}.`
                });
            } else {
                res.status(500).send({
                    message: "Could not delete partner service with id " + req.params.id
                });
            }
        } else res.send({ message: `Service was deleted successfully!` });
    });
};

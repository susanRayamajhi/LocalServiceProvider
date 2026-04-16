const Service = require('../models/service.model.js');


exports.getAll = (req, res) => {
    Service.getAll((err, data) => {
        if (err) {
            return res.status(500).send({
                message: err.message || "Error retrieving services."
            });
        }
        res.send(data);
    });
};

// Search for services
exports.search = (req, res) => {
    const { keyword } = req.query;

    if (!keyword) {
        return res.status(400).send({
            message: "Keyword is required for search."
        });
    }

    Service.search(keyword, (err, data) => {
        if (err) {
            return res.status(500).send({
                message: err.message || "Error searching services."
            });
        }
        res.send(data);
    });
};


exports.getPartners = (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).send({
            message: "Service ID is required."
        });
    }

    Service.getPartners(id, (err, data) => {
        if (err) {
            return res.status(500).send({
                message: err.message || "Error retrieving partners."
            });
        }
        res.send(data);
    });
};

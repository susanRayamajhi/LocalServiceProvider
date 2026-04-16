const Service = require('../models/service.model.js');

// Get all services
exports.getAll = (req, res) => {
    Service.getAll((err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving services."
            });
        else res.send(data);
    });
};

// Search for services
exports.search = (req, res) => {
    const keyword = req.query.keyword;
    Service.search(keyword, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while searching for services."
            });
        else res.send(data);
    });
};

// Get all partners for a service
exports.getPartners = (req, res) => {
    Service.getPartners(req.params.id, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving partners."
            });
        else res.send(data);
    });
};

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
    const filters = {
        keyword: req.query.keyword || req.query.search,
        category_id: req.query.category_id || req.query.category,
        service_id: req.query.service_id,
        min_price: req.query.min_price || req.query.min,
        max_price: req.query.max_price || req.query.max,
        min_rating: req.query.min_rating || req.query.rating
    };

    Service.search(filters, (err, data) => {
        if (err) {
            console.error("Search API Error:", err);
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving partners."
            });
        } else {
            res.send(data);
        }
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

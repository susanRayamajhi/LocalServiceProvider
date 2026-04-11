exports.errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || 500;
    const message = err.message || "Something went wrong on our end.";

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        res.status(status).json({ error: message });
    } else {
        res.status(status).render('error', { 
            title: "Error", 
            error: message, 
            status: status 
        });
    }
};

exports.notFoundHandler = (req, res, next) => {
    res.status(404).render('error', { 
        title: "Page Not Found", 
        error: "The page you are looking for does not exist.", 
        status: 404 
    });
};

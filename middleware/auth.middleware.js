// middleware/auth.middleware.js

// 1. Core Authentication Check
exports.isAuthenticated = (req, res, next) => {
    if (req.session.uid && req.session.user) {
        return next();
    }
    
    // Determine where to redirect based on the URL
    if (req.originalUrl.startsWith('/admin')) {
        return res.redirect('/admin/login');
    }
    if (req.originalUrl.startsWith('/partner')) {
        return res.redirect('/partner/login');
    }
    
    res.redirect('/customer/login');
};

// 2. Role-Based Authorization Factory
exports.requireRole = (role) => {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.redirect('/customer/login');
        }

        if (req.session.role !== role) {
            const err = new Error(`Access Denied: ${role} account required.`);
            err.status = 403;
            return next(err);
        }

        next();
    };
};

// 3. Account Status Guard
exports.checkAccountStatus = async (req, res, next) => {
    if (!req.session.user) return next();

    const user = req.session.user;

    // Check suspension (Common to both User and Partner)
    if (user.is_suspended) {
        req.session.destroy();
        return res.redirect('/customer/login?error=Your account has been suspended.');
    }

    // Special check for Partner Approval
    if (req.session.role === 'partner' && !user.is_approved) {
        // We set a local variable so the UI can show a "Pending" banner
        res.locals.pendingApproval = true;
    }

    next();
};

// Legacy support aliases (to avoid breaking things while transitioning)
exports.authMiddleware = exports.isAuthenticated;
exports.adminMiddleware = (req, res, next) => {
    if (req.session.uid && req.session.role === 'admin') next();
    else res.status(403).send('Access Denied: Admins Only');
};
exports.partnerMiddleware = (req, res, next) => {
    if (req.session.uid && req.session.role === 'partner') next();
    else res.status(403).send('Access Denied: Partners Only');
};
exports.customerMiddleware = (req, res, next) => {
    if (req.session.uid && req.session.role === 'customer') next();
    else res.status(403).send('Access Denied: Customers Only');
};

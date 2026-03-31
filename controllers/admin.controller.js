const db = require('../db');

// Admin UI Controller
exports.getDashboard = async (req, res) => {
    try {
        const [users] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
        const [partners] = await db.query("SELECT COUNT(*) as count FROM partners");
        const [bookings] = await db.query("SELECT COUNT(*) as count FROM bookings");
        const [pendingPartners] = await db.query(`
            SELECT p.*, s.name as service_name 
            FROM partners p 
            LEFT JOIN services s ON p.service_id = s.id 
            WHERE p.is_approved = 0
        `);

        res.render('admin_dashboard', {
            title: 'Admin Dashboard',
            stats: { 
                users: users[0].count, 
                partners: partners[0].count, 
                bookings: bookings[0].count, 
                disputes: 0 
            },
            pendingPartners: pendingPartners
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading admin dashboard");
    }
};

exports.getAllPartners = async (req, res) => {
    try {
        const [partners] = await db.query("SELECT * FROM partners");
        res.render('admin_partners', {
            title: 'Manage Partners',
            partners: partners
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading partners");
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query("SELECT * FROM users WHERE role = 'customer'");
        res.render('admin_users', {
            title: 'Manage Users',
            users: users
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading users");
    }
};

exports.getAllServices = async (req, res) => {
    try {
        const [services] = await db.query("SELECT s.*, c.name as category_name FROM services s JOIN service_categories c ON s.category_id = c.id");
        res.render('admin_services', {
            title: 'Manage Services',
            services: services
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading services");
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const [bookings] = await db.query(`
            SELECT b.*, u.name as customer_name, p.name as partner_name, s.name as service_name 
            FROM bookings b 
            JOIN users u ON b.user_id = u.id 
            JOIN partners p ON b.partner_id = p.id 
            JOIN services s ON b.service_id = s.id
        `);
        res.render('admin_bookings', {
            title: 'All Bookings',
            bookings: bookings
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading bookings");
    }
};

exports.getDisputes = (req, res) => {
    res.render('admin_disputes', {
        title: 'Disputes',
        disputes: []
    });
};

exports.getPayments = (req, res) => {
    res.render('admin_payments', {
        title: 'Payments',
        stats: { totalRevenue: 0, totalPayouts: 0, totalCommission: 0 },
        transactions: []
    });
};

exports.getReports = (req, res) => {
    res.render('admin_reports', { title: 'Generate Reports' });
};

// API Actions
exports.approvePartner = async (req, res) => {
    try {
        await db.query("UPDATE partners SET is_approved = 1 WHERE id = ?", [req.params.id]);
        res.redirect('/admin/partners');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error approving partner");
    }
};

exports.rejectPartner = async (req, res) => {
    try {
        await db.query("DELETE FROM partners WHERE id = ?", [req.params.id]);
        res.redirect('/admin/partners');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error rejecting partner");
    }
};

exports.toggleSuspend = async (req, res) => {
    try {
        await db.query("UPDATE users SET is_suspended = NOT is_suspended WHERE id = ?", [req.params.id]);
        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error toggling user status");
    }
};

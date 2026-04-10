const db = require('../db');

// Admin UI Controller
exports.getDashboard = async (req, res) => {
    try {
        const [usersCount] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
        const [partnersCount] = await db.query("SELECT COUNT(*) as count FROM partners");
        const [bookingsCount] = await db.query("SELECT COUNT(*) as count FROM bookings");
        const [disputesCount] = await db.query("SELECT COUNT(*) as count FROM disputes WHERE status = 'Open'");
        
        const [pendingPartners] = await db.query(`
            SELECT p.*, s.name as service_name 
            FROM partners p 
            LEFT JOIN services s ON p.service_id = s.id 
            WHERE p.is_approved = 0
        `);

        res.render('admin_dashboard', {
            title: 'Admin Dashboard',
            stats: { 
                users: usersCount[0].count, 
                partners: partnersCount[0].count, 
                bookings: bookingsCount[0].count, 
                disputes: disputesCount[0].count 
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
        const [categories] = await db.query("SELECT * FROM service_categories");
        res.render('admin_services', {
            title: 'Manage Services & Categories',
            services: services,
            categories: categories
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
            ORDER BY b.created_at DESC
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

exports.getDisputes = async (req, res) => {
    try {
        const [disputes] = await db.query(`
            SELECT d.*, u.name as raised_by_name 
            FROM disputes d 
            JOIN users u ON d.raised_by_id = u.id 
            WHERE d.status != 'Closed'
        `);
        res.render('admin_disputes', {
            title: 'Disputes',
            disputes: disputes
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading disputes");
    }
};

exports.getPayments = async (req, res) => {
    try {
        const [payments] = await db.query(`
            SELECT p.*, u.name as customer_name 
            FROM payments p 
            JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC
        `);
        
        const [revenue] = await db.query("SELECT SUM(amount) as total FROM payments WHERE status = 'Completed'");
        const [payouts] = await db.query("SELECT SUM(amount) as total FROM withdrawal_requests WHERE status = 'Completed'");
        
        const totalRevenue = revenue[0].total || 0;
        const totalPayouts = payouts[0].total || 0;
        const totalCommission = totalRevenue * 0.15; // Assuming 15% commission

        res.render('admin_payments', {
            title: 'Payments',
            stats: { 
                totalRevenue: totalRevenue.toFixed(2), 
                totalPayouts: totalPayouts.toFixed(2), 
                totalCommission: totalCommission.toFixed(2) 
            },
            transactions: payments
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading payments");
    }
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

exports.togglePartnerSuspend = async (req, res) => {
    try {
        await db.query("UPDATE partners SET is_suspended = NOT is_suspended WHERE id = ?", [req.params.id]);
        res.redirect('/admin/partners');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error toggling partner status");
    }
};

exports.addCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        await db.query("INSERT INTO service_categories (name, description) VALUES (?, ?)", [name, description]);
        res.redirect('/admin/services');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding category");
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await db.query("DELETE FROM service_categories WHERE id = ?", [req.params.id]);
        res.redirect('/admin/services');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting category");
    }
};

exports.resolveDispute = async (req, res) => {
    try {
        const { resolution } = req.body;
        await db.query(
            "UPDATE disputes SET status = 'Resolved', resolution = ?, resolved_at = NOW() WHERE id = ?",
            [resolution, req.params.id]
        );
        res.redirect('/admin/disputes');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error resolving dispute");
    }
};

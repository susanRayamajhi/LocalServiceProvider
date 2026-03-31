const Partner = require("../models/partner.model");
const Service = require("../models/service.model");
const db = require('../db');
const bcrypt = require('bcryptjs');

// Partner UI Controller
exports.getDashboard = async (req, res) => {
    try {
        const partner = await Partner.getById(req.session.uid);
        
        const [pending] = await db.query("SELECT COUNT(*) as count FROM bookings WHERE partner_id = ? AND status = 'Pending'", [req.session.uid]);
        const [earnings] = await db.query("SELECT SUM(total_cost) as total FROM bookings WHERE partner_id = ? AND status = 'Completed'", [req.session.uid]);
        
        const [recentBookings] = await db.query(`
            SELECT b.*, u.name as customer_name, s.name as service_name 
            FROM bookings b 
            JOIN users u ON b.user_id = u.id 
            JOIN services s ON b.service_id = s.id 
            WHERE b.partner_id = ? 
            ORDER BY b.created_at DESC LIMIT 5`, [req.session.uid]);

        res.render('partner_dashboard', {
            title: 'Partner Dashboard',
            partner: partner || { name: 'Partner', rating: 0 },
            pendingCount: pending[0].count,
            totalEarnings: earnings[0].total || 0,
            recentBookings: recentBookings
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading dashboard");
    }
};

exports.getBookings = async (req, res) => {
    try {
        const [bookings] = await db.query(`
            SELECT b.*, u.name as customer_name, s.name as service_name 
            FROM bookings b 
            JOIN users u ON b.user_id = u.id 
            JOIN services s ON b.service_id = s.id 
            WHERE b.partner_id = ? 
            ORDER BY b.created_at DESC`, [req.session.uid]);
            
        res.render('partner_bookings', {
            title: 'My Bookings',
            bookings: bookings
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading bookings");
    }
};

exports.getAvailability = (req, res) => {
    res.render('partner_availability', { title: 'Manage Availability' });
};

exports.getEarnings = (req, res) => {
    res.render('partner_earnings', {
        title: 'Earnings & Payouts',
        stats: { totalEarned: 0, totalWithdrawn: 0, balance: 0 },
        payouts: []
    });
};

exports.getProfileUI = async (req, res) => {
    try {
        const partner = await Partner.getById(req.session.uid);
        const allServices = await Service.getAll();
        res.render('partner_profile', {
            title: 'Edit Profile',
            partner: partner,
            allServices: allServices
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading profile");
    }
};

exports.getSignupUI = async (req, res) => {
    try {
        const services = await Service.getAll();
        res.render('partner_signup', { title: 'Partner Signup', services });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading services");
    }
};

// API Logic
exports.signup = async (req, res) => {
    try {
        const { name, email, password, phone, service_id, description, pricing, experience } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await db.query(
            "INSERT INTO partners (name, email, password, phone, service_id, description, pricing, experience) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [name, email, hashedPassword, phone, service_id, description, pricing, experience]
        );
        
        res.redirect('/login?message=Partner application submitted. Please login.');
    } catch (err) {
        console.error(err);
        const services = await Service.getAll();
        res.status(500).render('partner_signup', { title: 'Partner Signup', services, error: "Error during signup" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await db.query("SELECT * FROM partners WHERE email = ?", [email]);
        if (rows.length > 0) {
            const partner = rows[0];
            const match = await bcrypt.compare(password, partner.password);
            if (match) {
                req.session.uid = partner.id;
                req.session.role = 'partner';
                req.session.user = {
                    id: partner.id,
                    name: partner.name,
                    email: partner.email,
                    role: 'partner'
                };
                return res.redirect('/partner/dashboard');
            }
        }
        res.status(401).render('login', { title: 'Login', error: "Invalid partner credentials" });
    } catch (err) {
        console.error(err);
        res.status(500).render('login', { title: 'Login', error: "Internal Server Error" });
    }
};

exports.getProfile = (req, res) => { res.send("Partner Profile API"); };
exports.updateProfile = (req, res) => { res.send("Update Partner Profile API"); };
exports.acceptBooking = async (req, res) => {
    try {
        await db.query("UPDATE bookings SET status = 'Confirmed' WHERE id = ? AND partner_id = ?", [req.params.id, req.session.uid]);
        res.redirect('/partner/bookings');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error accepting booking");
    }
};

exports.rejectBooking = async (req, res) => {
    try {
        await db.query("UPDATE bookings SET status = 'Cancelled' WHERE id = ? AND partner_id = ?", [req.params.id, req.session.uid]);
        res.redirect('/partner/bookings');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error rejecting booking");
    }
};

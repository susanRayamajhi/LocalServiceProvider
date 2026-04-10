const Partner = require("../models/partner.model");
const Service = require("../models/service.model");
const db = require('../db');
const bcrypt = require('bcryptjs');
const emailService = require('../services/email.service');

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
    res.render('partner_availability', { 
        title: 'Manage Availability',
        message: req.query.message
    });
};

exports.getEarnings = async (req, res) => {
    try {
        const partner_id = req.session.uid;
        
        // Sum completed bookings
        const [totalEarnedRows] = await db.query("SELECT SUM(total_cost) as total FROM bookings WHERE partner_id = ? AND status = 'Completed'", [partner_id]);
        const totalEarned = totalEarnedRows[0].total || 0;
        
        // Sum approved withdrawals
        const [totalWithdrawnRows] = await db.query("SELECT SUM(amount) as total FROM withdrawal_requests WHERE partner_id = ? AND status = 'Completed'", [partner_id]);
        const totalWithdrawn = totalWithdrawnRows[0].total || 0;
        
        const balance = totalEarned - totalWithdrawn;
        
        // Get history
        const [payouts] = await db.query("SELECT * FROM withdrawal_requests WHERE partner_id = ? ORDER BY requested_at DESC", [partner_id]);

        res.render('partner_earnings', {
            title: 'Earnings & Payouts',
            stats: { totalEarned, totalWithdrawn, balance },
            payouts: payouts.map(p => ({
                date: p.requested_at.toDateString(),
                amount: p.amount,
                method: 'Bank Transfer',
                status: p.status
            }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading earnings");
    }
};

exports.requestWithdrawal = async (req, res) => {
    try {
        const { amount, bank_details, note } = req.body;
        const partner_id = req.session.uid;

        // Verify balance
        const [totalEarnedRows] = await db.query("SELECT SUM(total_cost) as total FROM bookings WHERE partner_id = ? AND status = 'Completed'", [partner_id]);
        const totalEarned = totalEarnedRows[0].total || 0;
        const [totalWithdrawnRows] = await db.query("SELECT SUM(amount) as total FROM withdrawal_requests WHERE partner_id = ? AND status IN ('Pending', 'Approved', 'Completed')", [partner_id]);
        const totalWithdrawn = totalWithdrawnRows[0].total || 0;
        const balance = totalEarned - totalWithdrawn;

        if (amount > balance) {
            return res.status(400).send("Insufficient balance");
        }

        await db.query(
            "INSERT INTO withdrawal_requests (partner_id, amount, status, requested_at) VALUES (?, ?, 'Pending', NOW())",
            [partner_id, amount]
        );

        res.redirect('/partner/earnings?message=Withdrawal request submitted');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error processing withdrawal");
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { bookingId, status } = req.params;
        const partner_id = req.session.uid;

        await db.query("UPDATE bookings SET status = ? WHERE id = ? AND partner_id = ?", [status, bookingId, partner_id]);
        
        // If completed, add to partner_earnings (optional audit log)
        if (status === 'Completed') {
            const [booking] = await db.query("SELECT total_cost FROM bookings WHERE id = ?", [bookingId]);
            await db.query(
                "INSERT INTO partner_earnings (partner_id, amount, type, description) VALUES (?, ?, 'Credit', ?)",
                [partner_id, booking[0].total_cost, `Earnings from booking #${bookingId}`]
            );
        }

        res.redirect('/partner/bookings');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating booking status");
    }
};

exports.getProfileUI = async (req, res) => {
    try {
        const partner = await Partner.getById(req.session.uid);
        const allServices = await Service.getAll();
        
        // Get existing documents
        const [documents] = await db.query("SELECT * FROM partner_documents WHERE partner_id = ?", [req.session.uid]);

        res.render('partner_profile', {
            title: 'Edit Profile',
            partner: partner,
            allServices: allServices,
            documents: documents,
            message: req.query.message
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
        const { name, email, password, phone, service_id, description, pricing, experience, profile_image } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            "INSERT INTO partners (name, email, password, phone, service_id, description, pricing, experience, profile_image, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)",
            [name, email, hashedPassword, phone, service_id, description, pricing, experience, profile_image]
        );

        // Generate and Store OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await db.query("DELETE FROM otps WHERE email = ?", [email]);
        await db.query("INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))", [email, otp]);

        // Send actual email
        await emailService.sendOtpEmail(email, otp);

        res.redirect(`/otp?email=${email}&type=partner`);
    } catch (err) {
        console.error(err);
        const services = await Service.getAll();
        res.status(500).render('partner_signup', { title: 'Partner Signup', services, error: "Error during signup" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).render('partner_login', { title: 'Partner Login', error: "Email and password are required!" });
        }

        const [rows] = await db.query("SELECT * FROM partners WHERE email = ?", [email]);
        if (rows.length > 0) {
            const partner = rows[0];
            if (!partner.is_verified) {
                return res.redirect(`/otp?email=${email}&type=partner&error=Please verify your business account first.`);
            }
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
        res.status(401).render('partner_login', { title: 'Partner Login', error: "Invalid partner credentials" });
    } catch (err) {
        console.error(err);
        res.status(500).render('partner_login', { title: 'Partner Login', error: "Internal Server Error" });
    }
};

exports.getProfile = (req, res) => { res.send("Partner Profile API"); };
exports.updateProfile = async (req, res) => {
    try {
        const { name, description, service_id, pricing } = req.body;
        const partner_id = req.session.uid;

        await db.query(
            "UPDATE partners SET name = ?, description = ?, service_id = ?, pricing = ? WHERE id = ?",
            [name, description, service_id, pricing, partner_id]
        );
        
        // Update session data if name changed
        if (req.session.user) {
            req.session.user.name = name;
        }

        res.redirect('/partner/profile?message=Profile updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating partner profile");
    }
};

exports.updateAvailability = async (req, res) => {
    try {
        const { days, ...times } = req.body;
        const partner_id = req.session.uid;

        // Simple implementation: Clear existing and add for next 4 weeks
        await db.query("DELETE FROM partner_availability WHERE partner_id = ? AND status = 'Available'", [partner_id]);

        if (days && days.length > 0) {
            const dayMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
            
            for (const day of days) {
                const start = times[`start_${day}`];
                const end = times[`end_${day}`];
                
                if (start && end) {
                    // Add for the next 4 occurrences of this day
                    let current = new Date();
                    let count = 0;
                    while (count < 4) {
                        if (current.getDay() === dayMap[day]) {
                            const formattedDate = current.toISOString().split('T')[0];
                            await db.query(
                                "INSERT INTO partner_availability (partner_id, available_date, start_time, end_time, status) VALUES (?, ?, ?, ?, 'Available')",
                                [partner_id, formattedDate, start, end]
                            );
                            count++;
                        }
                        current.setDate(current.getDate() + 1);
                    }
                }
            }
        }

        res.redirect('/partner/availability?message=Availability updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating availability");
    }
};

exports.uploadDocument = async (req, res) => {
    try {
        const { document_type } = req.body;
        const partner_id = req.session.uid;
        // Mocking the document URL for now since multer is not yet configured
        const document_url = req.file ? `/uploads/${req.file.filename}` : 'mock_document.pdf';

        await db.query(
            "INSERT INTO partner_documents (partner_id, document_type, document_url, status) VALUES (?, ?, ?, 'Pending')",
            [partner_id, document_type, document_url]
        );

        res.redirect('/partner/profile?message=Document uploaded and pending verification');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error uploading document");
    }
};

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

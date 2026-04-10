const User = require('../models/user.model.js');
const db = require('../db');
const bcrypt = require('bcryptjs');
const emailService = require('../services/email.service');

// Signup
exports.signup = async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;
        if (!email || !password) {
            return res.status(400).render('signup', { title: 'Signup', error: "Email and password are required!" });
        }

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).render('signup', { title: 'Signup', error: "Account already exists. Please login." });
        }

        const userModel = new User(email);
        await userModel.addUser(password, name, phone);

        // Generate and Store OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await db.query("DELETE FROM otps WHERE email = ?", [email]);
        await db.query("INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))", [email, otp]);

        // Send actual email
        await emailService.sendOtpEmail(email, otp);

        res.redirect(`/otp?email=${email}&type=user`);
    } catch (err) {
        console.error(err);
        res.status(500).render('signup', { title: 'Signup', error: "Internal Server Error" });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).render('login', { title: 'User Login', error: "Email and password are required!" });
        }

        // Check Users (Customers/Admins)
        const user = await User.findByEmail(email);
        if (user) {
            const userModel = new User(email);
            userModel.id = user.id;
            const match = await userModel.authenticate(password);

            if (match) {
                if (!user.is_verified) {
                    return res.redirect(`/otp?email=${email}&type=user&error=Please verify your account first.`);
                }
                req.session.uid = user.id;
                req.session.role = user.role || 'customer';
                req.session.user = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role || 'customer'
                };
                
                if (req.session.role === 'admin') return res.redirect('/admin/dashboard');
                return res.redirect('/');
            }
        }

        res.status(401).render('login', { title: 'User Login', error: "Invalid email or password!" });
    } catch (err) {
        console.error(err);
        res.status(500).render('login', { title: 'User Login', error: "Internal Server Error" });
    }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp, type } = req.body;
        
        // 1. Check if OTP is valid and not expired
        const [rows] = await db.query(
            "SELECT * FROM otps WHERE email = ? AND otp = ? AND expires_at > NOW()",
            [email, otp]
        );

        if (rows.length > 0) {
            // 2. Update verification status and GET updated info for auto-login
            let redirectUrl = '/';
            if (type === 'partner') {
                await db.query("UPDATE partners SET is_verified = 1 WHERE email = ?", [email]);
                const [partners] = await db.query("SELECT * FROM partners WHERE email = ?", [email]);
                const partner = partners[0];
                
                req.session.uid = partner.id;
                req.session.role = 'partner';
                req.session.user = {
                    id: partner.id,
                    name: partner.name,
                    email: partner.email,
                    role: 'partner'
                };
                redirectUrl = '/partner/dashboard';
            } else {
                await db.query("UPDATE users SET is_verified = 1 WHERE email = ?", [email]);
                const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
                const user = users[0];

                req.session.uid = user.id;
                req.session.role = user.role || 'customer';
                req.session.user = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role || 'customer'
                };
                redirectUrl = req.session.role === 'admin' ? '/admin/dashboard' : '/';
            }

            // 3. Clear the OTP
            await db.query("DELETE FROM otps WHERE email = ?", [email]);

            res.redirect(redirectUrl);
        } else {
            res.render('otp', { 
                title: 'Verify OTP', 
                email, 
                type, 
                error: "Invalid or expired OTP code." 
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

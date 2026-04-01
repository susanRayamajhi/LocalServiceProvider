const User = require('../models/user.model.js');
const db = require('../db');
const bcrypt = require('bcryptjs');

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

        res.redirect('/login?message=Account created successfully. Please login.');
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
            return res.status(400).render('login', { title: 'Login', error: "Email and password are required!" });
        }

        // 1. Try to find in users table
        const user = await User.findByEmail(email);
        if (user) {
            const userModel = new User(email);
            userModel.id = user.id;
            const match = await userModel.authenticate(password);
            
            if (match) {
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

        // 2. If not found in users or password didn't match, check partners table
        const [partnerRows] = await db.query("SELECT * FROM partners WHERE email = ?", [email]);
        if (partnerRows.length > 0) {
            const partner = partnerRows[0];
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

        res.status(401).render('login', { title: 'Login', error: "Invalid email or password!" });
    } catch (err) {
        console.error(err);
        res.status(500).render('login', { title: 'Login', error: "Internal Server Error" });
    }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (otp === '123456') {
         res.redirect('/login?message=OTP Verified. Please login.');
    } else {
         res.render('otp', { title: 'Verify OTP', email, error: "Invalid OTP code." });
    }
};

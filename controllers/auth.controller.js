const User = require('../models/User');
const Partner = require('../models/Partner');
const Otp = require('../models/Otp');
const emailService = require('../services/email.service');

// SIGNUP LOGIC
exports.signup = async (req, res, next) => {
    try {
        const { email, password, name, phone } = req.body;
        
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.render('customer/signup', { title: 'Signup', error: "Email already registered." });
        }

        await User.create({ email, password, name, phone });
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.create(email, otp);
        await emailService.sendOtpEmail(email, otp);

        res.redirect(`/otp?email=${email}&type=user`);
    } catch (err) {
        next(err);
    }
};

exports.partnerSignup = async (req, res, next) => {
    try {
        const { name, email, password, phone, service_id, description, pricing, experience, profile_image } = req.body;
        
        const existingPartner = await Partner.findByEmail(email);
        if (existingPartner) {
            return res.render('partner/signup', { title: 'Partner Signup', error: "Email already registered." });
        }

        await Partner.create(req.body);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.create(email, otp);
        await emailService.sendOtpEmail(email, otp);

        res.redirect(`/otp?email=${email}&type=partner`);
    } catch (err) {
        next(err);
    }
};

// LOGIN LOGIC
exports.customerLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);

        if (user && user.role === 'customer') {
            const match = await User.comparePassword(password, user.password);
            if (match) {
                if (!user.is_verified) {
                    return res.redirect(`/otp?email=${email}&type=user&error=Please verify your email.`);
                }
                
                req.session.uid = user.id;
                req.session.role = 'customer';
                req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };

                return res.redirect('/');
            }
        }
        res.render('customer/login', { title: 'Login', error: "Invalid email or password." });
    } catch (err) {
        next(err);
    }
};

exports.adminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);

        if (user && user.role === 'admin') {
            const match = await User.comparePassword(password, user.password);
            if (match) {
                req.session.uid = user.id;
                req.session.role = 'admin';
                req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };

                return res.redirect('/admin/dashboard');
            }
        }
        res.render('admin/login', { title: 'Admin Login', error: "Invalid admin credentials." });
    } catch (err) {
        next(err);
    }
};

exports.partnerLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const partner = await Partner.findByEmail(email);

        if (partner) {
            const match = await Partner.comparePassword(password, partner.password);
            if (match) {
                if (!partner.is_verified) {
                    return res.redirect(`/otp?email=${email}&type=partner&error=Please verify your business.`);
                }
                
                req.session.uid = partner.id;
                req.session.role = 'partner';
                req.session.user = { id: partner.id, name: partner.name, email: partner.email, role: 'partner' };

                return res.redirect('/partner/dashboard');
            }
        }
        res.render('partner/login', { title: 'Partner Login', error: "Invalid credentials." });
    } catch (err) {
        next(err);
    }
};

// OTP VERIFICATION
exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, otp, type } = req.body;
        const isValid = await Otp.verify(email, otp);

        if (isValid) {
            let userData;
            if (type === 'partner') {
                await Partner.verify(email);
                userData = await Partner.findByEmail(email);
                req.session.role = 'partner';
            } else {
                await User.verify(email);
                userData = await User.findByEmail(email);
                req.session.role = userData.role;
            }

            req.session.uid = userData.id;
            req.session.user = { id: userData.id, name: userData.name, email: userData.email, role: req.session.role };
            
            await Otp.delete(email);

            const redirectUrl = req.session.role === 'partner' ? '/partner/dashboard' : 
                               (req.session.role === 'admin' ? '/admin/dashboard' : '/');
            res.redirect(redirectUrl);
        } else {
            res.render('auth/otp', { title: 'Verify OTP', email, type, error: "Invalid or expired OTP." });
        }
    } catch (err) {
        next(err);
    }
};

// LOGOUT
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout Error:", err);
        }
        res.redirect('/customer/login?message=You have been logged out.');
    });
};

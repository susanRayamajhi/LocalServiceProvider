const User = require('../models/User');
const Address = require('../models/Address');

// User Profile UI Controller
exports.getProfileUI = async (req, res, next) => {
    try {
        const user = await User.findById(req.session.uid);
        if (!user) return res.redirect('/login');
        
        const addresses = await Address.getByUserId(req.session.uid);
        
        res.render('customer/user_profile', {
            title: 'My Profile',
            user: user,
            addresses: addresses
        });
    } catch (err) {
        next(err);
    }
};

// API Implementations
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            const err = new Error("User not found");
            err.status = 404;
            return next(err);
        }
        res.json(user);
    } catch (err) {
        next(err);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { name, phone } = req.body;
        const user_id = req.session.uid;

        await require('../config/db').query("UPDATE users SET name = ?, phone = ? WHERE id = ?", [name, phone, user_id]);
        
        // Update session data
        if (req.session.user) {
            req.session.user.name = name;
        }

        res.redirect('/profile?message=Profile updated successfully');
    } catch (err) {
        next(err);
    }
};

// Note: Other methods should also use models, but this satisfies MVC principles for now.
exports.getAddresses = (req, res) => { res.send("User Addresses API"); };
exports.addAddress = (req, res) => { res.send("Add User Address API"); };
exports.updateAddress = (req, res) => { res.send("Update User Address API"); };
exports.deleteAddress = (req, res) => { res.send("Delete User Address API"); };
exports.getBookings = (req, res) => { res.send("User Bookings API"); };

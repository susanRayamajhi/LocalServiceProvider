const db = require('../db');

// User Profile UI Controller
exports.getProfileUI = async (req, res) => {
    try {
        const [users] = await db.query("SELECT * FROM users WHERE id = ?", [req.session.uid]);
        if (users.length === 0) return res.redirect('/login');
        
        const [addresses] = await db.query("SELECT * FROM addresses WHERE user_id = ?", [req.session.uid]);
        
        res.render('user_profile', {
            title: 'My Profile',
            user: users[0],
            addresses: addresses
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading profile");
    }
};

// API Placeholders
exports.getProfile = (req, res) => { res.send("User Profile API"); };
exports.updateProfile = (req, res) => { res.send("Update User Profile API"); };
exports.getAddresses = (req, res) => { res.send("User Addresses API"); };
exports.addAddress = (req, res) => { res.send("Add User Address API"); };
exports.updateAddress = (req, res) => { res.send("Update User Address API"); };
exports.deleteAddress = (req, res) => { res.send("Delete User Address API"); };
exports.getBookings = (req, res) => { res.send("User Bookings API"); };

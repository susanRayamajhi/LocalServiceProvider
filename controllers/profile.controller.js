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

// API Implementations
exports.getProfile = async (req, res) => {
    try {
        const [users] = await db.query("SELECT id, name, email, phone, role FROM users WHERE id = ?", [req.params.id]);
        if (users.length === 0) return res.status(404).send({ message: "User not found" });
        res.send(users[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching profile");
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const user_id = req.session.uid;

        await db.query("UPDATE users SET name = ?, phone = ? WHERE id = ?", [name, phone, user_id]);
        
        // Update session data if name changed
        if (req.session.user) {
            req.session.user.name = name;
        }

        res.redirect('/profile?message=Profile updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating profile");
    }
};
exports.getAddresses = (req, res) => { res.send("User Addresses API"); };
exports.addAddress = (req, res) => { res.send("Add User Address API"); };
exports.updateAddress = (req, res) => { res.send("Update User Address API"); };
exports.deleteAddress = (req, res) => { res.send("Delete User Address API"); };
exports.getBookings = (req, res) => { res.send("User Bookings API"); };

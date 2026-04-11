const Partner = require('../models/Partner');
const Booking = require('../models/Booking');
const Withdrawal = require('../models/Withdrawal');
const Document = require('../models/Document');
const Service = require('../models/Service');

exports.getDashboard = async (req, res, next) => {
    try {
        const partner = await Partner.findById(req.session.uid);
        
        const pendingCount = await Booking.countPendingByPartner(req.session.uid);
        const totalEarnings = await Booking.sumEarningsByPartner(req.session.uid);
        const recentBookings = await Booking.getByPartner(req.session.uid); // Simplified for now

        res.render('partner/dashboard', {
            title: 'Partner Dashboard',
            partner: partner || { name: 'Partner', rating: 0 },
            pendingCount,
            totalEarnings,
            recentBookings: recentBookings.slice(0, 5)
        });
    } catch (err) {
        next(err);
    }
};

exports.getBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.getByPartner(req.session.uid);
        res.render('partner/bookings', {
            title: 'My Bookings',
            bookings
        });
    } catch (err) {
        next(err);
    }
};

exports.getAvailability = (req, res) => {
    res.render('partner/availability', { 
        title: 'Manage Availability',
        message: req.query.message
    });
};

exports.getEarnings = async (req, res, next) => {
    try {
        const partnerId = req.session.uid;
        
        const totalEarned = await Booking.sumEarningsByPartner(partnerId);
        const totalWithdrawn = await Withdrawal.sumCompletedByPartner(partnerId);
        const balance = totalEarned - totalWithdrawn;
        
        const payouts = await Withdrawal.getByPartner(partnerId);

        res.render('partner/earnings', {
            title: 'Earnings & Payouts',
            stats: { 
                totalEarned: totalEarned.toFixed(2), 
                totalWithdrawn: totalWithdrawn.toFixed(2), 
                balance: balance.toFixed(2) 
            },
            payouts: payouts.map(p => ({
                date: p.requested_at.toDateString(),
                amount: p.amount,
                method: 'Bank Transfer',
                status: p.status
            }))
        });
    } catch (err) {
        next(err);
    }
};

exports.getProfileUI = async (req, res, next) => {
    try {
        const partner = await Partner.findById(req.session.uid);
        const allServices = await Service.getAll();
        const documents = await Document.getByPartner(req.session.uid);

        res.render('partner/profile', {
            title: 'Edit Profile',
            partner,
            allServices,
            documents,
            message: req.query.message
        });
    } catch (err) {
        next(err);
    }
};

exports.getSignupUI = async (req, res, next) => {
    try {
        const services = await Service.getAll();
        res.render('partner/signup', { title: 'Partner Signup', services });
    } catch (err) {
        next(err);
    }
};

// ACTIONS
exports.updateProfile = async (req, res, next) => {
    try {
        await Partner.updateProfile(req.session.uid, req.body);
        
        if (req.session.user) {
            req.session.user.name = req.body.name;
        }

        res.redirect('/partner/profile?message=Profile updated successfully');
    } catch (err) {
        next(err);
    }
};

exports.requestWithdrawal = async (req, res, next) => {
    try {
        const { amount } = req.body;
        const partnerId = req.session.uid;

        const totalEarned = await Booking.sumEarningsByPartner(partnerId);
        const totalRequested = await Withdrawal.sumPendingOrApprovedByPartner(partnerId);
        const balance = totalEarned - totalRequested;

        if (amount > balance) {
            const err = new Error("Insufficient balance");
            err.status = 400;
            return next(err);
        }

        await Withdrawal.create(partnerId, amount);
        res.redirect('/partner/earnings?message=Withdrawal request submitted');
    } catch (err) {
        next(err);
    }
};

exports.updateBookingStatus = async (req, res, next) => {
    try {
        const { bookingId, status } = req.params;
        const note = req.body.note || `Partner updated status to ${status}`;
        await Booking.updateStatus(bookingId, status, 'partner', req.session.uid, note);
        res.redirect('/partner/bookings');
    } catch (err) {
        next(err);
    }
};

exports.uploadDocument = async (req, res, next) => {
    try {
        const { document_type } = req.body;
        const partnerId = req.session.uid;
        const documentUrl = req.file ? `/uploads/${req.file.filename}` : null;

        if (!documentUrl) {
            const err = new Error("No file uploaded");
            err.status = 400;
            return next(err);
        }

        await Document.create(partnerId, document_type, documentUrl);
        res.redirect('/partner/profile?message=Document uploaded successfully');
    } catch (err) {
        next(err);
    }
};

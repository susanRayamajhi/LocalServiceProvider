const User = require('../models/User');
const Partner = require('../models/Partner');
const Booking = require('../models/Booking');
const Dispute = require('../models/Dispute');
const Payment = require('../models/Payment');
const Service = require('../models/Service');
const Category = require('../models/Category');

exports.getDashboard = async (req, res, next) => {
    try {
        const stats = {
            users: await User.countCustomers(),
            partners: await Partner.countAll(),
            bookings: await Booking.countAll(),
            disputes: await Dispute.countOpen()
        };
        
        const pendingPartners = await Partner.getPending();

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            stats,
            pendingPartners
        });
    } catch (err) {
        next(err);
    }
};

exports.getAllPartners = async (req, res, next) => {
    try {
        const partners = await Partner.getAll();
        res.render('admin/partners', {
            title: 'Manage Partners',
            partners
        });
    } catch (err) {
        next(err);
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.getAllCustomers();
        res.render('admin/users', {
            title: 'Manage Users',
            users
        });
    } catch (err) {
        next(err);
    }
};

exports.getAllServices = async (req, res, next) => {
    try {
        const services = await Service.getAll();
        const categories = await Category.getAll();
        res.render('admin/services', {
            title: 'Manage Services & Categories',
            services,
            categories
        });
    } catch (err) {
        next(err);
    }
};

exports.getAllBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.getAll();
        res.render('admin/bookings', {
            title: 'All Bookings',
            bookings
        });
    } catch (err) {
        next(err);
    }
};

exports.getDisputes = async (req, res, next) => {
    try {
        const disputes = await Dispute.getAll();
        res.render('admin/disputes', {
            title: 'Disputes',
            disputes
        });
    } catch (err) {
        next(err);
    }
};

exports.getPayments = async (req, res, next) => {
    try {
        const transactions = await Payment.getAll();
        
        const totalRevenue = await Payment.sumCompleted();
        // Assuming some logic for payouts if not explicitly tracked
        const totalPayouts = 0; // Replace with actual logic
        const totalCommission = totalRevenue * 0.15;

        res.render('admin/payments', {
            title: 'Payments',
            stats: { 
                totalRevenue: totalRevenue.toFixed(2), 
                totalPayouts: totalPayouts.toFixed(2), 
                totalCommission: totalCommission.toFixed(2) 
            },
            transactions
        });
    } catch (err) {
        next(err);
    }
};

exports.getReports = (req, res) => {
    res.render('admin/reports', { title: 'Generate Reports' });
};

// API Actions
exports.approvePartner = async (req, res, next) => {
    try {
        await Partner.approve(req.params.id);
        res.redirect('/admin/partners');
    } catch (err) {
        next(err);
    }
};

exports.rejectPartner = async (req, res, next) => {
    try {
        await Partner.delete(req.params.id);
        res.redirect('/admin/partners');
    } catch (err) {
        next(err);
    }
};

exports.toggleSuspend = async (req, res, next) => {
    try {
        await User.toggleSuspension(req.params.id);
        res.redirect('/admin/users');
    } catch (err) {
        next(err);
    }
};

exports.togglePartnerSuspend = async (req, res, next) => {
    try {
        await Partner.toggleSuspension(req.params.id);
        res.redirect('/admin/partners');
    } catch (err) {
        next(err);
    }
};

exports.addCategory = async (req, res, next) => {
    try {
        await Category.create(req.body);
        res.redirect('/admin/services');
    } catch (err) {
        next(err);
    }
};

exports.deleteCategory = async (req, res, next) => {
    try {
        await Category.delete(req.params.id);
        res.redirect('/admin/services');
    } catch (err) {
        next(err);
    }
};

exports.resolveDispute = async (req, res, next) => {
    try {
        await Dispute.resolve(req.params.id, req.body.resolution);
        res.redirect('/admin/disputes');
    } catch (err) {
        next(err);
    }
};

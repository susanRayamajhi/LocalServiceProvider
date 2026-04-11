const Booking = require('../models/Booking');
const Partner = require('../models/Partner');
const db = require('../config/db');

exports.listMyBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.getByUser(req.session.uid);
        res.render('customer/bookings_list', { 
            title: 'My Bookings', 
            bookings, 
            message: req.query.message 
        });
    } catch (err) {
        next(err);
    }
};

exports.getBookingDetails = async (req, res, next) => {
    try {
        const booking = await Booking.getById(req.params.id);
        if (!booking || booking.user_id !== req.session.uid) {
            const err = new Error("Booking not found");
            err.status = 404;
            return next(err);
        }
        res.render('customer/booking_success', { title: 'Booking Details', booking });
    } catch (err) {
        next(err);
    }
};

exports.getPaymentPage = async (req, res, next) => {
    try {
        const booking = await Booking.getById(req.params.id);
        if (!booking || booking.user_id !== req.session.uid) {
            const err = new Error("Booking not found");
            err.status = 404;
            return next(err);
        }
        res.render('customer/payment', { title: 'Secure Payment', booking });
    } catch (err) {
        next(err);
    }
};

exports.processPayment = async (req, res, next) => {
    try {
        await Booking.updateStatus(req.params.id, 'Confirmed', 'user', req.session.uid, 'Customer completed payment');
        const booking = await Booking.getById(req.params.id);
        res.render('customer/receipt', { title: 'Payment Receipt', booking });
    } catch (err) {
        next(err);
    }
};

exports.createBooking = async (req, res, next) => {
    try {
        const { service_id, partner_id, booking_date, booking_time, total_cost, note } = req.body;
        const user_id = req.session.uid;
        
        const bookingId = await Booking.create({
            user_id, partner_id, service_id, booking_date, booking_time, total_cost, note
        });
        
        res.redirect(`/bookings/${bookingId}/details`);
    } catch (err) {
        next(err);
    }
};

exports.cancelBooking = async (req, res, next) => {
    try {
        await Booking.updateStatus(req.params.id, 'Cancelled', 'user', req.session.uid, 'Customer cancelled booking');
        res.redirect('/bookings?message=Booking cancelled successfully');
    } catch (err) {
        next(err);
    }
};

exports.getFeedbackPage = async (req, res, next) => {
    try {
        const booking = await Booking.getById(req.params.bookingId);
        if (!booking || booking.user_id !== req.session.uid) {
            const err = new Error("Booking not found");
            err.status = 404;
            return next(err);
        }
        
        res.render('customer/feedback', { 
            title: 'Rate Your Experience', 
            booking,
            partner: { name: booking.partner_name } 
        });
    } catch (err) {
        next(err);
    }
};

exports.submitFeedback = async (req, res, next) => {
    try {
        const { bookingId, rating, comment } = req.body;
        const user_id = req.session.uid;

        const booking = await Booking.getById(bookingId);
        if (!booking) {
            const err = new Error("Booking not found");
            err.status = 404;
            return next(err);
        }
        
        const partner_id = booking.partner_id;

        await db.query(
            "INSERT INTO reviews (booking_id, user_id, partner_id, rating, comment) VALUES (?, ?, ?, ?, ?)",
            [bookingId, user_id, partner_id, rating, comment]
        );

        res.redirect('/bookings?message=Thank you for your feedback!');
    } catch (err) {
        next(err);
    }
};

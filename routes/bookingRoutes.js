module.exports = app => {
    const express = require('express');
    const router = express.Router();
    const db = require('../db');

    // List bookings for current user
    router.get('/', async (req, res) => {
        try {
            if (!req.session.uid) return res.redirect('/login');
            
            const [bookings] = await db.query(`
                SELECT b.*, p.name as partner_name, s.name as service_name 
                FROM bookings b 
                JOIN partners p ON b.partner_id = p.id 
                JOIN services s ON b.service_id = s.id 
                WHERE b.user_id = ? 
                ORDER BY b.created_at DESC`, [req.session.uid]);
            
            res.render('bookings_list', { title: 'My Bookings', bookings, message: req.query.message });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });

    // Booking Details page
    router.get('/:id/details', async (req, res) => {
        try {
            if (!req.session.uid) return res.redirect('/login');
            const [rows] = await db.query(`
                SELECT b.*, p.name as partner_name, s.name as service_name 
                FROM bookings b 
                JOIN partners p ON b.partner_id = p.id 
                JOIN services s ON b.service_id = s.id 
                WHERE b.id = ? AND b.user_id = ?`, [req.params.id, req.session.uid]);
            
            if (rows.length === 0) return res.status(404).send('Booking not found');
            res.render('booking_success', { title: 'Booking Details', booking: rows[0] });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });

    // Payment Page
    router.get('/:id/payment', async (req, res) => {
        try {
            if (!req.session.uid) return res.redirect('/login');
            const [rows] = await db.query(`
                SELECT b.*, s.name as service_name 
                FROM bookings b 
                JOIN services s ON b.service_id = s.id 
                WHERE b.id = ? AND b.user_id = ?`, [req.params.id, req.session.uid]);
            
            if (rows.length === 0) return res.status(404).send('Booking not found');
            res.render('payment', { title: 'Secure Payment', booking: rows[0] });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });

    // Process Payment & Show Receipt
    router.post('/:id/pay', async (req, res) => {
        try {
            if (!req.session.uid) return res.redirect('/login');
            
            // 1. Update booking status to 'Confirmed' (if it was pending payment)
            await db.query("UPDATE bookings SET status = 'Confirmed' WHERE id = ? AND user_id = ?", [req.params.id, req.session.uid]);
            
            // 2. Fetch booking info for receipt
            const [rows] = await db.query(`
                SELECT b.*, p.name as partner_name, s.name as service_name 
                FROM bookings b 
                JOIN partners p ON b.partner_id = p.id 
                JOIN services s ON b.service_id = s.id 
                WHERE b.id = ?`, [req.params.id]);
            
            res.render('receipt', { title: 'Payment Receipt', booking: rows[0] });
        } catch (err) {
            console.error(err);
            res.status(500).send('Payment Processing Error');
        }
    });

    // Create a new booking
    router.post('/create', async (req, res) => {
        try {
            if (!req.session.uid) return res.redirect('/login');
            
            const { service_id, partner_id, booking_date, booking_time, total_cost, note } = req.body;
            const user_id = req.session.uid;
            
            const [result] = await db.query(
                "INSERT INTO bookings (user_id, partner_id, service_id, booking_date, booking_time, total_cost, note) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [user_id, partner_id, service_id, booking_date, booking_time, total_cost, note]
            );
            
            res.redirect(`/bookings/${result.insertId}/details`);
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });

    // Cancel Booking
    router.post('/:id/cancel', async (req, res) => {
        try {
            if (!req.session.uid) return res.redirect('/login');
            await db.query("UPDATE bookings SET status = 'Cancelled' WHERE id = ? AND user_id = ?", [req.params.id, req.session.uid]);
            res.redirect('/bookings?message=Booking cancelled successfully');
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });

    // Feedback UI Route (mapped to /feedback/:bookingId)
    app.get('/feedback/:bookingId', async (req, res) => {
        try {
            if (!req.session.uid) return res.redirect('/login');
            const [booking] = await db.query(`
                SELECT b.*, p.name as partner_name 
                FROM bookings b 
                JOIN partners p ON b.partner_id = p.id 
                WHERE b.id = ? AND b.user_id = ?`, [req.params.bookingId, req.session.uid]);
            
            if (booking.length === 0) return res.status(404).send("Booking not found");
            
            res.render('feedback', { 
                title: 'Rate Your Experience', 
                booking: booking[0],
                partner: { name: booking[0].partner_name } 
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    });

    // Submit Feedback (Review)
    app.post('/feedback', async (req, res) => {
        try {
            if (!req.session.uid) return res.redirect('/login');
            
            const { bookingId, rating, comment } = req.body;
            const user_id = req.session.uid;

            const [booking] = await db.query("SELECT partner_id FROM bookings WHERE id = ?", [bookingId]);
            if (booking.length === 0) return res.status(404).send("Booking not found");
            
            const partner_id = booking[0].partner_id;

            await db.query(
                "INSERT INTO reviews (booking_id, user_id, partner_id, rating, comment) VALUES (?, ?, ?, ?, ?)",
                [bookingId, user_id, partner_id, rating, comment]
            );

            res.redirect('/bookings?message=Thank you for your feedback!');
        } catch (err) {
            console.error(err);
            res.status(500).send("Error submitting feedback");
        }
    });

    app.use('/bookings', router);
};

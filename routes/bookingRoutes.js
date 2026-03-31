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
            
            res.render('bookings_list', { title: 'My Bookings', bookings });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });

    // Booking Success / Detail page
    router.get('/success/:id', async (req, res) => {
        try {
            if (!req.session.uid) return res.redirect('/login');
            const [rows] = await db.query(`
                SELECT b.*, p.name as partner_name, s.name as service_name 
                FROM bookings b 
                JOIN partners p ON b.partner_id = p.id 
                JOIN services s ON b.service_id = s.id 
                WHERE b.id = ? AND b.user_id = ?`, [req.params.id, req.session.uid]);
            
            if (rows.length === 0) return res.status(404).send('Booking not found');
            res.render('booking_success', { title: 'Booking Status', booking: rows[0] });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });

    // Alias for details
    router.get('/:id/details', async (req, res) => {
        res.redirect(`/bookings/success/${req.params.id}`);
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
            
            res.redirect(`/bookings/success/${result.insertId}`);
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
            res.redirect('/bookings');
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });

    // Task 1: Add a note to a booking
    router.post('/add-note', async (req, res) => {
        const { id, note } = req.body;
        try {
            await db.query("UPDATE bookings SET note = ? WHERE id = ?", [note, id]);
            res.redirect('/bookings');
        } catch (err) {
            console.error(`Error while adding note `, err.message);
            res.status(500).send('Error adding note');
        }
    });

    app.use('/bookings', router);
};

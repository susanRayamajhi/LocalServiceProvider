const express = require('express');
const router = express.Router();
const db = require('../db');

// List bookings for sample user (ERD: BOOKINGS)
router.get('/', async (req, res) => {
    try {
        const user_id = 101; // Sample user from provided data
        const [bookings] = await db.query(`
            SELECT b.id, b.booking_date, b.booking_time, b.status, b.total_cost,
                   s.name as service_name, p.name as provider_name
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN partners p ON b.partner_id = p.id
            WHERE b.user_id = ?
        `, [user_id]);

        res.render('bookings_list', { title: 'My Bookings', bookings });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Add logic for Payments, Reviews, Chat and Disputes as per ERD
router.get('/:id/payment', async (req, res) => {
    // Payment logic...
});

// Create a new booking (Proof of Concept)
router.post('/create', async (req, res) => {
    try {
        // In a real app, we would INSERT INTO bookings here
        // For Sprint 3, we redirect to a mock payment page for booking 101
        res.redirect('/payment/101');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

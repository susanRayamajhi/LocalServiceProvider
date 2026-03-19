const express = require('express');
const router = express.Router();
const db = require('../db');

// List all chats for a sample user (ID 101)
router.get('/', async (req, res) => {
    try {
        // Group messages by booking to show unique conversation threads
        const [chats] = await db.query(`
            SELECT cm.*, s.name as service_name, p.name as partner_name
            FROM chat_messages cm
            JOIN bookings b ON cm.booking_id = b.id
            JOIN services s ON b.service_id = s.id
            JOIN partners p ON b.partner_id = p.id
            WHERE b.user_id = ?
            GROUP BY cm.booking_id
            ORDER BY cm.created_at DESC
        `, [101]);
        res.render('chat_list', { title: 'My Messages', chats });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// View specific chat details
router.get('/:bookingId', async (req, res) => {
    try {
        const [messages] = await db.query(`
            SELECT cm.*, p.name as partner_name
            FROM chat_messages cm
            JOIN bookings b ON cm.booking_id = b.id
            JOIN partners p ON b.partner_id = p.id
            WHERE cm.booking_id = ?
            ORDER BY cm.created_at ASC
        `, [req.params.bookingId]);
        res.render('chat_detail', { title: 'Chat Details', messages, bookingId: req.params.bookingId });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

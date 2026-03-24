const express = require('express');
const router = express.Router();
const db = require('../db');

// List all notifications for a sample user (ID 101)
router.get('/', async (req, res) => {
    try {
        const [notifications] = await db.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [101]);
        res.render('notifications_list', { title: 'My Notifications', notifications });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Mark a notification as read
router.post('/read/:id', async (req, res) => {
    try {
        await db.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
        res.redirect('/notifications');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

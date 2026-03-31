module.exports = app => {
    const express = require('express');
    const router = express.Router();
    const Notification = require('../models/Notification');

    // List all notifications for current user
    router.get('/', async (req, res) => {
        try {
            if (!req.session.uid) return res.redirect('/login');
            const notifications = await Notification.getByUser(req.session.uid);
            res.render('notifications_list', { title: 'My Notifications', notifications });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });

    // Mark a notification as read
    router.post('/read/:id', async (req, res) => {
        try {
            if (!req.session.uid) return res.status(401).send('Unauthorized');
            await Notification.markAsRead(req.params.id);
            res.redirect('/notifications');
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });

    app.use('/notifications', router);
};

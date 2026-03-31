module.exports = app => {
    const express = require('express');
    const router = express.Router();
    const Chat = require('../models/Chat');

    // List all chats for current user
    router.get('/', async (req, res) => {
        try {
            if (!req.session.uid) return res.redirect('/login');
            const chats = await Chat.getChatThreadsByUser(req.session.uid);
            res.render('chat_list', { title: 'My Messages', chats });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });

    // View specific chat details
    router.get('/:bookingId', async (req, res) => {
        try {
            if (!req.session.uid) return res.redirect('/login');
            const messages = await Chat.getMessagesByBooking(req.params.bookingId);
            res.render('chat_detail', { title: 'Chat Details', messages, bookingId: req.params.bookingId });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });

    app.use('/chat', router);
};

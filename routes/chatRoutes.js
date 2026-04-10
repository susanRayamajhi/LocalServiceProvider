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
            res.render('chat_detail', { 
                title: 'Chat Details', 
                messages, 
                bookingId: req.params.bookingId,
                role: req.session.role
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });

    router.post('/:bookingId/send', async (req, res) => {
        try {
            if (!req.session.uid) return res.status(401).send('Unauthorized');
            const { message } = req.body;
            await Chat.create({
                booking_id: req.params.bookingId,
                sender_id: req.session.uid,
                sender_type: req.session.role,
                message: message
            });
            res.redirect(`/chat/${req.params.bookingId}`);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error sending message');
        }
    });

    app.use('/chat', router);
};

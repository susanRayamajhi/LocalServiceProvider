const Chat = require('../models/Chat');
const { isAuthenticated } = require('../middleware/auth.middleware');

module.exports = router => {
    // UI Routes
    router.get('/chat', isAuthenticated, async (req, res, next) => {
        try {
            const chats = await Chat.getChatThreadsByUser(req.session.uid);
            res.render('customer/chat_list', { title: 'My Messages', chats });
        } catch (err) {
            next(err);
        }
    });

    router.get('/chat/:bookingId', isAuthenticated, async (req, res, next) => {
        try {
            const messages = await Chat.getMessagesByBooking(req.params.bookingId);
            res.render('customer/chat_detail', { 
                title: 'Chat Details', 
                messages, 
                bookingId: req.params.bookingId,
                role: req.session.role
            });
        } catch (err) {
            next(err);
        }
    });

    // Action Route
    router.post('/api/chat/:bookingId/send', isAuthenticated, async (req, res, next) => {
        try {
            const { message } = req.body;
            await Chat.create({
                booking_id: req.params.bookingId,
                sender_id: req.session.uid,
                sender_type: req.session.role,
                message: message
            });
            res.redirect(`/chat/${req.params.bookingId}`);
        } catch (err) {
            next(err);
        }
    });
};

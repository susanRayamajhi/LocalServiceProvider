const Notification = require('../models/Notification');
const { isAuthenticated } = require('../middleware/auth.middleware');

module.exports = router => {
    // UI Route
    router.get('/notifications', isAuthenticated, async (req, res, next) => {
        try {
            const notifications = await Notification.getByUser(req.session.uid);
            res.render('customer/notifications_list', { title: 'My Notifications', notifications });
        } catch (err) {
            next(err);
        }
    });

    // Action Route
    router.post('/api/notifications/read/:id', isAuthenticated, async (req, res, next) => {
        try {
            await Notification.markAsRead(req.params.id);
            res.redirect('/notifications');
        } catch (err) {
            next(err);
        }
    });
};

module.exports = app => {
    const router = require('express').Router();
    const chat = require('../controllers/chat.controller.js');
    const { verifyToken } = require('../middleware/authJwt');

    // Apply verifyToken middleware
    router.use(verifyToken);

    // Send a message
    router.post('/', chat.sendMessage);

    // Get chat history for a specific booking
    router.get('/:bookingId', chat.getChatHistory);

    app.use('/api/chat', router);
};

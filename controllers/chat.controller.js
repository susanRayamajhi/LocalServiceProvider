const ChatMessage = require("../models/chat.model.js");
const Booking = require("../models/booking.model.js");

exports.sendMessage = (req, res) => {
    // Validate request
    if (!req.body || !req.body.booking_id || !req.body.message) {
        return res.status(400).send({
            message: "Booking ID and message are required!"
        });
    }

    const { booking_id } = req.body;
    const message = req.body.message ? req.body.message.trim() : "";
    
    if (!message) {
        return res.status(400).send({ message: "Message cannot be empty." });
    }

    const sender_id = req.userId;
    const sender_type = req.role; // 'user' or 'partner'

    // Verify booking and ownership
    Booking.getById(booking_id, (err, booking) => {
        if (err || !booking) {
            return res.status(404).send({ message: "Booking not found." });
        }

        const isAuthorized = (sender_type === 'user' && booking.user_id == sender_id) || 
                           (sender_type === 'partner' && booking.partner_id == sender_id);

        if (!isAuthorized) {
            return res.status(403).send({ message: "Access denied: You are not part of this booking." });
        }

        // Create a ChatMessage
        const chatMessage = new ChatMessage({
            booking_id,
            sender_id,
            sender_type,
            message
        });

        // Save in database
        ChatMessage.create(chatMessage, (err, data) => {
            if (err)
                res.status(500).send({
                    message: err.message || "Some error occurred while sending the message."
                });
            else res.status(201).send(data);
        });
    });
};

exports.getChatHistory = (req, res) => {
    const bookingId = req.params.bookingId;
    const userId = req.userId;
    const userRole = req.role;

    // Verify booking and ownership
    Booking.getById(bookingId, (err, booking) => {
        if (err || !booking) {
            return res.status(404).send({ message: "Booking not found." });
        }

        const isAuthorized = (userRole === 'user' && booking.user_id == userId) || 
                           (userRole === 'partner' && booking.partner_id == userId);

        if (!isAuthorized) {
            return res.status(403).send({ message: "Access denied: You are not part of this booking." });
        }

        ChatMessage.getByBookingId(bookingId, (err, data) => {
            if (err)
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving chat history."
                });
            else res.send(data);
        });
    });
};

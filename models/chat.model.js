const sql = require('./db.js');

const ChatMessage = function(chat) {
    this.booking_id = chat.booking_id;
    this.sender_id = chat.sender_id;
    this.sender_type = chat.sender_type;
    this.message = chat.message;
};

ChatMessage.create = (newMessage, result) => {
    sql.query("INSERT INTO chat_messages SET ?", newMessage, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        console.log("created chat message: ", { id: res.insertId, ...newMessage });
        result(null, { id: res.insertId, ...newMessage });
    });
};

ChatMessage.getByBookingId = (bookingId, result) => {
    sql.query(
        "SELECT * FROM chat_messages WHERE booking_id = ? ORDER BY created_at ASC",
        [bookingId],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            result(null, res);
        }
    );
};

module.exports = ChatMessage;

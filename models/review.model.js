const sql = require('./db.js');

const Review = function(review) {
    this.booking_id = review.booking_id;
    this.user_id = review.user_id;
    this.partner_id = review.partner_id;
    this.rating = review.rating;
    this.comment = review.comment;
};

Review.create = (newReview, result) => {
    sql.query("INSERT INTO reviews SET ?", newReview, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        console.log("created review: ", { id: res.insertId, ...newReview });
        
        // After creating review, update partner average rating
        Review.updatePartnerRating(newReview.partner_id);
        
        result(null, { id: res.insertId, ...newReview });
    });
};

Review.updatePartnerRating = (partnerId) => {
    sql.query(
        "UPDATE partners SET rating = (SELECT AVG(rating) FROM reviews WHERE partner_id = ?) WHERE id = ?",
        [partnerId, partnerId],
        (err, res) => {
            if (err) {
                console.log("error updating partner rating: ", err);
            } else {
                console.log("updated partner rating for id: ", partnerId);
            }
        }
    );
};

Review.findByBookingId = (bookingId, result) => {
    sql.query("SELECT * FROM reviews WHERE booking_id = ?", [bookingId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if (res.length) {
            result(null, res[0]);
            return;
        }

        result({ kind: "not_found" }, null);
    });
};

module.exports = Review;

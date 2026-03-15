// Import express.js
const express = require("express");
const cors = require('cors');

// Create express app
var app = express();

// Set Pug as the view engine
app.set('view engine', 'pug');
app.set('views', 'app/views');

// Add cors and body-parser

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add static files location
app.use(express.static("static"));

// Get the functions in the db.js file to use
const db = require('./services/db');

// Main routes for Pug views

app.get("/", async function(req, res) {
    try {
        const services = await db.query("SELECT * FROM services LIMIT 6");
        res.render("index", { services });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching services");
    }
});

app.get("/services", async function(req, res) {
    try {
        const services = await db.query("SELECT * FROM services");
        res.render("services", { services });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching services");
    }
});

// Create a route for root - /api/test
app.get("/api/test", function(req, res) {
    res.send("Hello world!");
});

// Import the routes from the routes folder

require("./routes/auth.routes.js")(app);
require("./routes/partner.routes.js")(app);
require("./routes/admin.routes.js")(app);
require("./routes/service.routes.js")(app);
require("./routes/booking.routes.js")(app);
require("./routes/profile.routes.js")(app);

// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});

module.exports = app;

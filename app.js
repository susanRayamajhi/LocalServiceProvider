require('dotenv').config();
const express = require("express");
const path = require('path');
const session = require('express-session');

const app = express();

// Set Pug as the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set the sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'local-service-provider-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Global middleware to make user data available to all templates
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Controllers
const pageController = require('./controllers/page.controller');
const adminController = require('./controllers/admin.controller');
const partnerController = require('./controllers/partner.controller');
const profileController = require('./controllers/profile.controller');

// --- PUBLIC UI ROUTES ---
app.get("/", pageController.getHome);
app.get("/services", pageController.getServices);
app.get("/services/:id", pageController.getServiceDetail);
app.get("/providers", pageController.getProviders);
app.get("/providers/:id", pageController.getProviderDetail);
app.get("/login", pageController.getLogin);
app.get("/signup", pageController.getSignup);
app.get("/partner/signup", partnerController.getSignupUI);
app.get("/otp", pageController.getOtp);

// --- AUTH PROTECTED ROUTES ---
const authMiddleware = (req, res, next) => {
    if (req.session.uid) next();
    else res.redirect('/login');
};

const adminMiddleware = (req, res, next) => {
    if (req.session.uid && req.session.role === 'admin') next();
    else res.status(403).send('Access Denied');
};

const partnerMiddleware = (req, res, next) => {
    if (req.session.uid && req.session.role === 'partner') next();
    else res.status(403).send('Access Denied');
};

app.get("/profile", authMiddleware, profileController.getProfileUI);
app.post("/profile/update", authMiddleware, (req, res) => {
    res.send("Profile updated successfully (Mockup for Sprint 2)");
});
app.get("/book/:serviceId", authMiddleware, pageController.getBookingForm);

// --- ADMIN UI ROUTES ---
app.get("/admin/dashboard", adminMiddleware, adminController.getDashboard);
app.get("/admin/partners", adminMiddleware, adminController.getAllPartners);
app.get("/admin/users", adminMiddleware, adminController.getAllUsers);
app.get("/admin/services", adminMiddleware, adminController.getAllServices);
app.get("/admin/bookings", adminMiddleware, adminController.getAllBookings);
app.get("/admin/disputes", adminMiddleware, adminController.getDisputes);
app.get("/admin/payments", adminMiddleware, adminController.getPayments);
app.get("/admin/reports", adminMiddleware, adminController.getReports);

// --- PARTNER UI ROUTES ---
app.get("/partner/dashboard", partnerMiddleware, partnerController.getDashboard);
app.get("/partner/bookings", partnerMiddleware, partnerController.getBookings);
app.get("/partner/availability", partnerMiddleware, partnerController.getAvailability);
app.get("/partner/earnings", partnerMiddleware, partnerController.getEarnings);
app.get("/partner/withdraw", partnerMiddleware, (req, res) => {
    res.render("partner_withdrawal", { title: 'Withdraw Funds' });
});
app.get("/partner/profile", partnerMiddleware, partnerController.getProfileUI);
app.post("/partner/profile", partnerMiddleware, (req, res) => {
    res.send("Partner profile updated successfully (Mockup for Sprint 2)");
});
app.post("/partner/availability", partnerMiddleware, (req, res) => {
    res.send("Availability updated successfully (Mockup for Sprint 2)");
});

// Logout
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/login');
});

// --- API & ACTION ROUTES ---
// We pass app to these route modules if they use it to define routes themselves
require('./routes/auth.routes')(app);
require('./routes/admin.routes')(app);
require('./routes/partner.routes')(app);
require('./routes/profile.routes')(app);
require('./routes/service.routes')(app);
require('./routes/bookingRoutes')(app);
require('./routes/notificationRoutes')(app);
require('./routes/chatRoutes')(app);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}/`);
});

module.exports = app;

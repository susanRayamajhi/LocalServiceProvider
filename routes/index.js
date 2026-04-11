const express = require('express');
const router = express.Router();

// Controllers
const pageController = require('../controllers/page.controller');
const partnerController = require('../controllers/partner.controller');
const profileController = require('../controllers/profile.controller');

// Middlewares
const { isAuthenticated, requireRole, checkAccountStatus } = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');
const upload = require('../middleware/upload.middleware');

// Apply account status check to all routes
router.use(checkAccountStatus);

// --- PUBLIC WEB ROUTES ---
router.get("/", pageController.getHome);
router.get("/services", pageController.getServices);
router.get("/services/:id", pageController.getServiceDetail);
router.get("/providers", pageController.getProviders);
router.get("/providers/:id", pageController.getProviderDetail);
router.get("/login", (req, res) => res.redirect('/customer/login'));
router.get("/customer/login", pageController.getLogin);
router.get("/partner/login", pageController.getPartnerLogin);
router.get("/admin/login", pageController.getAdminLogin);
router.get("/signup", pageController.getSignup);
router.get("/partner/signup", partnerController.getSignupUI);
router.get("/otp", pageController.getOtp);

// Logout
router.get('/logout', authController.logout);

// --- CUSTOMER PROTECTED ROUTES ---
router.get("/profile", isAuthenticated, requireRole('customer'), profileController.getProfileUI);
router.get("/book/:serviceId", isAuthenticated, requireRole('customer'), pageController.getBookingForm);

// --- MOUNT SPECIFIC ROUTE FILES ---
require('./auth.routes')(router);
require('./admin.routes')(router);
require('./partner.routes')(router);
require('./profile.routes')(router);
require('./service.routes')(router);
require('./booking.routes')(router);
require('./notification.routes')(router);
require('./chat.routes')(router);

module.exports = router
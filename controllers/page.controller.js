const Service = require("../models/Service");
const Partner = require("../models/Partner");
const Category = require("../models/Category");

exports.getHome = async (req, res, next) => {
    try {
        const services = await Service.getFeatured(6);
        res.render("customer/index", { title: 'Home', services });
    } catch (err) {
        next(err);
    }
};

exports.getServices = async (req, res, next) => {
    try {
        const { search, category, minPrice, maxPrice } = req.query;
        const filters = { search, category, minPrice, maxPrice };
        
        const services = await Service.getAll(filters);
        const categories = await Category.getAll();
        
        res.render("customer/services_list", { 
            title: 'Our Services', 
            services, 
            categories,
            query: req.query 
        });
    } catch (err) {
        next(err);
    }
};

exports.getServiceDetail = async (req, res, next) => {
    try {
        const service = await Service.getById(req.params.id);
        if (!service) {
            const err = new Error("Service not found");
            err.status = 404;
            return next(err);
        }
        
        // Assume Partner model has getProvidersByService or use existing one
        const [providers] = await require('../config/db').query("SELECT * FROM partners WHERE service_id = ?", [req.params.id]);
        res.render("customer/service_detail", { title: service.name, service, providers });
    } catch (err) {
        next(err);
    }
};

exports.getProviders = async (req, res, next) => {
    try {
        const providers = await Partner.getAll();
        res.render("customer/providers_list", { title: 'Our Partners', providers });
    } catch (err) {
        next(err);
    }
};

exports.getProviderDetail = async (req, res, next) => {
    try {
        const provider = await Partner.findById(req.params.id);
        if (!provider) {
            const err = new Error("Provider not found");
            err.status = 404;
            return next(err);
        }
        
        const [services] = await require('../config/db').query(`
            SELECT s.* 
            FROM services s 
            JOIN partners p ON p.service_id = s.id 
            WHERE p.id = ?`, [req.params.id]);

        res.render("customer/provider_detail", { title: provider.name, provider, services });
    } catch (err) {
        next(err);
    }
};

exports.getLogin = (req, res) => {
    if (req.session.uid) return res.redirect('/');
    res.render("customer/login", { title: 'User Login' });
};

exports.getPartnerLogin = (req, res) => {
    if (req.session.uid) return res.redirect('/partner/dashboard');
    res.render("partner/login", { title: 'Partner Login' });
};

exports.getAdminLogin = (req, res) => {
    if (req.session.uid) return res.redirect('/admin/dashboard');
    res.render("admin/login", { title: 'Admin Login' });
};

exports.getSignup = (req, res) => {
    if (req.session.uid) return res.redirect('/');
    res.render("customer/signup", { title: 'Signup' });
};


exports.getOtp = (req, res) => {
    res.render("auth/otp", { 
        title: 'Verify OTP', 
        email: req.query.email, 
        type: req.query.type || 'user',
        error: req.query.error
    });
};

exports.getFeedback = (req, res) => {
    res.render("customer/feedback", {
        title: 'Rate Your Experience',
        booking: { id: req.params.bookingId },
        partner: { name: 'Professional' }
    });
};

exports.getBookingSuccess = (req, res) => {
    res.render("customer/booking_success", {
        title: 'Booking Successful',
        booking: { id: req.params.id, service_name: 'Service', partner_name: 'Provider' }
    });
};

exports.getBookingForm = async (req, res, next) => {
    try {
        const service = await Service.getById(req.params.serviceId);
        if (!service) {
            const err = new Error("Service not found");
            err.status = 404;
            return next(err);
        }
        
        const [providers] = await require('../config/db').query("SELECT * FROM partners WHERE service_id = ?", [req.params.serviceId]);
        res.render("customer/booking_form", { 
            title: 'Book Service', 
            service, 
            providers,
            selectedPartnerId: req.query.partner_id 
        });
    } catch (err) {
        next(err);
    }
};

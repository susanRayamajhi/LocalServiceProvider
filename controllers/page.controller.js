const Service = require("../models/service.model");
const Partner = require("../models/partner.model");

exports.getHome = async (req, res) => {
    try {
        const services = await Service.getFeatured(6);
        res.render("index", { title: 'Home', services });
    } catch (err) {
        console.error(err);
        res.render("index", { title: 'Home', services: [], error: "Error fetching services" });
    }
};

exports.getServices = async (req, res) => {
    try {
        const services = await Service.getAll();
        res.render("services_list", { title: 'Our Services', services });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching services");
    }
};

exports.getServiceDetail = async (req, res) => {
    try {
        const service = await Service.getById(req.params.id);
        if (!service) return res.status(404).send("Service not found");
        
        const providers = await Partner.getProvidersByService(req.params.id);
        res.render("service_detail", { title: service.name, service, providers });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.getProviders = async (req, res) => {
    try {
        const providers = await Partner.getAll();
        res.render("providers_list", { title: 'Our Partners', providers });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching providers");
    }
};

exports.getProviderDetail = async (req, res) => {
    try {
        const provider = await Partner.getById(req.params.id);
        if (!provider) return res.status(404).send("Provider not found");
        
        const services = await Partner.getServicesByPartner(req.params.id);
        res.render("provider_detail", { title: provider.name, provider, services });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.getLogin = (req, res) => {
    if (req.session.uid) return res.redirect('/');
    res.render("login", { title: 'Login' });
};

exports.getSignup = (req, res) => {
    if (req.session.uid) return res.redirect('/');
    res.render("signup", { title: 'Signup' });
};

exports.getOtp = (req, res) => {
    res.render("otp", { title: 'Verify OTP', email: req.query.email });
};

exports.getFeedback = (req, res) => {
    res.render("feedback", {
        title: 'Rate Your Experience',
        booking: { id: req.params.bookingId },
        partner: { name: 'Professional' }
    });
};

exports.getBookingSuccess = (req, res) => {
    res.render("booking_success", {
        title: 'Booking Successful',
        booking: { id: req.params.id, service_name: 'Service', partner_name: 'Provider' }
    });
};

exports.getBookingForm = async (req, res) => {
    try {
        const service = await Service.getById(req.params.serviceId);
        if (!service) return res.status(404).send("Service not found");
        
        const providers = await Partner.getProvidersByService(req.params.serviceId);
        res.render("booking_form", { 
            title: 'Book Service', 
            service, 
            providers,
            selectedPartnerId: req.query.partner_id 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

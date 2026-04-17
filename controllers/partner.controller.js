const Partner = require('../models/partner.model.js');
const Booking = require('../models/booking.model.js');
const Service = require('../models/service.model.js');

// Search for partners/professionals
exports.search = (req, res) => {
    const filters = {
        keyword: req.query.keyword || req.query.search,
        category_id: req.query.category_id || req.query.category,
        service_id: req.query.service_id
    };

    Service.search(filters, (err, data) => {
        if (err) {
            console.error("Partner API Search Error:", err);
            res.status(500).send({
                message: "Unable to load data. Please try again."
            });
        } else {
            res.send(data);
        }
    });
};
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service.js');
const db = require('../models/db.js');

// Signup
exports.signup = (req, res) => {
    // Validate request
    if (!req.body || !req.body.email || !req.body.password || !req.body.name || !req.body.phone || !req.body.service_id) {
        return res.status(400).send({
            message: "All fields are required!"
        });
    }

    const { name, email, phone, password, service_id, description, pricing } = req.body;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).send({
            message: "Invalid email format."
        });
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&])[A-Za-z\d!@#$%&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).send({
            message: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
        });
    }

    // Check if partner already exists
    Partner.findByEmail(email, (err, data) => {
        if (err && err.kind !== "not_found") {
            return res.status(500).send({
                message: "Error checking if email already exists."
            });
        }
        if (data) {
            return res.status(400).send({
                message: "Email is already registered. Please login."
            });
        }

        // Hash password
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                return res.status(500).send({
                    message: "Error hashing password."
                });
            }

            // Check if OTP was sent recently (Spam protection - 1 minute)
            db.query("SELECT created_at FROM otps WHERE email = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)", [email], (err, spamCheck) => {
                if (spamCheck && spamCheck.length > 0) {
                    return res.status(429).send({ message: "Please wait at least 1 minute before requesting another OTP." });
                }

                // Generate OTP
                const otp = Math.floor(100000 + Math.random() * 900000).toString();

                // Create a Partner object (not yet in DB)
                const partner = new Partner({
                    name: name,
                    email: email,
                    password: hash,
                    phone: phone,
                    service_id: service_id,
                    description: description,
                    pricing: pricing,
                    is_approved: 0,
                    is_verified: 0
                });

                // Store partner data and OTP in temporary table
                db.query("INSERT INTO otps (email, otp, user_data) VALUES (?, ?, ?)", [email, otp, JSON.stringify(partner)], async (err, result) => {
                    if (err) {
                        console.error("Partner Signup DB Error:", err);
                        // If error is about missing column, try to add it
                        if (err.code === 'ER_BAD_FIELD_ERROR' && err.message.includes('user_data')) {
                            db.query("ALTER TABLE otps ADD COLUMN user_data TEXT", (alterErr) => {
                                if (alterErr) {
                                    return res.status(500).send({ message: "Error updating database schema for OTP." });
                                }
                                // Retry the insert
                                db.query("INSERT INTO otps (email, otp, user_data) VALUES (?, ?, ?)", [email, otp, JSON.stringify(partner)], async (retryErr) => {
                                    if (retryErr) return res.status(500).send({ message: "Error during partner signup process after schema update." });
                                    
                                    try {
                                        await emailService.sendOTPEmail(email, otp);
                                        res.status(200).send({ message: "OTP sent to your email.", dev_otp: otp });
                                    } catch (error) {
                                        return res.status(500).send({ message: "Error sending verification email." });
                                    }
                                });
                            });
                            return;
                        }
                        return res.status(500).send({
                            message: "Error during signup process."
                        });
                    }

                    try {
                        await emailService.sendOTPEmail(email, otp);
                        res.status(200).send({ message: "OTP sent to your email.", dev_otp: otp });
                    } catch (error) {
                        console.log("Email error:", error);
                        return res.status(500).send({ message: "Error sending verification email. Check your email or use DEV OTP." });
                    }
                });
            });
        });
    });
};

// Verify OTP
exports.verifyOtp = (req, res) => {
    const { email, otp } = req.body;

    // Check OTP and ensure it's not older than 10 minutes
    db.query(
        "SELECT * FROM otps WHERE email = ? AND otp = ? AND created_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE) ORDER BY created_at DESC LIMIT 1", 
        [email, otp], 
        (err, results) => {
            if (err || results.length === 0) {
                return res.status(400).send({ message: "Invalid or expired OTP." });
            }

            const partnerData = JSON.parse(results[0].user_data);
            const newPartner = new Partner(partnerData);
            newPartner.is_verified = 1; // Mark as verified

            Partner.create(newPartner, (err, data) => {
                if (err) {
                    console.error("Partner Creation Error:", err);
                    
                    // Auto-fix: If columns are missing, try to add them and retry
                    if (err.code === 'ER_BAD_FIELD_ERROR') {
                        const missingCol = err.message.match(/Unknown column '(.+?)' in 'field list'/);
                        if (missingCol && missingCol[1]) {
                            const colName = missingCol[1];
                            let colType = "TEXT"; 
                            if (colName === 'phone') colType = "VARCHAR(255)"; // Use larger size to be safe
                            if (colName === 'is_verified' || colName === 'is_suspended') colType = "TINYINT(1) DEFAULT 0";
                            if (colName === 'experience') colType = "INT DEFAULT 0";
                            
                            db.query(`ALTER TABLE partners ADD COLUMN ${colName} ${colType}`, (alterErr) => {
                                if (alterErr) return res.status(500).send({ message: "Error fixing schema: " + alterErr.message });
                                Partner.create(newPartner, (retryErr) => {
                                    if (retryErr) return res.status(500).send({ message: "Retry failed: " + retryErr.message + ". Please try verifying again." });
                                    db.query("DELETE FROM otps WHERE email = ?", [email]);
                                    res.status(201).send({ message: "Verification successful! Account created." });
                                });
                            });
                            return;
                        }
                    }

                    // Handle data too long (e.g. phone number)
                    if (err.code === 'ER_DATA_TOO_LONG') {
                        const colMatch = err.message.match(/column '(.+?)' at row/);
                        if (colMatch && colMatch[1]) {
                            const colName = colMatch[1];
                            db.query(`ALTER TABLE partners MODIFY COLUMN ${colName} VARCHAR(255)`, (modErr) => {
                                if (modErr) return res.status(500).send({ message: "Error increasing column size: " + modErr.message });
                                Partner.create(newPartner, (retryErr) => {
                                    if (retryErr) return res.status(500).send({ message: "Retry failed: " + retryErr.message });
                                    db.query("DELETE FROM otps WHERE email = ?", [email]);
                                    res.status(201).send({ message: "Verification successful! Account created." });
                                });
                            });
                            return;
                        }
                    }
                    res.status(500).send({ message: "Error creating partner account: " + err.message });
                } else {
                    // Delete OTP after successful verification
                    db.query("DELETE FROM otps WHERE email = ?", [email]);
                    res.status(201).send({ message: "Email verified successfully! Your account is now pending admin approval." });
                }
            });
        }
    );
};

// Login
exports.login = (req, res) => {
    // Validate request
    if (!req.body || !req.body.email || !req.body.password) {
        return res.status(400).send({
            message: "Email and password are required!"
        });
    }

    const { email, password } = req.body;

    Partner.findByEmail(email, (err, partner) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Partner with email ${email}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving Partner with email " + email
                });
            }
        } else {
            // Check if approved
            if (!partner.is_approved) {
                return res.status(403).send({
                    message: "Your account is pending admin approval. You cannot login yet."
                });
            }

            // Check if suspended
            if (partner.is_suspended) {
                return res.status(403).send({
                    message: "Your account has been suspended by the admin. Please contact support."
                });
            }

            // Check password
            bcrypt.compare(password, partner.password, (err, result) => {
                if (result) {
                    // Create a token with role
                    const token = jwt.sign({ id: partner.id, role: 'partner' }, 'MyProject2026SecureKey', { // Add your secret key
                        expiresIn: 86400 // 24 hours
                    });
                    res.status(200).send({
                        id: partner.id,
                        email: partner.email,
                        accessToken: token
                    });
                } else {
                    res.status(401).send({
                        message: "Invalid Password!"
                    });
                }
            });
        }
    });
};

// Get partner profile
exports.getProfile = (req, res) => {
    // Ownership check
    if (req.params.id != req.userId) {
        return res.status(403).send({ message: "Access denied: You can only view your own profile." });
    }

    Partner.findById(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Partner with id ${req.params.id}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving Partner with id " + req.params.id
                });
            }
        } else res.send(data);
    });
};

// Update partner profile
exports.updateProfile = (req, res) => {
    // Validate Request
    if (!req.body) {
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    // Ownership check
    if (req.params.id != req.userId) {
        return res.status(403).send({ message: "Access denied: You can only update your own profile." });
    }

    // Basic Sanitization to prevent XSS
    const sanitize = (str) => {
        if (!str) return str;
        return str.replace(/[<>]/g, ""); // Remove < and >
    };

    const partnerData = {
        name: sanitize(req.body.name),
        description: sanitize(req.body.description),
        pricing: sanitize(req.body.pricing),
        profile_image: sanitize(req.body.profile_image),
        work_images: sanitize(req.body.work_images),
        phone: sanitize(req.body.phone),
        service_id: req.body.service_id
    };

    // Ensure pricing has GBP symbol if it's meant to be descriptive
    if (partnerData.pricing && !partnerData.pricing.includes("£")) {
        partnerData.pricing = "£" + partnerData.pricing;
    }

    Partner.updateById(
        req.params.id,
        new Partner(partnerData),
        (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found Partner with id ${req.params.id}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Error updating Partner with id " + req.params.id
                    });
                }
            } else res.send(data);
        }
    );
};

// Get partner bookings
exports.getBookings = (req, res) => {
    // Role and Ownership check
    if (req.role !== 'partner' || req.params.id != req.userId) {
        return res.status(403).send({ message: "Access denied: You can only view your own bookings." });
    }

    Partner.getBookings(req.params.id, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving bookings."
            });
        else res.send(data);
    });
};

// Unify Booking Actions (Accept, Reject, Update Status)
exports.updateBookingStatus = (req, res) => {
    const bookingId = req.params.id;
    const partnerId = req.userId;
    let { status } = req.body;

    // Support legacy endpoints if status is not in body
    if (!status) {
        if (req.path.includes('/accept')) status = 'Accepted';
        if (req.path.includes('/reject')) status = 'Rejected';
    }

    const allowedStatuses = ['Accepted', 'Rejected', 'In Progress', 'Completed'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).send({ message: "Invalid status update request." });
    }

    // 1. Verify booking exists and belongs to this partner
    Booking.getById(bookingId, (err, booking) => {
        if (err) {
            if (err.kind === "not_found") {
                return res.status(404).send({ message: "Booking not found." });
            }
            return res.status(500).send({ message: "Error retrieving booking." });
        }

        if (booking.partner_id != partnerId) {
            return res.status(403).send({ message: "Access denied: This booking is not assigned to you." });
        }

        // 2. Strict State Machine Transition Rules
        if ((status === 'Accepted' || status === 'Rejected') && booking.status !== 'Pending') {
            return res.status(400).send({ message: `Only 'Pending' bookings can be ${status.toLowerCase()}. Current status is ${booking.status}.` });
        }
        
        if (status === 'In Progress' && booking.status !== 'Accepted' && booking.status !== 'Paid') {
            return res.status(400).send({ message: "Job must be Accepted or Paid before moving to In Progress." });
        }
        
        if (status === 'Completed' && booking.status !== 'In Progress') {
            return res.status(400).send({ message: "Job must be 'In Progress' before marking as Completed." });
        }

        // 3. Update status in database
        Partner.updateBookingStatus(bookingId, status, (err, data) => {
            if (err) {
                res.status(500).send({
                    message: "Error updating status to " + status
                });
            } else res.send({ message: `Booking status updated to ${status} successfully.` });
        });
    });
};

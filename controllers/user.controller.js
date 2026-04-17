const User = require('../models/user.model.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service.js');
const db = require('../models/db.js');

// Signup
exports.signup = (req, res) => {
    // Validate request
    if (!req.body || !req.body.email || !req.body.password || !req.body.name || !req.body.phone) {
        return res.status(400).send({
            message: "All fields are required!"
        });
    }

    const { name, email, phone, password } = req.body;

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

    // Check if user already exists
    User.findByEmail(email, (err, data) => {
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

                // Create a User
                const user = new User({
                    name: name,
                    email: email,
                    password: hash,
                    phone: phone
                });

            // Store user and OTP in temporary table or logic
            // For this project, we'll use a simple table called 'otps'
            // Ensure the column 'user_data' exists (In a real app, this should be a migration)
            db.query("INSERT INTO otps (email, otp, user_data) VALUES (?, ?, ?)", [email, otp, JSON.stringify(user)], async (err, result) => {
                if (err) {
                    console.error("Signup DB Error:", err);
                    // If error is about missing column, try to add it (fallback for missing migrations)
                    if (err.code === 'ER_BAD_FIELD_ERROR' && err.message.includes('user_data')) {
                        db.query("ALTER TABLE otps ADD COLUMN user_data TEXT", (alterErr) => {
                            if (alterErr) {
                                return res.status(500).send({ message: "Error updating database schema for OTP." });
                            }
                            // Retry the insert
                            db.query("INSERT INTO otps (email, otp, user_data) VALUES (?, ?, ?)", [email, otp, JSON.stringify(user)], async (retryErr) => {
                                if (retryErr) return res.status(500).send({ message: "Error during signup process after schema update." });
                                
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

            const userData = JSON.parse(results[0].user_data);
            const newUser = new User(userData);

            User.create(newUser, (err, data) => {
                if (err) {
                    res.status(500).send({ message: "Error creating user account." });
                } else {
                    // Delete OTP after successful verification
                    db.query("DELETE FROM otps WHERE email = ?", [email]);
                    res.status(201).send({ message: "OTP verified successfully. Please login." });
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

    User.findByEmail(email, (err, user) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found User with email ${email}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving User with email " + email
                });
            }
        } else {
            // Check if suspended
            if (user.is_suspended) {
                return res.status(403).send({
                    message: "Your account has been suspended by the admin. Please contact support."
                });
            }

            // Check password
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    // Create a token with role
                    const token = jwt.sign({ id: user.id, role: 'user' }, 'MyProject2026SecureKey', {
                        expiresIn: 86400 // 24 hours
                    });
                    res.status(200).send({
                        id: user.id,
                        email: user.email,
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

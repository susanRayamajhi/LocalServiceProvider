const User = require('../models/user.model.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require('../models/db.js');

// Signup
exports.signup = (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    const { email, password } = req.body;

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
                message: "You already have an account. Please login."
            });
        }

        // Hash password
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                return res.status(500).send({
                    message: "Error hashing password."
                });
            }

            // Create a User
            const user = new User({
                email: email,
                password: hash
            });

            // Save User in the database
            User.create(user, (err, data) => {
                if (err)
                    res.status(500).send({
                        message:
                            err.message || "Some error occurred while creating the User."
                    });
                else {
                    // Send OTP
                    const otp = Math.floor(100000 + Math.random() * 900000);
                    db.query('INSERT INTO otps SET ?', { email: email, otp: otp }, (err, result) => {
                        if (err) {
                            return res.status(500).send({
                                message: "Error saving OTP."
                            });
                        }
                        // Send email
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: 'tailorvatsal17@gmail.com', // Add your email
                                pass: 'hzzw xsat yulx ouph' // Add your password
                            }
                        });

                        const mailOptions = {
                            from: 'tailorvatsal17@gmail.com',
                            to: email,
                            subject: 'OTP for Local Service Provider Verification',
                            text: `Your OTP is: ${otp}`
                        };

                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.log(error);
                                return res.status(500).send({ message: "Error sending OTP email." });
                            }
                            console.log('Email sent: ' + info.response);
                            res.status(200).send({ message: "OTP sent to your email." });
                        });
                    });
                }
            });
        });
    });
};

// OTP Verification
exports.verifyOtp = (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    const { email, otp } = req.body;

    db.query('SELECT * FROM otps WHERE email = ? AND otp = ?', [email, otp], (err, result) => {
        if (err) {
            return res.status(500).send({
                message: "Error verifying OTP."
            });
        }

        if (result.length > 0) {
            // OTP is correct
            db.query('DELETE FROM otps WHERE email = ?', [email], (err, result) => {
                if (err) {
                    return res.status(500).send({
                        message: "Error deleting OTP."
                    });
                }
                res.status(200).send({ message: "OTP verified successfully. Please login." });
            });
        } else {
            res.status(400).send({
                message: "Invalid OTP."
            });
        }
    });
};

// Login
exports.login = (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
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
            // Check password
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    // Create a token
                    const token = jwt.sign({ id: user.id }, 'MyProject2026SecureKey', { // Add your secret key
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

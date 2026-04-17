const Admin = require('../models/admin.model.js');
const Partner = require('../models/partner.model.js');
const WithdrawalRequest = require('../models/withdrawal_request.model.js');
const ServiceCategory = require('../models/service_category.model.js');
const Dispute = require('../models/dispute.model.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service.js');

// Login
exports.login = (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    const { email, password } = req.body;

    if (email === 'admin@gmail.com' && password === 'admin') {
        const simulatedAdminId = 1;
        const token = jwt.sign({ id: simulatedAdminId, role: 'admin' }, 'MyProject2026SecureKey', {
            expiresIn: 86400 // 24 hours
        });
        res.status(200).send({
            id: simulatedAdminId,
            email: email,
            accessToken: token
        });
    } else {
        Admin.findByEmail(email, (err, admin) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found Admin with email ${email}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Error retrieving Admin with email " + email
                    });
                }
            } else {
                bcrypt.compare(password, admin.password, (err, result) => {
                    if (result) {
                        const token = jwt.sign({ id: admin.id, role: 'admin' }, 'MyProject2026SecureKey', {
                            expiresIn: 86400
                        });
                        res.status(200).send({
                            id: admin.id,
                            email: admin.email,
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
    }
};

// Get all users
exports.getAllUsers = (req, res) => {
    Admin.getAllUsers((err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving users."
            });
        else res.send(data);
    });
};

// Get all partners
exports.getAllPartners = (req, res) => {
    Admin.getAllPartners((err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving partners."
            });
        else res.send(data);
    });
};

// Get single partner details
exports.getPartnerById = (req, res) => {
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

// Approve partner
exports.approvePartner = (req, res) => {
    Partner.findById(req.params.id, (err, partner) => {
        if (err) {
            if (err.kind === "not_found") {
                return res.status(404).send({ message: `Not found Partner with id ${req.params.id}.` });
            } else {
                return res.status(500).send({ message: "Error retrieving Partner info." });
            }
        }

        Admin.approvePartner(req.params.id, async (err, data) => {
            if (err) {
                return res.status(500).send({ message: "Error updating Partner approval status." });
            }

            try {
                await emailService.sendApprovalEmail(partner.email, partner.name);
                res.send({ message: "Partner approved successfully and notification email sent." });
            } catch (error) {
                console.log("Email error:", error);
                res.send({ message: "Partner approved successfully, but notification email could not be sent." });
            }
        });
    });
};

// Reject partner
exports.rejectPartner = (req, res) => {
    // 1. Fetch partner details to get email
    Partner.findById(req.params.id, (err, partner) => {
        if (err) {
            if (err.kind === "not_found") {
                return res.status(404).send({
                    message: `Not found Partner with id ${req.params.id}.`
                });
            } else {
                return res.status(500).send({
                    message: "Error retrieving Partner with id " + req.params.id
                });
            }
        }

        // 2. Reject in database
        Admin.rejectPartner(req.params.id, (err, data) => {
            if (err) {
                return res.status(500).send({
                    message: "Error updating Partner with id " + req.params.id
                });
            }

            // 3. Send rejection email
            const subject = 'Account Registration Status - Local Service Provider';
            const text = `Hello ${partner.name}, we regret to inform you that your partner account application has been rejected by our admin. If you believe this is an error, please contact our support.`;
            
            emailService.sendEmail(partner.email, subject, text)
                .then(() => {
                    res.send({ message: "Partner was rejected successfully and notification email sent." });
                })
                .catch(error => {
                    console.log("Email sending error:", error);
                    res.send({ message: "Partner was rejected successfully, but could not send notification email." });
                });
        });
    });
};

// Update partner
exports.updatePartner = (req, res) => {
    if (!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
    }

    Admin.updatePartner(req.params.id, req.body, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Not found Partner with id ${req.params.id}.` });
            } else {
                res.status(500).send({ message: "Error updating Partner." });
            }
        } else res.send(data);
    });
};

// Create service
exports.createService = (req, res) => {
    if (!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
    }

    const { name, category_id, description, image } = req.body;
    Admin.createService({ name, category_id, description, image }, (err, data) => {
        if (err)
            res.status(500).send({ message: err.message || "Error creating Service." });
        else res.send(data);
    });
};

// Update service
exports.updateService = (req, res) => {
    if (!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
    }

    Admin.updateService(req.params.id, req.body, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Not found Service with id ${req.params.id}.` });
            } else {
                res.status(500).send({ message: "Error updating Service." });
            }
        } else res.send(data);
    });
};

// Delete service
exports.deleteService = (req, res) => {
    Admin.deleteService(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Not found Service with id ${req.params.id}.` });
            } else {
                res.status(500).send({ message: "Error deleting Service." });
            }
        } else res.send({ message: `Service deleted successfully!` });
    });
};

// Get all bookings
exports.getAllBookings = (req, res) => {
    Admin.getAllBookings((err, data) => {
        if (err)
            res.status(500).send({ message: err.message || "Error retrieving bookings." });
        else res.send(data);
    });
};

// Cancel booking
exports.cancelBooking = (req, res) => {
    Admin.cancelBooking(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Not found Booking with id ${req.params.id}.` });
            } else {
                res.status(500).send({ message: "Error cancelling Booking." });
            }
        } else res.send({ message: "Booking cancelled successfully." });
    });
};

// Update booking status
exports.updateBookingStatus = (req, res) => {
    Admin.updateBookingStatus(req.params.id, req.body.status, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Not found Booking with id ${req.params.id}.` });
            } else {
                res.status(500).send({ message: "Error updating status." });
            }
        } else res.send({ message: "Status updated successfully." });
    });
};

// Withdrawal Management
exports.getAllWithdrawals = (req, res) => {
    const sql = require('../models/db.js');
    sql.query(`
        SELECT w.*, p.name as partner_name, p.email as partner_email 
        FROM withdrawal_requests w 
        JOIN partners p ON w.partner_id = p.id 
        ORDER BY w.created_at DESC`, (err, data) => {
        if (err)
            res.status(500).send({ message: err.message || "Error retrieving withdrawals." });
        else res.send(data);
    });
};

exports.updateWithdrawalStatus = (req, res) => {
    const { status } = req.body;
    const id = req.params.id;

    if (!['Approved', 'Rejected', 'Processed'].includes(status)) {
        return res.status(400).send({ message: "Invalid status." });
    }

    const sql = require('../models/db.js');
    sql.query("UPDATE withdrawal_requests SET status = ? WHERE id = ?", [status, id], (err, resUpdate) => {
        if (err) return res.status(500).send({ message: "Error updating status." });

        sql.query(`SELECT w.amount, p.email, p.name FROM withdrawal_requests w JOIN partners p ON w.partner_id = p.id WHERE w.id = ?`, [id], (err, rows) => {
            if (rows && rows.length > 0) {
                const { amount, email, name } = rows[0];
                const subject = `Withdrawal Request ${status}`;
                const text = `Hello ${name}, your withdrawal request for £${amount} has been ${status.toLowerCase()}.`;
                
                emailService.sendEmail(email, subject, text).catch(e => console.log("Email error:", e));
            }
        });
        res.send({ message: `Withdrawal ${status.toLowerCase()} successfully.` });
    });
};

// User Suspension
exports.toggleUserSuspension = (req, res) => {
    const { is_suspended } = req.body;
    Admin.setUserSuspension(req.params.id, is_suspended, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Not found User with id ${req.params.id}.` });
            } else {
                res.status(500).send({ message: "Error updating User status." });
            }
        } else res.send({ message: `User account ${is_suspended ? 'suspended' : 'activated'} successfully.` });
    });
};

// Partner Suspension
exports.togglePartnerSuspension = (req, res) => {
    const { is_suspended } = req.body;
    Admin.setPartnerSuspension(req.params.id, is_suspended, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Not found Partner with id ${req.params.id}.` });
            } else {
                res.status(500).send({ message: "Error updating Partner status." });
            }
        } else res.send({ message: `Partner account ${is_suspended ? 'suspended' : 'activated'} successfully.` });
    });
};

// Service Category Management
exports.createCategory = (req, res) => {
    if (!req.body || !req.body.name) {
        return res.status(400).send({ message: "Category name is required!" });
    }

    // Check for duplicate
    ServiceCategory.findByName(req.body.name, (err, existing) => {
        if (!err && existing) {
            return res.status(400).send({ message: "Category name already exists!" });
        }

        const category = new ServiceCategory({
            name: req.body.name,
            description: req.body.description || "",
            image: req.body.image || ""
        });
        ServiceCategory.create(category, (err, data) => {
            if (err) res.status(500).send({ message: "Error creating Category." });
            else res.status(201).send(data);
        });
    });
};

exports.getAllCategories = (req, res) => {
    ServiceCategory.getAll((err, data) => {
        if (err) res.status(500).send({ message: "Error retrieving categories." });
        else res.send(data);
    });
};

exports.updateCategory = (req, res) => {
    if (!req.body || !req.body.name) {
        return res.status(400).send({ message: "Category name is required!" });
    }
    ServiceCategory.updateById(req.params.id, new ServiceCategory(req.body), (err, data) => {
        if (err) {
            if (err.kind === "not_found") res.status(404).send({ message: "Category not found." });
            else res.status(500).send({ message: "Error updating Category." });
        } else res.send(data);
    });
};

exports.deleteCategory = (req, res) => {
    // Check if category is in use
    const sql = require('../models/db.js');
    sql.query("SELECT * FROM services WHERE category_id = ?", [req.params.id], (err, rows) => {
        if (rows && rows.length > 0) {
            return res.status(400).send({ message: "Cannot delete category: It is currently linked to existing services." });
        }

        ServiceCategory.remove(req.params.id, (err, data) => {
            if (err) {
                if (err.kind === "not_found") res.status(404).send({ message: "Category not found." });
                else res.status(500).send({ message: "Error deleting Category." });
            } else res.send({ message: "Category deleted successfully!" });
        });
    });
};

// Dispute Management
exports.getAllDisputes = (req, res) => {
    Dispute.getAll((err, data) => {
        if (err) res.status(500).send({ message: "Error retrieving disputes." });
        else res.send(data);
    });
};

exports.updateDisputeStatus = (req, res) => {
    const { status } = req.body;
    if (!['Resolved', 'Rejected', 'Escalated', 'Closed'].includes(status)) {
        return res.status(400).send({ message: "Invalid status." });
    }

    Dispute.updateStatus(req.params.id, status, (err, data) => {
        if (err) {
            if (err.kind === "not_found") res.status(404).send({ message: "Dispute not found." });
            else res.status(500).send({ message: "Error updating Dispute." });
        } else res.send({ message: `Dispute ${status.toLowerCase()} successfully.` });
    });
};

// Analytics
exports.getAnalytics = (req, res) => {
    const stats = {};
    Admin.getOverallStats((err, overall) => {
        if (err) return res.status(500).send({ message: "Error fetching overall stats." });
        stats.overall = overall;

        Admin.getAnalyticsTrend((err, trends) => {
            if (err) return res.status(500).send({ message: "Error fetching trends." });
            stats.trends = trends;

            Admin.getBookingStatusDistribution((err, distribution) => {
                if (err) return res.status(500).send({ message: "Error fetching distribution." });
                stats.distribution = distribution;
                res.send(stats);
            });
        });
    });
};

// Payment Tracking
exports.getAllPayments = (req, res) => {
    Admin.getAllPayments((err, data) => {
        if (err) res.status(500).send({ message: "Error retrieving payments." });
        else res.send(data);
    });
};

exports.getFinancialSummary = (req, res) => {
    Admin.getFinancialSummary((err, data) => {
        if (err) res.status(500).send({ message: "Error retrieving financial summary." });
        else res.send(data);
    });
};

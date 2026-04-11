-- Database: local_service_provider
-- Fully Normalized Schema for LSP
CREATE DATABASE IF NOT EXISTS local_service_provider;
USE local_service_provider;

-- =============================================================================
-- 1. CATEGORIES & SERVICES
-- =============================================================================

CREATE TABLE IF NOT EXISTS service_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    base_price DECIMAL(10, 2),
    FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE
);

-- =============================================================================
-- 2. USERS & ADDRESSES
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('customer', 'admin') DEFAULT 'customer',
    is_suspended BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================================================
-- 3. PARTNERS & AVAILABILITY
-- =============================================================================

CREATE TABLE IF NOT EXISTS partners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    service_id INT NOT NULL,
    description TEXT,
    profile_image VARCHAR(255),
    work_images TEXT,
    pricing DECIMAL(10, 2),
    experience INT DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    is_approved BOOLEAN DEFAULT FALSE,
    is_suspended BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS partner_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partner_id INT NOT NULL,
    available_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('Available', 'Booked', 'Blocked') DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
);

-- =============================================================================
-- 4. BOOKINGS & STATUS HISTORY
-- =============================================================================

CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    partner_id INT NOT NULL,
    service_id INT NOT NULL,
    address_id INT,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected') DEFAULT 'Pending',
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS booking_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected') NOT NULL,
    changed_by_type ENUM('user', 'partner', 'admin') NOT NULL,
    changed_by_id INT NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- =============================================================================
-- 5. PAYMENTS & REVIEWS
-- =============================================================================

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Online',
    transaction_id VARCHAR(255) UNIQUE,
    status ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    user_id INT NOT NULL,
    partner_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
);

-- =============================================================================
-- 6. COMMUNICATION (CHAT & NOTIFICATIONS)
-- =============================================================================

CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    sender_id INT NOT NULL,
    sender_type ENUM('customer', 'partner', 'admin') NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    partner_id INT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    CHECK (user_id IS NOT NULL OR partner_id IS NOT NULL)
);

-- =============================================================================
-- 7. PARTNER VERIFICATION & EARNINGS
-- =============================================================================

CREATE TABLE IF NOT EXISTS partner_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partner_id INT NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_url VARCHAR(255) NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partner_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected', 'Completed') DEFAULT 'Pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS partner_earnings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partner_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type ENUM('Credit', 'Debit') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
);

-- =============================================================================
-- 8. SYSTEM & AUTHENTICATION
-- =============================================================================

CREATE TABLE IF NOT EXISTS otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS disputes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    raised_by_id INT NOT NULL,
    raised_by_type ENUM('customer', 'partner') NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('Open', 'In-Review', 'Resolved', 'Closed') DEFAULT 'Open',
    resolution TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- =============================================================================
-- 9. INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_partner_id ON bookings(partner_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_partner_availability_date ON partner_availability(available_date);
CREATE INDEX idx_reviews_partner_id ON reviews(partner_id);

-- =============================================================================
-- 10. COMPREHENSIVE SAMPLE DATA
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE withdrawal_requests;
TRUNCATE TABLE partner_documents;
TRUNCATE TABLE notifications;
TRUNCATE TABLE disputes;
TRUNCATE TABLE chat_messages;
TRUNCATE TABLE reviews;
TRUNCATE TABLE payments;
TRUNCATE TABLE booking_status_history;
TRUNCATE TABLE bookings;
TRUNCATE TABLE partner_availability;
TRUNCATE TABLE partner_earnings;
TRUNCATE TABLE partners;
TRUNCATE TABLE addresses;
TRUNCATE TABLE users;
TRUNCATE TABLE services;
TRUNCATE TABLE service_categories;
SET FOREIGN_KEY_CHECKS = 1;

-- Common Hash for 'password123'
SET @common_hash = '$2a$10$I67c33eQxMh6ej57qiEj9eWviiko7S40LcvauJK3asR2ZKgLZN6s6';

-- 1. service_categories
INSERT INTO service_categories (id, name, description, image) VALUES
(1, 'Carpentry', 'Woodwork and furniture repairs', 'carpentry_icon.png'),
(2, 'Pest Control', 'Eradicating unwanted pests', 'pest_control_icon.png'),
(3, 'Appliance Repair', 'Fixing household appliances', 'appliance_repair_icon.png');

-- 2. services
INSERT INTO services (id, category_id, name, description, image, base_price) VALUES
(1, 1, 'Furniture Assembly', 'Assembling new furniture like beds, wardrobes', 'furniture_assembly.png', 120.00),
(2, 2, 'Cockroach Control', 'Comprehensive pest control for kitchens', 'cockroach_control.png', 90.00),
(3, 3, 'Washing Machine Repair', 'Fixing common washing machine issues', 'washing_machine.png', 110.00);

-- 3. users
INSERT INTO users (id, name, email, password, phone, role, is_verified) VALUES
(1, 'Admin User', 'admin@gmail.com', @common_hash, '9999999999', 'admin', 1),
(2, 'Customer One', 'customer@gmail.com', @common_hash, '8888888888', 'customer', 1);

-- 4. addresses
INSERT INTO addresses (id, user_id, address, city, state, zip_code, is_default) VALUES
(1, 2, '123 Customer St', 'Tech City', 'Tech State', '12345', 1);

-- 5. partners
INSERT INTO partners (id, name, email, password, phone, service_id, description, pricing, experience, rating, is_approved, is_verified) VALUES
(1, 'Mike Carpentry', 'partner@gmail.com', @common_hash, '8765432101', 1, 'Expert carpenter with 10 years experience', 50.00, 10, 4.8, 1, 1),
(2, 'Pest Killers Inc', 'contact@pestkillers.com', @common_hash, '8765432102', 2, 'Certified pest control specialists', 40.00, 5, 4.5, 1, 1);

-- 6. bookings
INSERT INTO bookings (id, user_id, partner_id, service_id, address_id, booking_date, booking_time, total_cost, status) VALUES
(1, 2, 1, 1, 1, '2026-03-12', '10:00:00', 120.00, 'Pending'),
(2, 2, 2, 2, 1, '2026-03-13', '09:30:00', 90.00, 'Completed');

-- 7. booking_status_history
INSERT INTO booking_status_history (booking_id, status, changed_by_type, changed_by_id, note) VALUES
(1, 'Pending', 'user', 2, 'Initial booking created'),
(2, 'Pending', 'user', 2, 'Initial booking created'),
(2, 'Confirmed', 'partner', 2, 'Partner accepted booking'),
(2, 'Completed', 'partner', 2, 'Service completed');

-- 8. payments
INSERT INTO payments (booking_id, user_id, amount, transaction_id, status) VALUES
(2, 2, 90.00, 'TXN123456789', 'Completed');

-- 9. reviews
INSERT INTO reviews (booking_id, user_id, partner_id, rating, comment) VALUES
(2, 2, 2, 5, 'Great and quick service!');

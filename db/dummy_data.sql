-- Use the database
USE service_booking;

-- 1. service_categories (10 entries)
INSERT INTO service_categories (id, name, description, image) VALUES
(101, 'Carpentry', 'Woodwork and furniture repairs', 'carpentry_icon.png'),
(102, 'Pest Control', 'Eradicating unwanted pests', 'pest_control_icon.png'),
(103, 'Appliance Repair', 'Fixing household appliances', 'appliance_repair_icon.png'),
(104, 'Gardening', 'Garden maintenance and landscaping', 'gardening_icon.png'),
(105, 'Painting', 'Interior and exterior home painting', 'painting_icon.png'),
(106, 'AC Services', 'Air conditioning repair and maintenance', 'ac_services_icon.png'),
(107, 'Beauty & Spa', 'Professional grooming and spa at home', 'beauty_spa_icon.png'),
(108, 'Electrical', 'Electrical wiring and repairs', 'electrical_icon.png'),
(109, 'Plumbing', 'Water pipe and faucet repairs', 'plumbing_icon.png'),
(110, 'Automobile', 'Car and bike maintenance', 'auto_icon.png');

-- 2. services (10 entries)
INSERT INTO services (id, category_id, name, description, image, base_price) VALUES
(101, 101, 'Furniture Assembly', 'Assembling new furniture like beds, wardrobes', 'furniture_assembly.png', 120.00),
(102, 102, 'Cockroach Control', 'Comprehensive pest control for kitchens', 'cockroach_control.png', 90.00),
(103, 103, 'Washing Machine Repair', 'Fixing common washing machine issues', 'washing_machine.png', 110.00),
(104, 104, 'Lawn Mowing', 'Regular lawn mowing and trimming', 'lawn_mowing.png', 70.00),
(105, 105, 'Single Room Painting', 'Painting a single room with premium paint', 'room_painting.png', 200.00),
(106, 106, 'AC Gas Refill', 'Refilling AC gas and general servicing', 'ac_gas.png', 130.00),
(107, 107, 'Full Body Massage', 'Relaxing full body spa treatment', 'massage.png', 150.00),
(108, 108, 'Fan Repair', 'Repairing ceiling or table fans', 'fan_repair.png', 50.00),
(109, 109, 'Tap Leakage', 'Fixing leaky taps and faucets', 'tap_leak.png', 40.00),
(110, 110, 'Car Wash', 'Full exterior and interior car cleaning', 'car_wash.png', 100.00);

-- 3. users (15 entries)
INSERT INTO users (id, name, email, password, phone, is_suspended) VALUES
(101, 'Alice Johnson', 'alice@example.com', 'hashed_pass_1', 9876543210, 0),
(102, 'Bob Smith', 'bob@example.com', 'hashed_pass_2', 9876543211, 0),
(103, 'Charlie Brown', 'charlie@example.com', 'hashed_pass_3', 9876543212, 0),
(104, 'David Lee', 'david@example.com', 'hashed_pass_4', 9876543213, 0),
(105, 'Eve White', 'eve@example.com', 'hashed_pass_5', 9876543214, 0),
(106, 'Frank Miller', 'frank@example.com', 'hashed_pass_6', 9876543215, 0),
(107, 'Grace Wilson', 'grace@example.com', 'hashed_pass_7', 9876543216, 0),
(108, 'Henry Ford', 'henry@example.com', 'hashed_pass_8', 9876543217, 0),
(109, 'Ivy Taylor', 'ivy@example.com', 'hashed_pass_9', 9876543218, 0),
(110, 'Jack Daniels', 'jack@example.com', 'hashed_pass_10', 9876543219, 0),
(111, 'Kevin Hart', 'kevin@example.com', 'hashed_pass_11', 9876543220, 0),
(112, 'Laura Palmer', 'laura@example.com', 'hashed_pass_12', 9876543221, 0),
(113, 'Mike Ross', 'mike@example.com', 'hashed_pass_13', 9876543222, 0),
(114, 'Nina Simone', 'nina@example.com', 'hashed_pass_14', 9876543223, 0),
(115, 'Oscar Wilde', 'oscar@example.com', 'hashed_pass_15', 9876543224, 0);

-- 4. addresses (15 entries)
INSERT INTO addresses (id, user_id, address, city, state, zip_code, is_default) VALUES
(101, 101, '123 Maple St', 'Chicago', 'IL', '60601', 1),
(102, 102, '456 Oak Ave', 'New York', 'NY', '10001', 1),
(103, 103, '789 Pine Rd', 'San Francisco', 'CA', '94101', 1),
(104, 104, '321 Elm Dr', 'Austin', 'TX', '73301', 1),
(105, 105, '654 Birch Ln', 'Seattle', 'WA', '98101', 1),
(106, 106, '987 Cedar Blvd', 'Miami', 'FL', '33101', 1),
(107, 107, '210 Walnut St', 'Denver', 'CO', '80201', 1),
(108, 108, '555 Ash St', 'Detroit', 'MI', '48201', 1),
(109, 109, '777 Cherry Ct', 'Portland', 'OR', '97201', 1),
(110, 110, '888 Willow Wy', 'Boston', 'MA', '02101', 1),
(111, 111, '999 Spruce Dr', 'Atlanta', 'GA', '30301', 1),
(112, 112, '111 Poplar Ln', 'Phoenix', 'AZ', '85001', 1),
(113, 113, '222 Redwood Dr', 'Houston', 'TX', '77001', 1),
(114, 114, '333 Sycamore Ln', 'Dallas', 'TX', '75201', 1),
(115, 115, '444 Magnolia Dr', 'San Diego', 'CA', '92101', 1);

-- 5. partners (10 entries)
INSERT INTO partners (id, name, email, password, phone, service_id, description, profile_image, pricing, experience, rating, is_approved) VALUES
(101, 'Mike Carpentry', 'mike@carpentry.com', 'partner_pass_1', 8765432101, 101, 'Expert carpenter with 10 years experience', 'mike.png', 500, 10, 4.8, 1),
(102, 'Pest Killers Inc', 'contact@pestkillers.com', 'partner_pass_2', 8765432102, 102, 'Certified pest control specialists', 'pest.png', 300, 5, 4.5, 1),
(103, 'Appliance Pro', 'service@appliancepro.com', 'partner_pass_3', 8765432103, 103, 'Quick and reliable appliance repair', 'appliance.png', 400, 7, 4.7, 1),
(104, 'Green Gardeners', 'info@greengardens.com', 'partner_pass_4', 8765432104, 104, 'Dedicated to your garden health', 'garden.png', 250, 4, 4.2, 1),
(105, 'Rainbow Painters', 'sales@rainbowpainters.com', 'partner_pass_5', 8765432105, 105, 'High quality interior painting', 'paint.png', 800, 12, 4.9, 1),
(106, 'Chill Tech AC', 'support@chilltech.com', 'partner_pass_6', 8765432106, 106, 'Professional AC technician', 'ac.png', 450, 6, 4.6, 1),
(107, 'Zen Spa Services', 'zen@spaservices.com', 'partner_pass_7', 8765432107, 107, 'Certified massage therapist', 'spa.png', 600, 8, 4.8, 1),
(108, 'Volt Master', 'contact@voltmaster.com', 'partner_pass_8', 8765432108, 108, 'Experienced electrician', 'volt.png', 350, 9, 4.4, 1),
(109, 'Pipe Fixers', 'help@pipefixers.com', 'partner_pass_9', 8765432109, 109, '24/7 plumbing support', 'pipe.png', 200, 3, 4.1, 1),
(110, 'Auto Shine', 'wash@autoshine.com', 'partner_pass_10', 8765432110, 110, 'Premium car detailing', 'car.png', 400, 5, 4.3, 1);

-- 6. partner_availability (10 entries)
INSERT INTO partner_availability (id, partner_id, available_date, start_time, end_time, status) VALUES
(101, 101, '2026-03-15', '09:00:00', '17:00:00', 'Available'),
(102, 102, '2026-03-15', '10:00:00', '18:00:00', 'Available'),
(103, 103, '2026-03-16', '08:00:00', '16:00:00', 'Available'),
(104, 104, '2026-03-16', '09:00:00', '15:00:00', 'Available'),
(105, 105, '2026-03-17', '11:00:00', '19:00:00', 'Available'),
(106, 106, '2026-03-17', '09:00:00', '18:00:00', 'Available'),
(107, 107, '2026-03-18', '12:00:00', '20:00:00', 'Available'),
(108, 108, '2026-03-18', '08:00:00', '14:00:00', 'Available'),
(109, 109, '2026-03-19', '10:00:00', '16:00:00', 'Available'),
(110, 110, '2026-03-19', '09:00:00', '17:00:00', 'Available');

-- 7. bookings (15 entries)
INSERT INTO bookings (id, user_id, partner_id, service_id, address_id, booking_date, booking_time, total_cost, status) VALUES
(101, 101, 101, 101, 101, '2026-03-12', '10:00:00', 120.00, 'Pending'),
(102, 102, 102, 102, 102, '2026-03-12', '11:00:00', 90.00, 'Confirmed'),
(103, 103, 103, 103, 103, '2026-03-13', '09:30:00', 110.00, 'Completed'),
(104, 104, 104, 104, 104, '2026-03-13', '14:00:00', 70.00, 'Cancelled'),
(105, 105, 105, 105, 105, '2026-03-14', '11:00:00', 200.00, 'Confirmed'),
(106, 106, 106, 106, 106, '2026-03-14', '15:30:00', 130.00, 'Pending'),
(107, 107, 107, 107, 107, '2026-03-15', '13:00:00', 150.00, 'Completed'),
(108, 108, 108, 108, 108, '2026-03-15', '09:00:00', 50.00, 'Confirmed'),
(109, 109, 109, 109, 109, '2026-03-16', '10:00:00', 40.00, 'Completed'),
(110, 110, 110, 110, 110, '2026-03-16', '12:00:00', 100.00, 'Pending'),
(111, 111, 101, 101, 111, '2026-03-17', '11:00:00', 120.00, 'Confirmed'),
(112, 112, 102, 102, 112, '2026-03-17', '14:00:00', 90.00, 'Pending'),
(113, 113, 103, 103, 113, '2026-03-18', '10:00:00', 110.00, 'Completed'),
(114, 114, 104, 104, 114, '2026-03-18', '15:00:00', 70.00, 'Confirmed'),
(115, 115, 105, 105, 115, '2026-03-19', '11:00:00', 200.00, 'Pending');

-- 8. payments (15 entries)
INSERT INTO payments (id, booking_id, user_id, amount, payment_method, transaction_id, status) VALUES
(101, 101, 101, 120.00, 'Credit Card', 'TXN_101', 'Pending'),
(102, 102, 102, 90.00, 'PayPal', 'TXN_102', 'Completed'),
(103, 103, 103, 110.00, 'Online Banking', 'TXN_103', 'Completed'),
(104, 104, 104, 70.00, 'Credit Card', 'TXN_104', 'Refunded'),
(105, 105, 105, 200.00, 'Online', 'TXN_105', 'Completed'),
(106, 106, 106, 130.00, 'Credit Card', 'TXN_106', 'Pending'),
(107, 107, 107, 150.00, 'Online', 'TXN_107', 'Completed'),
(108, 108, 108, 50.00, 'PayPal', 'TXN_108', 'Completed'),
(109, 109, 109, 40.00, 'Credit Card', 'TXN_109', 'Completed'),
(110, 110, 110, 100.00, 'Online', 'TXN_110', 'Pending'),
(111, 111, 111, 120.00, 'Credit Card', 'TXN_111', 'Completed'),
(112, 112, 112, 90.00, 'PayPal', 'TXN_112', 'Pending'),
(113, 113, 113, 110.00, 'Online Banking', 'TXN_113', 'Completed'),
(114, 114, 114, 70.00, 'Credit Card', 'TXN_114', 'Completed'),
(115, 115, 115, 200.00, 'Online', 'TXN_115', 'Pending');

-- 9. reviews (10 entries)
INSERT INTO reviews (id, booking_id, user_id, partner_id, rating, comment) VALUES
(101, 103, 103, 103, 5, 'Great service, very professional.'),
(102, 107, 107, 107, 4, 'Good experience, but a bit late.'),
(103, 102, 102, 102, 5, 'Quickly solved the issue.'),
(104, 105, 105, 105, 4, 'Neat work.'),
(105, 101, 101, 101, 5, 'Excellent carpentry!'),
(106, 109, 109, 109, 5, 'Fast and cheap!'),
(107, 113, 113, 103, 4, 'Reliable appliance repair.'),
(108, 108, 108, 108, 4, 'Fixed the fan in no time.'),
(109, 111, 111, 101, 5, 'Mike is the best carpenter.'),
(110, 104, 104, 104, 1, 'Booking was cancelled without prior notice.');

-- 10. chat_messages (10 entries)
INSERT INTO chat_messages (id, booking_id, sender_id, sender_type, message) VALUES
(101, 101, 101, 'user', 'Hi, are you coming on time?'),
(102, 101, 101, 'partner', 'Yes, I will be there at 10 AM.'),
(103, 102, 102, 'user', 'Please bring your own tools.'),
(104, 103, 103, 'partner', 'I have arrived at the location.'),
(105, 105, 105, 'user', 'What is the color code?'),
(106, 106, 106, 'partner', 'I need some more details about the AC model.'),
(107, 107, 107, 'user', 'The massage was very relaxing, thank you!'),
(108, 108, 108, 'user', 'Is the capacitor included?'),
(109, 109, 109, 'partner', 'Fixed the leak, checking for other issues.'),
(110, 111, 111, 'user', 'Can you also fix a chair?');

-- 11. disputes (10 entries)
INSERT INTO disputes (id, booking_id, raised_by_id, raised_by_type, reason, status) VALUES
(101, 101, 101, 'User', 'Partner did not show up on time.', 'Open'),
(102, 102, 102, 'Partner', 'User refused to pay full amount.', 'In-Review'),
(103, 103, 103, 'User', 'Damage to furniture during assembly.', 'Resolved'),
(104, 104, 104, 'Partner', 'Unfair cancellation.', 'Closed'),
(105, 105, 105, 'User', 'Paint quality not as promised.', 'Open'),
(106, 106, 106, 'User', 'AC gas leaking again after repair.', 'In-Review'),
(107, 107, 107, 'Partner', 'User provided wrong location.', 'Resolved'),
(108, 110, 110, 'User', 'Car wash was not thorough.', 'Open'),
(109, 112, 112, 'User', 'Technician was rude.', 'In-Review'),
(110, 115, 115, 'Partner', 'Safety concerns at location.', 'Open');

-- 12. notifications (15 entries)
INSERT INTO notifications (id, user_id, title, message, type) VALUES
(101, 101, 'Booking Confirmed', 'Your booking for Furniture Assembly is confirmed.', 'success'),
(102, 102, 'Payment Received', 'We received your payment for Cockroach Control.', 'info'),
(103, 103, 'Service Completed', 'Your washing machine repair is completed.', 'success'),
(104, 104, 'Booking Cancelled', 'Your booking for Lawn Mowing has been cancelled.', 'warning'),
(105, 105, 'New Message', 'You have a new message from Rainbow Painters.', 'info'),
(106, 106, 'Booking Confirmed', 'Your AC service is confirmed.', 'success'),
(107, 107, 'Review Requested', 'Please rate your experience with Zen Spa Services.', 'info'),
(108, 108, 'Service Completed', 'Fan repair completed.', 'success'),
(109, 109, 'Payment Received', 'Payment for tap repair confirmed.', 'info'),
(110, 110, 'Booking Pending', 'Car wash booking is waiting for approval.', 'warning'),
(111, 111, 'Booking Confirmed', 'Carpentry booking confirmed.', 'success'),
(112, 112, 'New Message', 'Pest control has messaged you.', 'info'),
(113, 113, 'Service Completed', 'Appliance repair done.', 'success'),
(114, 114, 'Booking Confirmed', 'Garden maintenance confirmed.', 'success'),
(115, 115, 'Promotion', 'Get 20% off on your next painting service!', 'info');

-- 13. partner_documents (10 entries)
INSERT INTO partner_documents (id, partner_id, document_type, document_url, status) VALUES
(101, 101, 'ID Proof', 'docs/mike_id.pdf', 'Approved'),
(102, 102, 'Business License', 'docs/pest_license.pdf', 'Approved'),
(103, 103, 'Certification', 'docs/appliance_cert.pdf', 'Approved'),
(104, 104, 'ID Proof', 'docs/garden_id.pdf', 'Pending'),
(105, 105, 'Insurance', 'docs/paint_insure.pdf', 'Approved'),
(106, 106, 'ID Proof', 'docs/ac_tech_id.pdf', 'Approved'),
(107, 107, 'Professional Certificate', 'docs/spa_cert.pdf', 'Approved'),
(108, 108, 'Electrician License', 'docs/volt_lic.pdf', 'Approved'),
(109, 109, 'ID Proof', 'docs/pipe_id.pdf', 'Approved'),
(110, 110, 'Business License', 'docs/auto_lic.pdf', 'Approved');

-- 14. withdrawal_requests (10 entries)
INSERT INTO withdrawal_requests (id, partner_id, amount, status) VALUES
(101, 101, 500.00, 'Completed'),
(102, 102, 300.00, 'Approved'),
(103, 103, 400.00, 'Pending'),
(104, 104, 250.00, 'Rejected'),
(105, 105, 800.00, 'Completed'),
(106, 106, 450.00, 'Pending'),
(107, 107, 600.00, 'Approved'),
(108, 108, 350.00, 'Completed'),
(109, 109, 200.00, 'Pending'),
(110, 110, 400.00, 'Approved');

-- 15. partner_img (10 entries)
INSERT INTO partner_img (id, partner_id, image_url) VALUES
(101, 101, 'images/partners/mike_1.jpg'),
(102, 102, 'images/partners/pest_1.jpg'),
(103, 103, 'images/partners/appliance_1.jpg'),
(104, 104, 'images/partners/garden_1.jpg'),
(105, 105, 'images/partners/paint_1.jpg'),
(106, 106, 'images/partners/ac_1.jpg'),
(107, 107, 'images/partners/spa_1.jpg'),
(108, 108, 'images/partners/volt_1.jpg'),
(109, 109, 'images/partners/pipe_1.jpg'),
(110, 110, 'images/partners/auto_1.jpg');

-- 16. admins (1 entries)
INSERT INTO admins (id, email, password) VALUES
(101, 'admin@gmail.com', 'admin'),

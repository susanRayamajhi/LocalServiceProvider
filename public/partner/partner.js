document.addEventListener('DOMContentLoaded', () => {
    const partnerLoginForm = document.querySelector('.partner-login-form');
    const partnerSignupForm = document.querySelector('.partner-signup-form');
    const partnerLogoutBtn = document.querySelector('#partner-logout-btn');
    const token = localStorage.getItem('partnerToken');
    const partnerId = localStorage.getItem('partnerId');

    // Helper to prevent XSS
    const escapeHTML = (str) => {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    // Redirect to login if not on login/signup page and no token
    if (!token && !window.location.pathname.startsWith('/partner/login') && !window.location.pathname.startsWith('/partner/signup')) {
        window.location.href = '/partner/login';
        return;
    }

    // Set partner name in top bar
    if (token && partnerId) {
        fetch(`/api/partners/${partnerId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(partner => {
            const nameDisplay = document.getElementById('partner-name-display');
            if (nameDisplay) nameDisplay.textContent = partner.name;
            
            // If on profile page, populate it
            const profileNameInput = document.getElementById('profile-name');
            if (profileNameInput) {
                profileNameInput.value = partner.name;
                document.getElementById('profile-email').value = partner.email;
                document.getElementById('profile-description').value = partner.description || '';
                document.getElementById('profile-pricing').value = partner.pricing || '';
                document.getElementById('profile-image-url').value = partner.profile_image || '';
                document.getElementById('work-images-url').value = partner.work_images ? partner.work_images.split(',').join(', ') : '';
            }
        })
        .catch(err => console.error("Error fetching partner details:", err));
    }

    // --- Partner Login ---
    if (partnerLoginForm) {
        partnerLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = partnerLoginForm.querySelector('button[type="submit"]');
            const email = partnerLoginForm.querySelector('#email').value;
            const password = partnerLoginForm.querySelector('#password').value;

            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerText = 'Logging in...';
                }

                const response = await fetch('/api/partners/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('partnerToken', data.accessToken);
                    localStorage.setItem('partnerId', data.id);
                    window.location.href = '/partner/dashboard';
                } else {
                    alert('Login failed: ' + (data.message || 'Invalid credentials'));
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = 'Login';
                    }
                }
            } catch (err) {
                console.error("Login error:", err);
                alert("Could not connect to the server. Please check your connection.");
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = 'Login';
                }
            }
        });
    }

    // --- Partner Signup ---
    if (partnerSignupForm) {
        const otpForm = document.querySelector('#otp-form');
        let registeredEmail = '';

        // Fetch services for the dropdown
        fetch('/api/services')
            .then(res => res.json())
            .then(services => {
                const serviceSelect = partnerSignupForm.querySelector('#service-id');
                if (serviceSelect && serviceSelect.options.length <= 1) { // Only if not already populated by server
                    services.forEach(service => {
                        const option = document.createElement('option');
                        option.value = service.id;
                        option.textContent = service.name;
                        serviceSelect.appendChild(option);
                    });
                }
            });

        partnerSignupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = partnerSignupForm.querySelector('#name').value;
            const email = partnerSignupForm.querySelector('#email').value;
            const phone = partnerSignupForm.querySelector('#phone').value;
            const password = partnerSignupForm.querySelector('#password').value;
            const service_id = partnerSignupForm.querySelector('#service-id').value;
            const description = partnerSignupForm.querySelector('#description').value;
            const pricing = partnerSignupForm.querySelector('#pricing').value;

            registeredEmail = email;

            try {
                const response = await fetch('/api/partners/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, phone, password, service_id, description, pricing })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('OTP sent to your email. Please verify to complete registration.');
                    partnerSignupForm.style.display = 'none';
                    if (otpForm) otpForm.style.display = 'block';
                } else {
                    alert('Registration failed: ' + data.message);
                }
            } catch (err) {
                alert('An error occurred during registration.');
            }
        });

        if (otpForm) {
            otpForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const otp = otpForm.querySelector('#otp').value;

                try {
                    const response = await fetch('/api/partners/verify-otp', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: registeredEmail, otp })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        alert(data.message || 'Verification successful! Your account is pending admin approval.');
                        window.location.href = '/partner/login';
                    } else {
                        alert('Verification failed: ' + data.message);
                    }
                } catch (err) {
                    alert('An error occurred during verification.');
                }
            });
        }
    }

    // --- Partner Logout ---
    if (partnerLogoutBtn) {
        partnerLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('partnerToken');
            localStorage.removeItem('partnerId');
            window.location.href = '/partner/login';
        });
    }

    // Partner Availability Management
    if (window.location.pathname === '/partner/dashboard') {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Navigation links from sidebar
        const earningsLink = document.getElementById('earnings-link-nav');
        const withdrawalLink = document.getElementById('withdrawal-link-nav');
        const availabilityLink = document.getElementById('availability-link-nav');
        const dashboardLink = document.querySelector('a[href="/partner/dashboard"]');
        
        const earningsSection = document.getElementById('earnings-section');
        const withdrawalSection = document.getElementById('withdrawal-section');
        const availabilitySection = document.getElementById('availability-management');
        const dashboardOverview = document.getElementById('dashboard-overview');

        const sections = [earningsSection, withdrawalSection, availabilitySection, dashboardOverview];

        // Toggle sections
        const showSection = (sectionId) => {
            sections.forEach(s => {
                if (s) s.classList.remove('active');
            });
            
            document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));

            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Set sidebar active state
                if (sectionId === 'earnings-section') earningsLink.classList.add('active');
                else if (sectionId === 'withdrawal-section') {
                    withdrawalLink.classList.add('active');
                    fetchWithdrawalData();
                } else if (sectionId === 'availability-management') availabilityLink.classList.add('active');
                else dashboardLink.classList.add('active');
            }
        };

        // Handle URL hash for direct linking
        const handleHash = () => {
            const hash = window.location.hash.substring(1);
            if (hash === 'earnings-section') showSection('earnings-section');
            else if (hash === 'withdrawal-section') showSection('withdrawal-section');
            else if (hash === 'availability-management') showSection('availability-management');
            else showSection('dashboard-overview');
        };

        window.addEventListener('hashchange', handleHash);
        handleHash(); // Initial check

        if (earningsLink) earningsLink.addEventListener('click', (e) => { e.preventDefault(); window.location.hash = 'earnings-section'; });
        if (withdrawalLink) withdrawalLink.addEventListener('click', (e) => { e.preventDefault(); window.location.hash = 'withdrawal-section'; });
        if (availabilityLink) availabilityLink.addEventListener('click', (e) => { e.preventDefault(); window.location.hash = 'availability-management'; });
        if (dashboardLink) dashboardLink.addEventListener('click', (e) => { e.preventDefault(); window.location.hash = ''; });
        
        const fetchWithdrawalData = async () => {
            try {
                // Fetch Summary
                const summaryRes = await fetch('/api/withdrawals/summary', { headers });
                const summary = await summaryRes.json();
                document.getElementById('available-balance').textContent = `£${parseFloat(summary.availableBalance).toFixed(2)}`;

                // Fetch History
                const historyRes = await fetch('/api/withdrawals/my', { headers });
                const history = await historyRes.json();
                const historyContainer = document.getElementById('withdrawal-history-container');
                
                if (history.length > 0) {
                    let hTable = '<table><thead><tr><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>';
                    history.forEach(req => {
                        const statusClass = 'status-' + req.status.toLowerCase().replace(' ', '-');
                        hTable += `<tr>
                            <td>${new Date(req.created_at).toLocaleDateString()}</td>
                            <td>£${parseFloat(req.amount).toFixed(2)}</td>
                            <td><span class="status-badge ${statusClass}">${req.status}</span></td>
                        </tr>`;
                    });
                    hTable += '</tbody></table>';
                    historyContainer.innerHTML = hTable;
                } else {
                    historyContainer.innerHTML = '<p class="text-center" style="padding: 2rem;">No withdrawal requests found.</p>';
                }
            } catch (err) {
                console.error("Error fetching withdrawal data:", err);
            }
        };

        const withdrawalForm = document.getElementById('withdrawal-request-form');
        if (withdrawalForm) {
            withdrawalForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const amount = document.getElementById('withdrawal-amount').value;
                const submitBtn = withdrawalForm.querySelector('button');

                try {
                    submitBtn.disabled = true;
                    submitBtn.innerText = 'Submitting...';

                    const response = await fetch('/api/withdrawals', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` 
                        },
                        body: JSON.stringify({ amount })
                    });

                    const result = await response.json();
                    if (response.ok) {
                        alert('Withdrawal request submitted successfully!');
                        withdrawalForm.reset();
                        fetchWithdrawalData();
                    } else {
                        alert('Error: ' + result.message);
                    }
                } catch (err) {
                    alert('An error occurred.');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerText = 'Submit Request';
                }
            });
        }

        // Fetch Total Bookings for this partner
        fetch(`/api/partners/${partnerId}/bookings`, { headers })
            .then(res => res.json())
            .then(partnerBookings => {
                const earnedStatuses = ['Completed', 'Paid'];
                const completedJobs = partnerBookings.filter(b => earnedStatuses.includes(b.status));
                
                document.getElementById('total-bookings').textContent = partnerBookings.length;
                document.getElementById('pending-bookings').textContent = partnerBookings.filter(b => b.status === 'Pending' || b.status === 'Accepted').length;
                document.getElementById('completed-bookings').textContent = partnerBookings.filter(b => b.status === 'Completed').length;
                
                // Calculate earnings
                const totalEarnings = completedJobs.reduce((sum, b) => sum + parseFloat(b.total_cost || 0), 0);
                document.getElementById('total-earnings').textContent = `£${totalEarnings.toFixed(2)}`;
                const detailedEarnings = document.getElementById('detailed-total-earnings');
                if (detailedEarnings) detailedEarnings.textContent = `£${totalEarnings.toFixed(2)}`;

                // Display recent booking requests
                const bookingsTableContainer = document.getElementById('bookings-table');
                let table = '<table><thead><tr><th>ID</th><th>User</th><th>Service</th><th>Date</th><th>Status</th><th>Cost</th></tr></thead><tbody>';
                partnerBookings.slice(0, 5).forEach(booking => {
                    const statusClass = 'status-' + booking.status.toLowerCase().replace(' ', '-');
                    table += `<tr>
                        <td>#${booking.id}</td>
                        <td>${escapeHTML(booking.user_name || 'Customer')}</td>
                        <td>${escapeHTML(booking.service_name || 'Service')}</td>
                        <td>${new Date(booking.booking_date).toLocaleDateString()}</td>
                        <td><span class="status-badge ${statusClass}">${booking.status}</span></td>
                        <td>£${parseFloat(booking.total_cost).toFixed(2)}</td>
                    </tr>`;
                });
                table += '</tbody></table>';
                bookingsTableContainer.innerHTML = table;

                // Populate Earnings Table
                const earningsTableContainer = document.getElementById('earnings-table-container');
                if (earningsTableContainer) {
                    if (completedJobs.length > 0) {
                        let eTable = '<table><thead><tr><th>Date</th><th>Service</th><th>Customer</th><th>Amount Earned</th></tr></thead><tbody>';
                        completedJobs.forEach(job => {
                            eTable += `<tr>
                                <td>${new Date(job.booking_date).toLocaleDateString()}</td>
                                <td>${escapeHTML(job.service_name)}</td>
                                <td>${escapeHTML(job.user_name)}</td>
                                <td style="color: var(--success-color); font-weight: bold;">+ £${parseFloat(job.total_cost).toFixed(2)}</td>
                            </tr>`;
                        });
                        eTable += '</tbody></table>';
                        earningsTableContainer.innerHTML = eTable;
                    } else {
                        earningsTableContainer.innerHTML = '<p class="text-center" style="padding: 2rem;">No earnings found yet. Jobs appear here once Paid or Completed.</p>';
                    }
                }
            });

        // Availability Management Logic
        const addAvailabilityForm = document.getElementById('add-availability-form');
        const availableDateInput = document.getElementById('available-date');
        const startTimeInput = document.getElementById('start-time');
        const endTimeInput = document.getElementById('end-time');
        const availabilityTableContainer = document.getElementById('availability-table-container');

        const fetchPartnerAvailability = async () => {
            try {
                const response = await fetch('/api/partners/availability', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const availabilityData = await response.json();
                    renderAvailabilityTable(availabilityData);
                } else if (response.status === 404) {
                    renderAvailabilityTable([]); // No availability found
                }
                else {
                    console.error('Failed to fetch partner availability:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching partner availability:', error);
            }
        };

        const renderAvailabilityTable = (availabilityData) => {
            if (availabilityData.length === 0) {
                availabilityTableContainer.innerHTML = '<p class="text-center" style="padding: 2rem;">No availability slots added yet.</p>';
                return;
            }

            let table = '<table><thead><tr><th>Date</th><th>Start Time</th><th>End Time</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
            availabilityData.forEach(slot => {
                table += `<tr>
                    <td>${new Date(slot.available_date).toLocaleDateString()}</td>
                    <td>${slot.start_time.substring(0, 5)}</td>
                    <td>${slot.end_time.substring(0, 5)}</td>
                    <td><span class="status-badge status-accepted">${slot.status}</span></td>
                    <td>
                        <button class="button button-danger button-sm delete-availability-btn" data-id="${slot.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
            });
            table += '</tbody></table>';
            availabilityTableContainer.innerHTML = table;

            document.querySelectorAll('.delete-availability-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const slotId = btn.dataset.id;
                    if (confirm('Are you sure you want to delete this availability slot?')) {
                        await deleteAvailability(slotId);
                    }
                });
            });
        };

        const addAvailability = async (e) => {
            e.preventDefault();
            const newAvailability = {
                available_date: availableDateInput.value,
                start_time: startTimeInput.value,
                end_time: endTimeInput.value
            };

            try {
                const response = await fetch('/api/partners/availability', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(newAvailability)
                });

                if (response.ok) {
                    alert('Availability added successfully!');
                    addAvailabilityForm.reset();
                    fetchPartnerAvailability(); // Refresh the table
                } else {
                    const errorData = await response.json();
                    alert('Failed to add availability: ' + (errorData.message || response.statusText));
                }
            } catch (error) {
                console.error('Error adding availability:', error);
                alert('Error adding availability.');
            }
        };

        const deleteAvailability = async (id) => {
            try {
                const response = await fetch(`/api/partners/availability/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    alert('Availability deleted successfully!');
                    fetchPartnerAvailability(); // Refresh the table
                } else {
                    const errorData = await response.json();
                    alert('Failed to delete availability: ' + (errorData.message || response.statusText));
                }
            } catch (error) {
                console.error('Error deleting availability:', error);
                alert('Error deleting availability.');
            }
        };

        if (addAvailabilityForm) addAvailabilityForm.addEventListener('submit', addAvailability);
        fetchPartnerAvailability(); // Load availability when dashboard loads
    }

    // --- Partner Bookings Management ---
    if (window.location.pathname === '/partner/bookings') {
        const bookingsTableContainer = document.getElementById('bookings-management-table');
        const statusFilter = document.getElementById('booking-status-filter');
        let allPartnerBookings = [];

        const renderPartnerBookings = (bookings) => {
            let table = '<table><thead><tr><th>Booking ID</th><th>Customer</th><th>Service</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
            bookings.forEach(booking => {
                const statusClass = 'status-' + booking.status.toLowerCase().replace(' ', '-');
                table += `<tr>
                    <td>#${booking.id}</td>
                    <td>${escapeHTML(booking.user_name || 'Customer')}</td>
                    <td>${escapeHTML(booking.service_name || 'Service')}</td>
                    <td>${new Date(booking.booking_date).toLocaleDateString()}<br><small>${booking.booking_time}</small></td>
                    <td>
                        <span class="status-badge ${statusClass}">${booking.status}</span>
                    </td>
                    <td>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            ${booking.status === 'Pending' ? `
                                <button class="button button-success button-sm accept-booking-btn" data-id="${booking.id}">Accept</button>
                                <button class="button button-danger button-sm reject-booking-btn" data-id="${booking.id}">Reject</button>
                            ` : ''}
                            ${(booking.status === 'Accepted' || booking.status === 'Paid') ? `
                                <button class="button button-primary button-sm start-work-btn" data-id="${booking.id}">Start Work</button>
                            ` : ''}
                            ${booking.status === 'In Progress' ? `
                                <button class="button button-success button-sm finish-work-btn" data-id="${booking.id}">Finish Work</button>
                            ` : ''}
                            <button class="button button-outline button-sm open-chat-btn" data-id="${booking.id}"><i class="fas fa-comment"></i> Chat</button>
                        </div>
                    </td>
                </tr>`;
            });
            table += '</tbody></table>';
            bookingsTableContainer.innerHTML = table;

            // Chat logic for partner
            const chatModal = document.getElementById('chat-modal');
            const closeChatModal = document.getElementById('close-chat-modal');
            const chatWindow = document.getElementById('partner-chat-window');
            const chatForm = document.getElementById('partner-chat-form');
            const chatInput = document.getElementById('partner-chat-message');
            let currentBookingId = null;
            let partnerChatInterval = null;

            const fetchPartnerChat = async () => {
                if (!currentBookingId) return;
                try {
                    const response = await fetch(`/api/chat/${currentBookingId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const messages = await response.json();
                        chatWindow.innerHTML = messages.map(msg => `
                            <div style="margin-bottom: 0.5rem; display: flex; flex-direction: column; align-items: ${msg.sender_type === 'partner' ? 'flex-end' : 'flex-start'}">
                                <div style="max-width: 80%; padding: 0.75rem 1rem; border-radius: 1rem; font-size: 0.9rem; background: ${msg.sender_type === 'partner' ? 'var(--primary-color)' : '#e4e6eb'}; color: ${msg.sender_type === 'partner' ? '#fff' : '#000'}; border-bottom-${msg.sender_type === 'partner' ? 'right' : 'left'}-radius: 0;">
                                    ${escapeHTML(msg.message)}
                                </div>
                                <span style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.2rem;">${new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                        `).join('');
                        chatWindow.scrollTop = chatWindow.scrollHeight;
                    }
                } catch (err) {
                    console.error("Partner chat fetch error:", err);
                }
            };

            document.querySelectorAll('.open-chat-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    currentBookingId = btn.dataset.id;
                    chatModal.style.display = 'block';
                    fetchPartnerChat();
                    partnerChatInterval = setInterval(fetchPartnerChat, 3000);
                });
            });

            if (closeChatModal) {
                closeChatModal.addEventListener('click', () => {
                    chatModal.style.display = 'none';
                    currentBookingId = null;
                    if (partnerChatInterval) clearInterval(partnerChatInterval);
                });
            }

            if (chatForm) {
                chatForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const message = chatInput.value;
                    try {
                        const response = await fetch('/api/chat', {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}` 
                            },
                            body: JSON.stringify({ booking_id: currentBookingId, message })
                        });
                        if (response.ok) {
                            chatInput.value = '';
                            fetchPartnerChat();
                        }
                    } catch (err) {
                        console.error("Partner send message error:", err);
                    }
                });
            }

            // Helper for status updates
            const updateStatus = async (bId, status, btn) => {
                const originalText = btn.innerText;
                try {
                    btn.disabled = true;
                    btn.innerText = 'Processing...';
                    
                    const response = await fetch(`/api/partners/bookings/${bId}/status`, {
                        method: 'PUT',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` 
                        },
                        body: JSON.stringify({ status })
                    });

                    if (response.ok) {
                        alert(`Job marked as ${status}!`);
                        fetchPartnerBookings();
                    } else {
                        const err = await response.json();
                        alert('Error: ' + err.message);
                        btn.disabled = false;
                        btn.innerText = originalText;
                    }
                } catch (err) {
                    alert('An error occurred.');
                    btn.disabled = false;
                    btn.innerText = originalText;
                }
            };

            // Add event listeners for accept/reject buttons
            document.querySelectorAll('.accept-booking-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const bookingId = btn.dataset.id;
                    updateStatus(bookingId, 'Accepted', btn);
                });
            });

            document.querySelectorAll('.reject-booking-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const bookingId = btn.dataset.id;
                    if (confirm('Are you sure you want to reject this booking?')) {
                        updateStatus(bookingId, 'Rejected', btn);
                    }
                });
            });

            // Start/Finish Work listeners
            document.querySelectorAll('.start-work-btn').forEach(btn => {
                btn.addEventListener('click', () => updateStatus(btn.dataset.id, 'In Progress', btn));
            });

            document.querySelectorAll('.finish-work-btn').forEach(btn => {
                btn.addEventListener('click', () => updateStatus(btn.dataset.id, 'Completed', btn));
            });
        };

        const fetchPartnerBookings = () => {
            fetch(`/api/partners/${partnerId}/bookings`, { headers: { 'Authorization': `Bearer ${token}` } })
                .then(res => res.json())
                .then(data => {
                    allPartnerBookings = data;
                    applyPartnerBookingFilters();
                });
        };

        const applyPartnerBookingFilters = () => {
            let filteredBookings = allPartnerBookings;
            const status = statusFilter.value;

            if (status !== 'all') {
                filteredBookings = filteredBookings.filter(b => b.status === status);
            }
            renderPartnerBookings(filteredBookings);
        };

        statusFilter.addEventListener('change', applyPartnerBookingFilters);
        fetchPartnerBookings();
        
        // Check if we should open chat from hash
        if (window.location.hash === '#chat-modal') {
            // Wait a bit for bookings to load then find one to chat? 
            // Or just alert to select one
        }
    }

    // --- Partner Profile Management ---
    if (window.location.pathname === '/partner/profile') {
        const profileForm = document.getElementById('partner-profile-form');

        // Handle form submission for profile update
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitBtn = profileForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;

                const updatedProfile = {
                    name: document.getElementById('profile-name').value,
                    description: document.getElementById('profile-description').value,
                    pricing: document.getElementById('profile-pricing').value,
                    profile_image: document.getElementById('profile-image-url').value,
                    work_images: document.getElementById('work-images-url').value.split(',').map(url => url.trim()).join(',')
                };

                try {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

                    const response = await fetch(`/api/partners/${partnerId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(updatedProfile)
                    });

                    const data = await response.json();
                    if (response.ok) {
                        alert('Profile updated successfully!');
                        // Update display name in top bar
                        const nameDisplay = document.getElementById('partner-name-display');
                        if (nameDisplay) nameDisplay.textContent = updatedProfile.name;
                    } else {
                        alert('Update failed: ' + (data.message || 'Unknown error'));
                    }
                } catch (error) {
                    console.error('Error updating profile:', error);
                    alert('Failed to update profile.');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            });
        }
    }

    // --- Manage Services ---
    if (window.location.pathname === '/partner/services') {
        const addServiceForm = document.getElementById('add-partner-service-form');
        const myServicesTable = document.getElementById('my-services-table');

        const fetchMyServices = async () => {
            try {
                const response = await fetch('/api/partners/services/my', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const services = await response.json();
                
                if (services.length === 0) {
                    myServicesTable.innerHTML = '<p class="text-center" style="padding: 2rem;">No additional services added yet.</p>';
                    return;
                }

                let html = '<table><thead><tr><th>Service Name</th><th>Price</th><th>Actions</th></tr></thead><tbody>';
                services.forEach(s => {
                    html += `<tr>
                        <td>${escapeHTML(s.service_name)}</td>
                        <td>£${parseFloat(s.price).toFixed(2)}</td>
                        <td>
                            <button class="button button-danger button-sm delete-service-btn" data-id="${s.id}"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>`;
                });
                html += '</tbody></table>';
                myServicesTable.innerHTML = html;

                document.querySelectorAll('.delete-service-btn').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        if (confirm('Are you sure you want to remove this service?')) {
                            const res = await fetch(`/api/partners/services/${btn.dataset.id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (res.ok) fetchMyServices();
                        }
                    });
                });
            } catch (err) {
                myServicesTable.innerHTML = '<p class="text-center" style="padding: 2rem;">Error loading services.</p>';
            }
        };

        if (addServiceForm) {
            addServiceForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(addServiceForm);
                const data = {
                    service_id: document.getElementById('service-id').value,
                    price: document.getElementById('service-price').value
                };

                const res = await fetch('/api/partners/services', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify(data)
                });

                if (res.ok) {
                    alert('Service added successfully!');
                    addServiceForm.reset();
                    fetchMyServices();
                } else {
                    const err = await res.json();
                    alert('Error: ' + err.message);
                }
            });
        }

        fetchMyServices();
    }
});

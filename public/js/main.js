document.addEventListener('DOMContentLoaded', async () => {
    // Helper function to make authenticated fetch requests
    const fetchAuthenticated = async (url, options = {}) => {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers: headers
        });

        // If unauthorized, redirect to login
        if (response.status === 401) {
            alert('Your session has expired. Please log in again.');
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.href = '/login';
            return null; // Return null to indicate failure or redirect
        }

        return response;
    };

    const signupForm = document.querySelector('.signup-form');
    const loginForm = document.querySelector('.login-form');
    const otpForm = document.querySelector('.otp-form'); // Assuming you have an otp form
    const logoutBtn = document.querySelector('#logout-btn');

    // Function to update UI based on authentication status
    const updateAuthUI = () => {
        const isLoggedIn = localStorage.getItem('token') !== null;
        const guestLinks = document.getElementById('guest-links');
        const userDropdown = document.getElementById('user-dropdown');
        const bookingsLink = document.getElementById('nav-bookings-link');

        if (isLoggedIn) {
            if (guestLinks) guestLinks.style.display = 'none';
            if (userDropdown) userDropdown.style.display = 'block';
            if (bookingsLink) bookingsLink.style.display = 'list-item';
            
            // Set username
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            if (userId && token) {
                fetch(`/api/profile/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(user => {
                    const navUsername = document.getElementById('nav-username');
                    if (navUsername && user.name) {
                        navUsername.textContent = user.name.split(' ')[0];
                    }
                })
                .catch(() => {});
            }
        } else {
            if (guestLinks) guestLinks.style.display = 'flex';
            if (userDropdown) userDropdown.style.display = 'none';
            if (bookingsLink) bookingsLink.style.display = 'none';
        }
    };

    // --- Dropdown Logic ---
    const dropdownTrigger = document.getElementById('dropdown-trigger');
    const dropdownMenu = document.getElementById('dropdown-menu');

    if (dropdownTrigger && dropdownMenu) {
        dropdownTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!dropdownTrigger.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }

    // --- Mobile Menu Logic ---
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('mobile-show');
            mobileToggle.querySelector('i').classList.toggle('fa-bars');
            mobileToggle.querySelector('i').classList.toggle('fa-xmark');
        });
    }

    // --- Logout ---
    const handleLogout = (e) => {
        if (e) e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        window.location.href = '/login';
    };

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // Initial UI update
    updateAuthUI();

    // --- Hero Animations ---
    const initHeroAnimation = () => {
        const heroIconsContainer = document.getElementById('hero-floating-icons');
        if (!heroIconsContainer) return;

        const icons = [
            'https://img.icons8.com/fluency/80/000000/plumbing.png',
            'https://img.icons8.com/fluency/80/000000/electrical.png',
            'https://img.icons8.com/fluency/80/000000/cleaning-service.png',
            'https://img.icons8.com/fluency/80/000000/home-carer.png',
            'https://img.icons8.com/fluency/80/000000/maintenance.png',
            'https://img.icons8.com/fluency/80/000000/paint-roller.png'
        ];

        for (let i = 0; i < 12; i++) {
            const icon = document.createElement('div');
            icon.classList.add('floating-icon');
            const randomIcon = icons[Math.floor(Math.random() * icons.length)];
            icon.innerHTML = `<img src="${randomIcon}" alt="service icon">`;
            
            // Random positioning and animation delay
            const left = Math.random() * 100;
            const delay = Math.random() * 15;
            const duration = 10 + Math.random() * 10;
            const size = 40 + Math.random() * 40;

            icon.style.left = `${left}%`;
            icon.style.animationDelay = `${delay}s`;
            icon.style.animationDuration = `${duration}s`;
            icon.querySelector('img').style.width = `${size}px`;
            icon.querySelector('img').style.height = `${size}px`;

            heroIconsContainer.appendChild(icon);
        }
    };

    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/local/client/')) {
        initHeroAnimation();
    }

    // --- Signup ---
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = signupForm.querySelector('#name').value;
            const email = signupForm.querySelector('#email').value;
            const phone = signupForm.querySelector('#phone').value;
            const password = signupForm.querySelector('#password').value;

            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, phone, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Redirect to OTP page
                alert(data.message); // "OTP sent to your email."
                if (data.dev_otp) {
                    console.log("DEV OTP:", data.dev_otp);
                    alert("Development OTP: " + data.dev_otp);
                }
                window.location.href = `/otp?email=${email}`;
            } else {
                alert(data.message);
            }
        });
    }

    // --- OTP Verification ---
    if (otpForm) {
        otpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = otpForm.querySelector('input[name="email"]').value; // hidden input
            const otp = otpForm.querySelector('input[name="otp"]').value;

            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, otp })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message); // "OTP verified successfully. Please login."
                window.location.href = '/login';
            } else {
                alert(data.message); // "Invalid OTP."
            }
        });
    }


    // --- Login ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.accessToken);
                localStorage.setItem('userId', data.id);
                updateAuthUI(); // Update UI after successful login
                window.location.href = '/profile';
            } else {
                alert(data.message);
            }
        });
    }

    // --- Unified Search and Filter Logic (Services & Partners Pages) ---
    const isSearchPage = window.location.pathname === '/partners' || window.location.pathname === '/services';
    
    if (isSearchPage) {
        const partnerList = document.getElementById('partner-list');
        const urlParams = new URLSearchParams(window.location.search);
        
        let currentServiceId = urlParams.get('service_id');
        const searchKeyword = urlParams.get('search') || urlParams.get('keyword');
        const initialCategoryId = urlParams.get('category_id') || urlParams.get('category');

        const filterForm = document.querySelector('.filter-form');
        const applyFiltersBtn = document.querySelector('#apply-filters');
        const resetFiltersBtn = document.querySelector('#reset-filters');
        const searchForm = document.getElementById('partners-search-form') || document.getElementById('services-search-form');
        const resultsCountText = document.getElementById('results-count');

        const updateResults = async (serviceIdOverride = null) => {
            const keyword = document.querySelector('#search-input')?.value || '';
            const categoryId = document.querySelector('#filter-category')?.value || '';
            const serviceId = serviceIdOverride !== null ? serviceIdOverride : currentServiceId;

            // Show loading state
            if (partnerList) {
                partnerList.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 5rem 0;">
                        <div class="spinner" style="width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1.5rem;"></div>
                        <p style="color: #64748b; font-weight: 600; font-size: 1.1rem;">Finding the best professionals for you...</p>
                    </div>`;
            }

            let queryParams = new URLSearchParams();
            if (keyword) queryParams.append('keyword', keyword);
            if (categoryId) queryParams.append('category_id', categoryId);
            if (serviceId) queryParams.append('service_id', serviceId);

            try {
                const response = await fetch(`/api/partners?${queryParams.toString()}`);
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = `Error ${response.status}: ${errorData.message || 'Server Error'}`;
                    alert(errorMessage); // Show specific error to user
                    throw new Error(errorMessage);
                }
                
                const partners = await response.json();

                if (partnerList) {
                    if (partners.length === 0) {
                        partnerList.innerHTML = `
                            <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 6rem 2rem; background: #fff; border-radius: 24px; border: 2px dashed #e2e8f0;">
                                <div style="font-size: 4rem; margin-bottom: 1.5rem; opacity: 0.2;">🕵️‍♂️</div>
                                <h3 style="color: #334155; font-size: 1.5rem; margin-bottom: 0.75rem;">No professionals found</h3>
                                <p style="color: #64748b; font-size: 1.1rem;">Try adjusting your filters or search terms.</p>
                            </div>`;
                        if (resultsCountText) resultsCountText.textContent = '0 professionals found';
                        return;
                    }

                    if (resultsCountText) resultsCountText.textContent = `Showing ${partners.length} professional${partners.length > 1 ? 's' : ''}`;
                    
                    partnerList.innerHTML = '';
                    partners.forEach(partner => {
                        const partnerDiv = document.createElement('div');
                        partnerDiv.classList.add('partner-card-new');
                        
                        const profileImg = partner.profile_image || 'https://images.unsplash.com/photo-1581578731522-a2047a2aa988?q=80&w=500&auto=format&fit=crop';
                        const rating = partner.rating ? parseFloat(partner.rating).toFixed(1) : 'New';
                        
                        partnerDiv.innerHTML = `
                            <div class="card-image-wrapper">
                                <img src="${profileImg}" alt="${partner.partner_name || partner.name}">
                                <div class="rating-badge">
                                    <i class="fas fa-star"></i>
                                    ${rating}
                                </div>
                            </div>
                            <div class="card-content">
                                <h4>${partner.partner_name || partner.name}</h4>
                                <div class="service-category-tag">${partner.category_name || 'Professional'}</div>
                                <p>${partner.description || 'Experienced professional dedicated to delivering exceptional results for all your service needs.'}</p>
                                
                                <div class="card-footer">
                                    <div class="pricing-info">
                                        <span>FROM</span>
                                        <div class="price-value">£${partner.pricing}</div>
                                    </div>
                                    <div class="card-actions">
                                        <a href="/booking?partner_id=${partner.id}&service_id=${partner.service_id}" class="button">Book</a>
                                        <a href="/partners/${partner.id}" class="button-secondary">See Professional</a>
                                    </div>
                                </div>
                            </div>
                        `;
                        partnerList.appendChild(partnerDiv);
                    });
                }
            } catch (error) {
                console.error("Search error:", error);
                if (partnerList) {
                    partnerList.innerHTML = `
                        <div style="grid-column: 1 / -1; text-align: center; padding: 5rem 2rem; background: #fff; border-radius: 20px; border: 1px solid #fee2e2; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                            <h3 style="color: #991b1b; margin-bottom: 0.5rem; font-weight: 700;">Unable to load data</h3>
                            <p style="color: #b91c1c; margin-bottom: 1.5rem;">Please try again later.</p>
                            <button onclick="window.location.reload()" class="button" style="background: #ef4444; border: none; padding: 0.75rem 2rem; border-radius: 10px; font-weight: 700; color: #fff; cursor: pointer;">Retry</button>
                        </div>`;
                }
            }
        };

        // Handle initial load if params exist
        if (searchKeyword || currentServiceId || initialCategoryId) {
            const searchInput = document.querySelector('#search-input');
            if (searchInput && searchKeyword) searchInput.value = searchKeyword;
            
            const categorySelect = document.querySelector('#filter-category');
            if (categorySelect && initialCategoryId) categorySelect.value = initialCategoryId;
            
            updateResults();
        }

        // Handle search form submission
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                updateResults();
            });
        }

        // Handle sidebar filters
        if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', () => updateResults());
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                if (filterForm) filterForm.reset();
                if (searchForm) searchForm.reset();
                currentServiceId = null;
                window.history.replaceState({}, document.title, window.location.pathname);
                updateResults();
            });
        }

        // Handle "See Professional" clicks on SERVICE cards (same page transition)
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.see-pro-btn');
            if (btn && btn.getAttribute('href') && btn.getAttribute('href').includes('service_id=')) {
                e.preventDefault();
                const serviceId = btn.getAttribute('href').split('service_id=')[1];
                currentServiceId = serviceId;
                updateResults();
            }
        });
    }

    // --- Handle search on other pages (Home page, etc.) ---
    const globalSearchForms = document.querySelectorAll('.search-form');
    globalSearchForms.forEach(form => {
        // Skip forms already handled by specific page logic
        if (form.id === 'services-search-form' || form.id === 'partners-search-form') return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('input');
            if (input) {
                const keyword = input.value;
                window.location.href = `/partners?search=${encodeURIComponent(keyword)}`;
            }
        });
    });

    // --- Booking Page Logic ---
    if (window.location.pathname === '/booking') {
        const costSummaryContainer = document.querySelector('.cost-summary');
        const bookingForm = document.querySelector('.booking-form');
        const userId = localStorage.getItem('userId');

        if (!userId) {
            alert('Please login to book a service.');
            window.location.href = '/login';
            return;
        }

        const partnerId = document.querySelector('#partner-id').value;
        const serviceId = document.querySelector('#service-id').value;
        const basePrice = parseFloat(document.querySelector('#base-price').value) || 100.00;

        // Fetch user's booking history to check if it's their first booking
        let isFirstBooking = true;
        try {
            const bookingsResponse = await fetchAuthenticated(`/api/profile/${userId}/bookings`);
            if (bookingsResponse && bookingsResponse.ok) {
                const bookings = await bookingsResponse.json();
                isFirstBooking = bookings.length === 0;
            }
        } catch (err) {
            console.error("Error checking booking history:", err);
        }

        // Calculate and display cost
        const serviceCost = basePrice;
        const handlingFee = isFirstBooking ? 0 : serviceCost * 0.05;
        const tax = serviceCost * 0.02;
        const totalCost = serviceCost + handlingFee + tax;

        if (costSummaryContainer) {
            costSummaryContainer.innerHTML = `
                <p>Service Cost: £${serviceCost.toFixed(2)}</p>
                <p>Handling Fee: ${isFirstBooking ? '<span style="color: green;">FREE (First Booking!)</span>' : '£' + handlingFee.toFixed(2)}</p>
                <p>Tax (2%): £${tax.toFixed(2)}</p>
                <p><strong>Total: £${totalCost.toFixed(2)}</strong></p>
            `;
        }

        // Fetch Professional's Availability
        const slotsContainer = document.getElementById('available-slots-container');
        let availableSlots = [];
        try {
            const response = await fetch(`/api/partners/${partnerId}/availability`);
            if (response.ok) {
                availableSlots = await response.json();
                if (availableSlots.length > 0) {
                    let slotsHtml = '<ul style="list-style: none; padding: 0; margin-top: 0.5rem; font-size: 0.9rem;">';
                    availableSlots.forEach(slot => {
                        slotsHtml += `
                            <li style="margin-bottom: 0.3rem; padding: 0.4rem; background: #fff; border-radius: 4px; border-left: 4px solid var(--primary-color);">
                                📅 ${new Date(slot.available_date).toLocaleDateString()} | 🕒 ${slot.start_time.substring(0, 5)} - ${slot.end_time.substring(0, 5)}
                            </li>
                        `;
                    });
                    slotsHtml += '</ul>';
                    slotsContainer.innerHTML = slotsHtml;
                } else {
                    slotsContainer.innerHTML = '<p style="color: #dc3545; font-weight: bold;">No available slots found for this professional.</p>';
                }
            } else {
                slotsContainer.innerHTML = '<p>Availability information currently unavailable.</p>';
            }
        } catch (err) {
            console.error("Error fetching availability:", err);
            slotsContainer.innerHTML = '<p>Error loading availability.</p>';
        }

        // Handle booking submission
        if (bookingForm) {
            bookingForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const submitBtn = bookingForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                
                const date = document.querySelector('#date').value;
                const time = document.querySelector('#time').value;

                // 1. Strict Address Validation (Frontend)
                try {
                    const profileRes = await fetchAuthenticated(`/api/profile/${userId}`);
                    const profileData = await profileRes.json();
                    
                    if (!profileData.address || !profileData.address.address) {
                        alert('Please add your address in your profile before booking a service.');
                        window.location.href = '/profile';
                        return;
                    }
                } catch (err) {
                    console.error("Address validation error:", err);
                }

                // Validation for availability
                const isWithinSlot = availableSlots.some(slot => {
                    const slotDate = new Date(slot.available_date).toISOString().split('T')[0];
                    return slotDate === date && time >= slot.start_time && time <= slot.end_time;
                });

                if (!isWithinSlot) {
                    alert('The selected time is not within the professional\'s available schedule. Please check the slots above.');
                    return;
                }

                // Validation for past date
                const selectedDate = new Date(date);
                const today = new Date();
                today.setHours(0,0,0,0);
                if (selectedDate < today) {
                    alert('Please select a current or future date.');
                    return;
                }

                // Show loading state
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner"></span> Processing...';

                try {
                    // Create the booking (Backend will also validate address)
                    const bookingResponse = await fetchAuthenticated('/api/bookings', {
                        method: 'POST',
                        body: JSON.stringify({
                            partner_id: partnerId,
                            service_id: serviceId,
                            booking_date: date,
                            booking_time: time,
                            is_first_booking: isFirstBooking
                        })
                    });
                    
                    if (!bookingResponse) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                        return;
                    }

                    const bookingData = await bookingResponse.json();
                    if (bookingResponse.ok) {
                        alert('Booking successful!');
                        window.location.href = '/profile';
                    } else {
                        alert('Error making booking: ' + (bookingData.message || 'The selected slot might be unavailable.'));
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                    }
                } catch (err) {
                    console.error("Booking error:", err);
                    alert('An unexpected error occurred. Please try again.');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            });
        }
    }

    // --- Profile Page Logic ---
    if (window.location.pathname === '/profile') {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (!userId || !token) {
            alert('Please login to view your profile.');
            window.location.href = '/login';
            return;
        }

        const escapeHTML = (str) => {
            if (!str) return '';
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        };

        const fetchProfileData = async () => {
            try {
                // Fetch User & Address Details
                const userResponse = await fetchAuthenticated(`/api/profile/${userId}`);
                if (userResponse && userResponse.ok) {
                    const user = await userResponse.json();
                    
                    // Summary Card
                    document.getElementById('summary-name').textContent = user.name;
                    document.getElementById('summary-email').textContent = user.email;
                    
                    // Info Fields
                    document.getElementById('field-name').textContent = user.name || 'Not provided';
                    document.getElementById('field-email').textContent = user.email;
                    document.getElementById('field-phone').textContent = user.phone || 'Not provided';
                    document.getElementById('field-joined').textContent = new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                    
                    // Address Formatting
                    const addrField = document.getElementById('field-address');
                    const quickAddBtn = document.getElementById('add-address-quick-btn');
                    
                    if (user.address && user.address.address) {
                        const a = user.address;
                        addrField.textContent = `${a.address}, ${a.city}, ${a.state} - ${a.zip_code}`;
                        if (quickAddBtn) quickAddBtn.style.display = 'none';
                        
                        // Pre-fill Edit Form
                        document.getElementById('edit-address').value = a.address || '';
                        document.getElementById('edit-city').value = a.city || '';
                        document.getElementById('edit-state').value = a.state || '';
                        document.getElementById('edit-zip').value = a.zip_code || '';
                    } else {
                        addrField.textContent = 'No address added. Please add address from Edit Profile.';
                        if (quickAddBtn) {
                            quickAddBtn.style.display = 'flex';
                            quickAddBtn.onclick = () => {
                                document.getElementById('edit-profile-btn').click();
                                document.getElementById('edit-address').focus();
                            };
                        }
                    }
                    
                    // Edit Form Init (Base Info)
                    document.getElementById('edit-name').value = user.name || '';
                    document.getElementById('edit-phone').value = user.phone || '';
                }

                // Fetch Bookings
                const bookingsResponse = await fetchAuthenticated(`/api/profile/${userId}/bookings`);
                if (bookingsResponse && bookingsResponse.ok) {
                    const bookings = await bookingsResponse.json();
                    const container = document.getElementById('bookings-container');
                    
                    if (bookings.length > 0) {
                        container.innerHTML = bookings.map(booking => {
                            const statusClass = 'status-' + booking.status.toLowerCase().replace(' ', '-');
                            return `
                                <div class="booking-card" onclick="window.location.href='/booking-details?id=${booking.booking_id}'">
                                    <div class="booking-card-header">
                                        <span class="booking-service-name">${escapeHTML(booking.service_name)}</span>
                                        <span class="status-badge ${statusClass}">${booking.status}</span>
                                    </div>
                                    <div class="booking-meta">
                                        <div class="meta-item">
                                            <i class="fas fa-user-tie"></i>
                                            <span>${escapeHTML(booking.partner_name)}</span>
                                        </div>
                                        <div class="meta-item">
                                            <i class="fas fa-calendar-day"></i>
                                            <span>${new Date(booking.booking_date).toLocaleDateString()}</span>
                                        </div>
                                        <div class="meta-item">
                                            <i class="fas fa-clock"></i>
                                            <span>${booking.booking_time}</span>
                                        </div>
                                        <div class="meta-item">
                                            <i class="fas fa-pound-sign"></i>
                                            <span style="font-weight: 700;">${parseFloat(booking.total_cost).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('');
                    } else {
                        container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 3rem;">You have no bookings yet.</div>';
                    }
                }
            } catch (err) {
                console.error("Profile load error:", err);
            }
        };

        // Handle Profile Update
        const editForm = document.getElementById('profile-edit-form');
        if (editForm) {
            editForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const updatedData = {
                    name: document.getElementById('edit-name').value,
                    phone: document.getElementById('edit-phone').value,
                    address: {
                        address: document.getElementById('edit-address').value,
                        city: document.getElementById('edit-city').value,
                        state: document.getElementById('edit-state').value,
                        zip_code: document.getElementById('edit-zip').value
                    }
                };

                try {
                    const response = await fetchAuthenticated(`/api/profile/${userId}`, {
                        method: 'PUT',
                        body: JSON.stringify(updatedData)
                    });

                    if (response && response.ok) {
                        alert('Profile and address updated successfully!');
                        window.location.reload();
                    } else {
                        const err = await response.json();
                        alert('Update failed: ' + err.message);
                    }
                } catch (err) {
                    alert('An error occurred while updating profile.');
                }
            });
        }

        fetchProfileData();
    }

    // --- Booking Details Page Logic ---
    if (window.location.pathname === '/booking-details') {
        const RAZORPAY_KEY_ID = "rzp_test_YOUR_KEY_ID"; // Replace with your actual test key
        const urlParams = new URLSearchParams(window.location.search);
        const bookingId = urlParams.get('id');
        const token = localStorage.getItem('token');

        if (!bookingId) {
            window.location.href = '/profile';
            return;
        }

        const detailsGrid = document.querySelector('.details-grid');
        const statusInfo = document.querySelector('.status-info');
        const actionButtons = document.getElementById('action-buttons');
        const detailsContainer = document.querySelector('.details-container');
        const receiptSection = document.getElementById('receipt-section');
        const receiptContent = document.getElementById('receipt-content');
        const reviewSection = document.getElementById('review-section');
        const reviewForm = document.getElementById('review-form');
        const chatWindow = document.getElementById('chat-window');
        const chatForm = document.getElementById('chat-form');
        const disputeForm = document.getElementById('dispute-form');
        const disputeSection = document.getElementById('raise-dispute-section');

        let chatInterval;

        const fetchChat = async () => {
            try {
                const response = await fetchAuthenticated(`/api/chat/${bookingId}`);
                if (response && response.ok) {
                    const messages = await response.json();
                    if (messages.length === 0) {
                        chatWindow.innerHTML = '<p style="color: #999; text-align: center;">No messages yet. Say hello!</p>';
                        return;
                    }

                    chatWindow.innerHTML = messages.map(msg => `
                        <div style="margin-bottom: 1rem; text-align: ${msg.sender_type === 'user' ? 'right' : 'left'}">
                            <div style="display: inline-block; padding: 0.6rem 1rem; border-radius: 15px; background: ${msg.sender_type === 'user' ? 'var(--primary-color)' : '#e4e6eb'}; color: ${msg.sender_type === 'user' ? '#fff' : '#000'}; max-width: 80%;">
                                <div style="font-size: 0.7rem; margin-bottom: 0.2rem; opacity: 0.8;">${msg.sender_type === 'user' ? 'You' : 'Professional'}</div>
                                ${escapeHTML(msg.message)}
                                <div style="font-size: 0.6rem; margin-top: 0.2rem; opacity: 0.6;">${new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            </div>
                        </div>
                    `).join('');
                    
                    // Auto scroll to bottom
                    chatWindow.scrollTop = chatWindow.scrollHeight;
                }
            } catch (err) {
                console.error("Chat fetch error:", err);
            }
        };

        if (chatForm) {
            chatForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const msgInput = document.getElementById('chat-message');
                const message = msgInput.value;

                try {
                    const response = await fetchAuthenticated('/api/chat', {
                        method: 'POST',
                        body: JSON.stringify({
                            booking_id: bookingId,
                            message: message
                        })
                    });

                    if (response && response.ok) {
                        msgInput.value = '';
                        fetchChat(); // Refresh immediately
                    }
                } catch (err) {
                    console.error("Send message error:", err);
                }
            });

            // Start polling for new messages
            fetchChat();
            chatInterval = setInterval(fetchChat, 3000);
        }

        // Clean up interval on page leave
        window.addEventListener('beforeunload', () => {
            if (chatInterval) clearInterval(chatInterval);
        });

        const fetchDetails = async () => {
            const response = await fetchAuthenticated(`/api/bookings/${bookingId}`);
            if (!response) return;

            if (response.ok) {
                const booking = await response.json();
                
                // Update Status Badge
                statusInfo.innerHTML = `
                    <span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span>
                `;

                // Update Details
                detailsGrid.innerHTML = `
                    <div class="detail-row">
                        <span class="detail-label">Booking ID</span>
                        <span class="detail-value">#${booking.id}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Service</span>
                        <span class="detail-value">${booking.service_name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Professional</span>
                        <span class="detail-value">${booking.partner_name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date & Time</span>
                        <span class="detail-value">${new Date(booking.booking_date).toLocaleDateString()} at ${booking.booking_time}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Service Address</span>
                        <span class="detail-value">${booking.address}, ${booking.city}, ${booking.state} ${booking.zip_code}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Total Cost</span>
                        <span class="detail-value" style="color: var(--primary-color); font-size: 1.2rem;">£${parseFloat(booking.total_cost).toFixed(2)}</span>
                    </div>
                `;
                
                // Clear action buttons
                actionButtons.innerHTML = '';

                // Handle Action Buttons based on status
                if (booking.status === 'Pending' || booking.status === 'Confirmed') {
                    // Add Pay Button
                    const payBtn = document.createElement('button');
                    payBtn.className = 'action-btn pay-btn';
                    payBtn.innerText = 'Pay Now with Razorpay';
                    payBtn.addEventListener('click', () => handlePayment(booking));
                    actionButtons.appendChild(payBtn);

                    // Add Cancel Button
                    const cancelBtn = document.createElement('button');
                    cancelBtn.className = 'action-btn cancel-btn';
                    cancelBtn.innerText = 'Cancel Booking';
                    cancelBtn.addEventListener('click', () => handleCancel(booking.id, cancelBtn));
                    actionButtons.appendChild(cancelBtn);
                } else if (booking.status === 'Paid') {
                    // Show receipt if paid
                    showReceipt(booking);
                } else if (booking.status === 'Completed') {
                    // Show review section if completed
                    reviewSection.style.display = 'block';
                    // Check if review already exists
                    const reviewResponse = await fetchAuthenticated(`/api/reviews/booking/${bookingId}`);
                    if (reviewResponse && reviewResponse.ok) {
                        const review = await reviewResponse.json();
                        reviewSection.innerHTML = `
                            <h3>Your Feedback</h3>
                            <p><strong>Rating:</strong> ${review.rating} / 5</p>
                            <p><strong>Comment:</strong> ${review.comment || 'No comment provided.'}</p>
                        `;
                    }
                }
            } else {
                detailsContainer.innerHTML = '<h2>Booking Not Found</h2><p>The requested booking could not be found or you do not have permission to view it.</p><a href="/profile" class="button">Back to Profile</a>';
            }
        };

        if (disputeForm) {
            disputeForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const reason = document.getElementById('dispute-reason').value;
                const submitBtn = disputeForm.querySelector('button');

                try {
                    submitBtn.disabled = true;
                    submitBtn.innerText = 'Submitting...';

                    const response = await fetchAuthenticated('/api/disputes', {
                        method: 'POST',
                        body: JSON.stringify({
                            booking_id: bookingId,
                            reason: reason
                        })
                    });

                    if (response && response.ok) {
                        alert('Dispute submitted successfully. Our team will review it shortly.');
                        disputeSection.innerHTML = '<h3>Dispute Raised</h3><p>Your dispute is currently under review by our administration team.</p>';
                    } else {
                        const data = await response.json();
                        alert('Error: ' + data.message);
                    }
                } catch (err) {
                    console.error('Error submitting dispute:', err);
                    alert('An unexpected error occurred.');
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = 'Submit Dispute';
                    }
                }
            });
        }

        if (reviewForm) {
            reviewForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const rating = document.getElementById('rating').value;
                const comment = document.getElementById('comment').value;

                try {
                    const response = await fetchAuthenticated('/api/reviews', {
                        method: 'POST',
                        body: JSON.stringify({
                            booking_id: bookingId,
                            rating: rating,
                            comment: comment
                        })
                    });

                    if (response && response.ok) {
                        alert('Thank you for your review!');
                        reviewSection.innerHTML = '<h3>Feedback Submitted</h3><p>Your review has been saved successfully.</p>';
                    } else {
                        const data = await response.json();
                        alert('Error: ' + data.message);
                    }
                } catch (err) {
                    console.error('Error submitting review:', err);
                    alert('An unexpected error occurred.');
                }
            });
        }

        const handleCancel = async (bId, btn) => {
            if (!confirm('Are you sure you want to cancel this booking?')) return;
            try {
                btn.disabled = true;
                btn.innerText = 'Processing...';
                
                const response = await fetchAuthenticated(`/api/bookings/cancel/${bId}`, {
                    method: 'PUT'
                });
                
                if (response && response.ok) {
                    alert('Booking cancelled successfully.');
                    window.location.reload();
                } else {
                    const data = await response.json();
                    alert('Error: ' + data.message);
                    btn.disabled = false;
                    btn.innerText = 'Cancel Booking';
                }
            } catch (err) {
                console.error('Error cancelling booking:', err);
                alert('An unexpected error occurred.');
                btn.disabled = false;
                btn.innerText = 'Cancel Booking';
            }
        };

        const handlePayment = async (booking) => {
            try {
                // 1. Create Order on Server
                const orderResponse = await fetchAuthenticated('/api/payments/order', {
                    method: 'POST',
                    body: JSON.stringify({ bookingId: booking.id })
                });

                if (!orderResponse || !orderResponse.ok) {
                    alert('Error creating payment order.');
                    return;
                }

                const order = await orderResponse.json();

                // 2. Open Razorpay Checkout
                const options = {
                    key: RAZORPAY_KEY_ID, 
                    amount: order.amount,
                    currency: order.currency,
                    name: "Local Service Provider",
                    description: `Payment for ${booking.service_name}`,
                    order_id: order.id,
                    handler: async function (response) {
                        // 3. Verify Payment on Server
                        const verifyResponse = await fetchAuthenticated('/api/payments/verify', {
                            method: 'POST',
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        if (verifyResponse && verifyResponse.ok) {
                            alert('Payment successful!');
                            window.location.reload();
                        } else {
                            alert('Payment verification failed.');
                        }
                    },
                    prefill: {
                        name: "", // Can be fetched from user profile
                        email: "",
                        contact: ""
                    },
                    theme: {
                        color: "#007BFF"
                    }
                };

                const rzp = new Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    alert('Payment failed: ' + response.error.description);
                });
                rzp.open();

            } catch (err) {
                console.error('Payment Error:', err);
                alert('An unexpected error occurred during payment.');
            }
        };

        const showReceipt = (booking) => {
            receiptSection.style.display = 'block';
            receiptContent.innerHTML = `
                <p><strong>Receipt No:</strong> RCPT-${booking.id}-${Date.now().toString().slice(-4)}</p>
                <p><strong>Customer ID:</strong> ${localStorage.getItem('userId')}</p>
                <p><strong>Service:</strong> ${booking.service_name}</p>
                <p><strong>Professional:</strong> ${booking.partner_name}</p>
                <p><strong>Date:</strong> ${new Date(booking.booking_date).toLocaleDateString()}</p>
                <p><strong>Amount Paid:</strong> £${parseFloat(booking.total_cost).toFixed(2)}</p>
                <p><strong>Status:</strong> Success</p>
                <hr>
                <p style="text-align: center; font-size: 0.8rem; color: #666;">Thank you for choosing Local Service Provider!</p>
            `;
        };

        fetchDetails();
    }
});

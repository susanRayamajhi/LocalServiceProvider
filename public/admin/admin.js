document.addEventListener('DOMContentLoaded', () => {
    // --- Initial setup and robust path checking ---
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    const isLoginPage = (currentPath === '/admin');
    const token = localStorage.getItem('adminToken');
    const adminLoginForm = document.querySelector('.admin-login-form');
    const adminLogoutBtn = document.querySelector('#admin-logout-btn');

    const escapeHTML = (str) => {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    // --- Authentication & Redirect Logic ---
    // If we are in the admin area but not logged in and not on the login page, redirect to login.
    if (window.location.pathname.startsWith('/admin') && !isLoginPage && !token) {
        window.location.href = '/admin';
        return;
    }

    // If we are on the login page and ALREADY have a token, skip to dashboard.
    if (isLoginPage && token) {
        window.location.href = '/admin/dashboard';
        return;
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('adminToken');
            window.location.href = '/admin';
        });
    }

    // --- Admin Login Form Handling ---
    if (isLoginPage && adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = adminLoginForm.querySelector('#email');
            const passwordInput = adminLoginForm.querySelector('#password');
            const submitBtn = adminLoginForm.querySelector('button[type="submit"]');

            if (!emailInput || !passwordInput) return;

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) {
                alert("Please enter both email and password.");
                return;
            }

            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerText = 'Logging in...';
                }

                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('adminToken', data.accessToken);
                    window.location.href = '/admin/dashboard';
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

    // --- Admin Dashboard & Protected Area Logic ---
    // Only proceed if we have a token (or we are on the login page)
    if (!token && !isLoginPage) return;

    const headers = { 
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json' 
    };

    // Dashboard Stats Logic
    if (currentPath === '/admin/dashboard') {
        let allRecentBookings = [];

        fetch('/api/admin/analytics', { headers })
            .then(res => res.json())
            .then(data => {
                const elements = {
                    'total-users': parseInt(data.overall.total_users || 0),
                    'total-partners': data.overall.total_partners || 0,
                    'total-services': data.overall.total_services || 0,
                    'total-bookings': data.overall.total_bookings || 0,
                    'total-earnings': `£${parseFloat(data.overall.total_revenue || 0).toFixed(2)}`,
                    'pending-partners': data.overall.pending_partners || 0,
                    'active-users': data.overall.active_users || 0,
                    'suspended-users': data.overall.suspended_users || 0,
                    'successful-payments': data.overall.successful_payments || 0,
                    'failed-payments': data.overall.failed_payments || 0
                };
                for (const [id, val] of Object.entries(elements)) {
                    const el = document.getElementById(id);
                    if (el) el.textContent = val;
                }

                // Render Dashboard Charts
                const canvas1 = document.getElementById('dashboardBookingChart');
                if (canvas1 && typeof Chart !== 'undefined' && data.trends) {
                    new Chart(canvas1.getContext('2d'), {
                        type: 'line',
                        data: { 
                            labels: data.trends.map(t => new Date(t.date).toLocaleDateString()), 
                            datasets: [{ label: 'Bookings', data: data.trends.map(t => t.booking_count), borderColor: '#007BFF', fill: false, tension: 0.3 }] 
                        }
                    });
                }

                const canvas2 = document.getElementById('dashboardRevenueChart');
                if (canvas2 && typeof Chart !== 'undefined' && data.trends) {
                    new Chart(canvas2.getContext('2d'), {
                        type: 'bar',
                        data: { 
                            labels: data.trends.map(t => new Date(t.date).toLocaleDateString()), 
                            datasets: [{ label: 'Revenue (£)', data: data.trends.map(t => t.daily_revenue), backgroundColor: '#28a745' }] 
                        }
                    });
                }
            }).catch(err => console.error("Stats fetch error:", err));

        const renderRecentBookings = (bookings) => {
            const container = document.getElementById('bookings-table');
            if (!container) return;
            
            if (bookings.length === 0) {
                container.innerHTML = '<p>No recent bookings found.</p>';
                return;
            }

            let table = '<table><thead><tr><th>ID</th><th>Customer</th><th>Professional</th><th>Status</th><th>Cost</th><th>Actions</th></tr></thead><tbody>';
            bookings.slice(0, 10).forEach(booking => {
                table += `<tr>
                    <td>${booking.id}</td>
                    <td>${escapeHTML(booking.user_name)}</td>
                    <td>${escapeHTML(booking.partner_name)}</td>
                    <td><span class="status-badge status-${booking.status.toLowerCase().replace(' ', '-')}">${booking.status}</span></td>
                    <td>£${parseFloat(booking.total_cost).toFixed(2)}</td>
                    <td>
                        <a href="/admin/bookings" class="button button-sm button-info">Details</a>
                    </td>
                </tr>`;
            });
            table += '</tbody></table>';
            container.innerHTML = table;
        };

        fetch('/api/admin/bookings', { headers })
            .then(res => res.json())
            .then(data => {
                allRecentBookings = data;
                renderRecentBookings(data);
            }).catch(err => console.error("Bookings fetch error:", err));

        const statusFilter = document.getElementById('recent-booking-status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                const val = e.target.value;
                if (val === 'all') {
                    renderRecentBookings(allRecentBookings);
                } else {
                    renderRecentBookings(allRecentBookings.filter(b => b.status === val));
                }
            });
        }

        const generateReportBtn = document.getElementById('generate-report-btn');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', async () => {
                try {
                    const [users, partners, bookings] = await Promise.all([
                        fetch('/api/admin/users', { headers }).then(res => res.json()),
                        fetch('/api/admin/partners', { headers }).then(res => res.json()),
                        fetch('/api/admin/bookings', { headers }).then(res => res.json())
                    ]);
                    let csvContent = "data:text/csv;charset=utf-8,Type,ID,Name/Email,Status,Date\n";
                    users.forEach(u => csvContent += `User,${u.id},${u.email},${u.is_suspended?'Suspended':'Active'},${u.created_at}\n`);
                    partners.forEach(p => csvContent += `Partner,${p.id},${p.name},${p.is_approved?'Approved':'Pending'},-\n`);
                    bookings.forEach(b => csvContent += `Booking,${b.id},${b.service_name},${b.status},${b.booking_date}\n`);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodeURI(csvContent));
                    link.setAttribute("download", "platform_report.csv");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } catch (e) { console.error("Report generation failed", e); }
            });
        }
    }

    // User Management
    if (currentPath === '/admin/users') {
        const container = document.getElementById('users-table');
        const searchInput = document.getElementById('user-search');
        let allUsers = [];

        const renderUsers = (users) => {
            if (!container) return;
            let table = '<table><thead><tr><th>ID</th><th>Email</th><th>Registered On</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
            users.forEach(user => {
                table += `<tr>
                    <td>${user.id}</td>
                    <td>${escapeHTML(user.email)}</td>
                    <td>${new Date(user.created_at).toLocaleDateString()}</td>
                    <td><span class="status-badge status-${user.is_suspended ? 'rejected' : 'active'}">${user.is_suspended ? 'Suspended' : 'Active'}</span></td>
                    <td>
                        <button class="button-${user.is_suspended ? 'success' : 'danger'} toggle-user-suspension-btn" data-id="${user.id}" data-suspended="${user.is_suspended}">
                            ${user.is_suspended ? 'Activate' : 'Block'}
                        </button>
                    </td>
                </tr>`;
            });
            table += '</tbody></table>';
            container.innerHTML = table;

            document.querySelectorAll('.toggle-user-suspension-btn').forEach(btn => {
                btn.onclick = async () => {
                    const id = btn.dataset.id;
                    const is_suspended = btn.dataset.suspended === '0' ? 1 : 0;
                    const res = await fetch(`/api/admin/users/${id}/suspend`, {
                        method: 'PUT',
                        headers,
                        body: JSON.stringify({ is_suspended })
                    });
                    if (res.ok) fetchUsers();
                };
            });
        };

        const fetchUsers = () => {
            fetch('/api/admin/users', { headers })
                .then(res => res.json())
                .then(data => { allUsers = data; renderUsers(allUsers); })
                .catch(e => console.error("Fetch users error", e));
        };

        if (searchInput) {
            searchInput.oninput = (e) => {
                const term = e.target.value.toLowerCase();
                renderUsers(allUsers.filter(u => u.email.toLowerCase().includes(term)));
            };
        }
        fetchUsers();
    }

    // Partner Management
    if (currentPath === '/admin/partners') {
        const container = document.getElementById('partners-table');
        const statusFilter = document.getElementById('partner-status-filter');
        let allPartners = [];

        const renderPartners = (partners) => {
            if (!container) return;
            let table = '<table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Service ID</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
            partners.forEach(p => {
                let statusText = p.is_approved ? 'Approved' : 'Pending';
                if (p.is_suspended) statusText = 'Suspended';
                table += `<tr>
                    <td>${p.id}</td>
                    <td>${escapeHTML(p.name)}</td>
                    <td>${escapeHTML(p.email)}</td>
                    <td>${p.service_id}</td>
                    <td><span class="status-badge status-${statusText.toLowerCase() === 'suspended' ? 'rejected' : statusText.toLowerCase()}">${statusText}</span></td>
                    <td>
                        <button class="button-info view-details-btn" data-id="${p.id}">Details</button>
                        ${!p.is_approved ? `<button class="button-success approve-btn" data-id="${p.id}">Approve</button><button class="button-danger reject-btn" data-id="${p.id}">Reject</button>` : ''}
                        <button class="button-${p.is_suspended ? 'success' : 'danger'} toggle-partner-suspension-btn" data-id="${p.id}" data-suspended="${p.is_suspended}">
                            ${p.is_suspended ? 'Activate' : 'Block'}
                        </button>
                    </td>
                </tr>`;
            });
            table += '</tbody></table>';
            container.innerHTML = table;

            document.querySelectorAll('.toggle-partner-suspension-btn').forEach(btn => {
                btn.onclick = async () => {
                    const res = await fetch(`/api/admin/partners/${btn.dataset.id}/suspend`, { method: 'PUT', headers, body: JSON.stringify({ is_suspended: btn.dataset.suspended === '0' ? 1 : 0 }) });
                    if (res.ok) fetchPartners();
                };
            });

            document.querySelectorAll('.view-details-btn').forEach(btn => {
                btn.onclick = async () => {
                    const res = await fetch(`/api/admin/partners/${btn.dataset.id}`, { headers });
                    if (!res.ok) {
                        alert("Error fetching partner details.");
                        return;
                    }
                    const p = await res.json();
                    if (p) {
                        const mapping = { 
                            'modal-partner-id': p.id, 
                            'modal-partner-name': p.name, 
                            'modal-partner-email': p.email, 
                            'modal-partner-service': p.service_name || p.service_id, 
                            'modal-partner-rating': p.rating || 'No rating yet', 
                            'modal-partner-status': p.is_approved ? 'Approved' : 'Pending' 
                        };
                        for (const [id, val] of Object.entries(mapping)) {
                            const el = document.getElementById(id);
                            if (el) el.tagName === 'INPUT' ? el.value = val : el.textContent = val;
                        }
                        const desc = document.getElementById('modal-partner-description-edit');
                        if (desc) desc.value = p.description || '';
                        const pricing = document.getElementById('modal-partner-pricing-edit');
                        if (pricing) pricing.value = p.pricing || '';
                        const img = document.getElementById('modal-partner-image');
                        if (img) { img.src = p.profile_image || ''; img.style.display = p.profile_image ? 'block' : 'none'; }
                        const modal = document.getElementById('partner-modal');
                        if (modal) { modal.style.display = 'block'; fetchPartnerDocuments(p.id); }
                    }
                };
            });

            document.querySelectorAll('.approve-btn').forEach(btn => {
                btn.onclick = () => fetch(`/api/admin/partners/approve/${btn.dataset.id}`, { method: 'PUT', headers }).then(res => res.ok ? fetchPartners() : alert('Failed'));
            });

            document.querySelectorAll('.reject-btn').forEach(btn => {
                btn.onclick = () => { if (confirm('Reject?')) fetch(`/api/admin/partners/reject/${btn.dataset.id}`, { method: 'PUT', headers }).then(res => res.ok ? fetchPartners() : alert('Failed')); };
            });
        };

        const fetchPartners = () => {
            fetch('/api/admin/partners', { headers }).then(res => res.json()).then(data => { allPartners = data; renderPartners(statusFilter.value === 'all' ? allPartners : allPartners.filter(p => statusFilter.value === 'approved' ? p.is_approved : !p.is_approved)); });
        };

        if (statusFilter) {
            statusFilter.onchange = () => {
                const val = statusFilter.value;
                renderPartners(val === 'all' ? allPartners : allPartners.filter(p => val === 'approved' ? p.is_approved : !p.is_approved));
            };
        }

        const modal = document.getElementById('partner-modal');
        const closeModal = document.querySelector('.close-modal');
        if (closeModal) closeModal.onclick = () => modal.style.display = 'none';
        window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

        const editPartnerForm = document.getElementById('edit-partner-form');
        if (editPartnerForm) {
            editPartnerForm.onsubmit = async (e) => {
                e.preventDefault();
                const id = document.getElementById('modal-partner-id').value;
                const res = await fetch(`/api/admin/partners/${id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({
                        description: document.getElementById('modal-partner-description-edit').value,
                        pricing: document.getElementById('modal-partner-pricing-edit').value,
                        is_approved: document.getElementById('modal-partner-status').textContent === 'Approved' ? 1 : 0
                    })
                });
                if (res.ok) {
                    alert('Partner updated successfully!');
                    modal.style.display = 'none';
                    fetchPartners();
                } else {
                    alert('Update failed.');
                }
            };
        }

        fetchPartners();
    }

    const fetchPartnerDocuments = async (partnerId) => {
        const docsList = document.getElementById('modal-docs-list');
        if (!docsList) return;
        docsList.innerHTML = '<p>Loading...</p>';
        try {
            const res = await fetch(`/api/admin/partners/${partnerId}/documents`, { headers });
            const docs = await res.json();
            if (docs.length === 0) { docsList.innerHTML = '<p>None.</p>'; return; }
            let html = '<table style="width: 100%; font-size: 0.8rem;">';
            docs.forEach(doc => {
                html += `<tr><td>${doc.document_type}</td><td><a href="${doc.document_url}" target="_blank">View</a></td><td>${doc.status}</td><td>${doc.status === 'Under Review' ? `<button class="button-success verify-doc-btn" data-id="${doc.id}" data-status="Verified">✓</button><button class="button-danger verify-doc-btn" data-id="${doc.id}" data-status="Rejected">✗</button>` : ''}</td></tr>`;
            });
            html += '</table>';
            docsList.innerHTML = html;
            document.querySelectorAll('.verify-doc-btn').forEach(btn => {
                btn.onclick = () => verifyDocument(btn.dataset.id, btn.dataset.status, partnerId);
            });
        } catch (err) { docsList.innerHTML = '<p>Error.</p>'; }
    };

    const verifyDocument = async (id, status, partnerId) => {
        const res = await fetch('/api/admin/partners/documents/verify', { method: 'POST', headers, body: JSON.stringify({ id, status }) });
        if (res.ok) fetchPartnerDocuments(partnerId);
    };

    // Services Management
    if (currentPath === '/admin/services') {
        const form = document.getElementById('add-service-form');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const body = JSON.stringify({
                    name: document.getElementById('service-name').value,
                    category_id: document.getElementById('service-category').value,
                    description: document.getElementById('service-desc').value,
                    image: document.getElementById('service-image').value
                });
                fetch('/api/admin/services', { method: 'POST', headers, body }).then(res => res.ok ? location.reload() : alert('Failed'));
            };
        }
    }

    // Bookings Management
    if (currentPath === '/admin/bookings') {
        const container = document.getElementById('bookings-management-table');
        const dateFilter = document.getElementById('date-filter');
        const statusFilter = document.getElementById('booking-status-filter');
        let allBookings = [];

        const renderBookings = (bookings) => {
            if (!container) return;
            let table = '<table><thead><tr><th>ID</th><th>Customer</th><th>Professional</th><th>Service</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
            bookings.forEach(b => {
                table += `<tr>
                    <td>${b.id}</td>
                    <td>${escapeHTML(b.user_name)}<br><small>${escapeHTML(b.user_email)}</small></td>
                    <td>${escapeHTML(b.partner_name)}</td>
                    <td>${escapeHTML(b.service_name)}</td>
                    <td>${new Date(b.booking_date).toLocaleDateString()}<br>${b.booking_time}</td>
                    <td>
                        <select class="status-selector" data-id="${b.id}" style="padding: 0.3rem;">
                            ${['Pending','Accepted','Paid','In Progress','Completed','Cancelled','Rejected'].map(s => `<option value="${s}" ${b.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                        </select>
                    </td>
                    <td><button class="button-success save-status-btn" data-id="${b.id}">Save</button></td>
                </tr>`;
            });
            table += '</tbody></table>';
            container.innerHTML = table;
            document.querySelectorAll('.save-status-btn').forEach(btn => {
                btn.onclick = () => {
                    const bId = btn.dataset.id;
                    const status = document.querySelector(`.status-selector[data-id='${bId}']`).value;
                    fetch(`/api/admin/bookings/${bId}/status`, { method: 'PUT', headers, body: JSON.stringify({ status }) }).then(res => res.ok ? alert('Updated!') : alert('Failed'));
                };
            });
        };
        const fetchBookings = () => { fetch('/api/admin/bookings', { headers }).then(res => res.json()).then(data => { allBookings = data; applyFilters(); }); };
        const applyFilters = () => {
            let filtered = allBookings;
            if (dateFilter && dateFilter.value) filtered = filtered.filter(b => b.booking_date.startsWith(dateFilter.value));
            if (statusFilter && statusFilter.value !== 'all') filtered = filtered.filter(b => b.status === statusFilter.value);
            renderBookings(filtered);
        };
        if (dateFilter) dateFilter.onchange = applyFilters;
        if (statusFilter) statusFilter.onchange = applyFilters;
        fetchBookings();
    }

    // Withdrawals
    if (currentPath === '/admin/withdrawals') {
        const container = document.getElementById('withdrawals-table-container');
        const fetchWithdrawals = async () => {
            try {
                const res = await fetch('/api/admin/withdrawals', { headers });
                const withdrawals = await res.json();
                if (!container) return;
                if (withdrawals.length === 0) { container.innerHTML = '<p>None.</p>'; return; }
                let html = '<table><thead><tr><th>Date</th><th>Partner</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
                withdrawals.forEach(req => {
                    html += `<tr><td>${new Date(req.created_at).toLocaleDateString()}</td><td>${req.partner_name}</td><td>£${parseFloat(req.amount).toFixed(2)}</td><td><span class="status-badge status-${req.status.toLowerCase()}">${req.status}</span></td><td>${req.status === 'Pending' ? `<button class="button-success process-withdrawal-btn" data-id="${req.id}" data-status="Approved">Approve</button><button class="button-danger process-withdrawal-btn" data-id="${req.id}" data-status="Rejected">Reject</button>` : ''}${req.status === 'Approved' ? `<button class="button process-withdrawal-btn" data-id="${req.id}" data-status="Processed">Mark Processed</button>` : ''}</td></tr>`;
                });
                html += '</tbody></table>';
                container.innerHTML = html;
                document.querySelectorAll('.process-withdrawal-btn').forEach(btn => {
                    btn.onclick = async () => {
                        const res = await fetch(`/api/admin/withdrawals/${btn.dataset.id}/status`, { method: 'PUT', headers, body: JSON.stringify({ status: btn.dataset.status }) });
                        if (res.ok) fetchWithdrawals();
                    };
                });
            } catch (err) { if (container) container.innerHTML = '<p>Error.</p>'; }
        };
        fetchWithdrawals();
    }

    // Categories
    if (currentPath === '/admin/categories') {
        const container = document.getElementById('categories-table-container');
        const addForm = document.getElementById('add-category-form');
        const editModal = document.getElementById('edit-category-modal');
        const editForm = document.getElementById('edit-category-form');

        const fetchCategories = async () => {
            const res = await fetch('/api/admin/categories', { headers });
            const categories = await res.json();
            if (!container) return;
            if (categories.length === 0) { container.innerHTML = '<p>None.</p>'; return; }
            let html = '<table><thead><tr><th>ID</th><th>Name</th><th>Description</th><th>Actions</th></tr></thead><tbody>';
            categories.forEach(cat => {
                html += `<tr><td>${cat.id}</td><td>${escapeHTML(cat.name)}</td><td>${escapeHTML(cat.description)}</td><td><button class="button-info edit-cat-btn" data-id="${cat.id}" data-name="${escapeHTML(cat.name)}" data-desc="${escapeHTML(cat.description)}" data-image="${escapeHTML(cat.image)}">Edit</button><button class="button-danger delete-cat-btn" data-id="${cat.id}">Delete</button></td></tr>`;
            });
            html += '</tbody></table>';
            container.innerHTML = html;
            document.querySelectorAll('.edit-cat-btn').forEach(btn => {
                btn.onclick = () => {
                    document.getElementById('edit-category-id').value = btn.dataset.id;
                    document.getElementById('edit-category-name').value = btn.dataset.name;
                    document.getElementById('edit-category-desc').value = btn.dataset.desc;
                    document.getElementById('edit-category-image').value = btn.dataset.image;
                    editModal.style.display = 'block';
                };
            });
            document.querySelectorAll('.delete-cat-btn').forEach(btn => {
                btn.onclick = async () => {
                    if (confirm('Are you sure?')) {
                        const res = await fetch(`/api/admin/categories/${btn.dataset.id}`, { method: 'DELETE', headers });
                        if (res.ok) fetchCategories(); else { const data = await res.json(); alert(data.message); }
                    }
                };
            });
        };

        if (addForm) {
            addForm.onsubmit = async (e) => {
                e.preventDefault();
                const res = await fetch('/api/admin/categories', { method: 'POST', headers, body: JSON.stringify({ name: document.getElementById('category-name').value, description: document.getElementById('category-desc').value, image: document.getElementById('category-image').value }) });
                if (res.ok) { addForm.reset(); fetchCategories(); } else { const data = await res.json(); alert(data.message); }
            };
        }

        if (editForm) {
            editForm.onsubmit = async (e) => {
                e.preventDefault();
                const id = document.getElementById('edit-category-id').value;
                const res = await fetch(`/api/admin/categories/${id}`, { method: 'PUT', headers, body: JSON.stringify({ name: document.getElementById('edit-category-name').value, description: document.getElementById('edit-category-desc').value, image: document.getElementById('edit-category-image').value }) });
                if (res.ok) { editModal.style.display = 'none'; fetchCategories(); }
            };
        }

        const closeBtn = document.getElementById('close-edit-modal');
        if (closeBtn) closeBtn.onclick = () => editModal.style.display = 'none';
        fetchCategories();
    }

    // Disputes
    if (currentPath === '/admin/disputes') {
        const container = document.getElementById('disputes-table-container');
        const fetchDisputes = async () => {
            const res = await fetch('/api/admin/disputes', { headers });
            const disputes = await res.json();
            if (!container) return;
            if (disputes.length === 0) { container.innerHTML = '<p>None.</p>'; return; }
            let html = '<table><thead><tr><th>Raised By</th><th>Customer</th><th>Partner</th><th>Service</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
            disputes.forEach(d => {
                html += `<tr><td>${d.raised_by_type}</td><td>${escapeHTML(d.customer_name)}</td><td>${escapeHTML(d.partner_name)}</td><td>${escapeHTML(d.service_name)}</td><td>${escapeHTML(d.reason)}</td><td><span class="status-badge status-${d.status.toLowerCase()}">${d.status}</span></td><td>${d.status === 'Open' ? `<button class="button-success process-dispute-btn" data-id="${d.id}" data-status="Resolved">Resolve</button><button class="button-danger process-dispute-btn" data-id="${d.id}" data-status="Rejected">Reject</button>` : ''}</td></tr>`;
            });
            html += '</tbody></table>';
            container.innerHTML = html;
            document.querySelectorAll('.process-dispute-btn').forEach(btn => {
                btn.onclick = async () => {
                    const res = await fetch(`/api/admin/disputes/${btn.dataset.id}/status`, { method: 'PUT', headers, body: JSON.stringify({ status: btn.dataset.status }) });
                    if (res.ok) { alert('Updated!'); fetchDisputes(); }
                };
            });
        };
        fetchDisputes();
    }

    // Analytics
    if (currentPath === '/admin/analytics') {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch('/api/admin/analytics', { headers });
                const data = await res.json();
                const rev = document.getElementById('analytics-revenue'); if (rev) rev.textContent = `£${parseFloat(data.overall.total_revenue).toFixed(2)}`;
                const bks = document.getElementById('analytics-bookings'); if (bks) bks.textContent = data.overall.total_bookings;
                const usr = document.getElementById('analytics-users'); if (usr) usr.textContent = parseInt(data.overall.total_users) + parseInt(data.overall.total_partners);

                const canvas1 = document.getElementById('bookingTrendChart');
                if (canvas1 && typeof Chart !== 'undefined') {
                    new Chart(canvas1.getContext('2d'), {
                        type: 'line',
                        data: { labels: data.trends.map(t => new Date(t.date).toLocaleDateString()), datasets: [{ label: 'Bookings', data: data.trends.map(t => t.booking_count), borderColor: '#007BFF', fill: false }] }
                    });
                }

                const canvas2 = document.getElementById('revenueTrendChart');
                if (canvas2 && typeof Chart !== 'undefined') {
                    new Chart(canvas2.getContext('2d'), {
                        type: 'bar',
                        data: { labels: data.trends.map(t => new Date(t.date).toLocaleDateString()), datasets: [{ label: 'Revenue (£)', data: data.trends.map(t => t.daily_revenue), backgroundColor: '#28a745' }] }
                    });
                }

                const canvas3 = document.getElementById('statusDistChart');
                if (canvas3 && typeof Chart !== 'undefined') {
                    new Chart(canvas3.getContext('2d'), {
                        type: 'doughnut',
                        data: { labels: data.distribution.map(d => d.status), datasets: [{ data: data.distribution.map(d => d.count), backgroundColor: ['#ffc107', '#28a745', '#dc3545', '#007BFF', '#6c757d'] }] }
                    });
                }
            } catch (e) { console.error("Analytics fetch failed", e); }
        };
        fetchAnalytics();
    }

    // Payments
    if (currentPath === '/admin/payments') {
        const container = document.getElementById('payments-table-container');
        const fetchSummary = async () => {
            try {
                const res = await fetch('/api/admin/payments/summary', { headers });
                const data = await res.json();
                const rev = document.getElementById('summary-total-revenue'); if (rev) rev.textContent = `£${parseFloat(data.total_revenue || 0).toFixed(2)}`;
                const succ = document.getElementById('summary-success-count'); if (succ) succ.textContent = data.successful_payments;
                const fail = document.getElementById('summary-failed-count'); if (fail) fail.textContent = data.failed_payments;
                const pend = document.getElementById('summary-pending-count'); if (pend) pend.textContent = data.pending_payments;
            } catch (e) { console.error("Summary fetch failed", e); }
        };
        const fetchPayments = async () => {
            try {
                const res = await fetch('/api/admin/payments', { headers });
                const pms = await res.json();
                if (!container) return;
                if (pms.length === 0) { container.innerHTML = '<p>None.</p>'; return; }
                let html = '<table><thead><tr><th>Date</th><th>Transaction ID</th><th>Customer</th><th>Professional</th><th>Amount</th><th>Status</th></tr></thead><tbody>';
                pms.forEach(p => {
                    html += `<tr><td>${new Date(p.created_at).toLocaleDateString()}</td><td><small>${p.transaction_id}</small></td><td>${escapeHTML(p.customer_name)}</td><td>${escapeHTML(p.partner_name)}</td><td>£${parseFloat(p.amount).toFixed(2)}</td><td><span class="status-badge status-${p.status.toLowerCase()}">${p.status}</span></td></tr>`;
                });
                html += '</tbody></table>';
                container.innerHTML = html;
            } catch (e) { console.error("Payments fetch failed", e); }
        };
        fetchSummary();
        fetchPayments();
    }
});

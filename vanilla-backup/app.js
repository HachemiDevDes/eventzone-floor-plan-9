// Event Calendar & Eventzone Management System - Premium Edition

class EventCalendar {
    constructor() {
        // Initialize Databases from localStorage or set premium defaults
        this.sessions = JSON.parse(localStorage.getItem('event_sessions')) || this.getDefaultSessions();
        this.attendees = JSON.parse(localStorage.getItem('event_attendees')) || this.getDefaultAttendees();
        this.pending = JSON.parse(localStorage.getItem('event_pending')) || this.getDefaultPending();
        this.organizations = JSON.parse(localStorage.getItem('event_organizations')) || this.getDefaultOrganizations();
        this.sponsors = JSON.parse(localStorage.getItem('event_sponsors')) || this.getDefaultSponsors();
        this.exhibitors = JSON.parse(localStorage.getItem('event_exhibitors')) || this.getDefaultExhibitors();
        this.tickets = JSON.parse(localStorage.getItem('event_tickets')) || this.getDefaultTickets();
        this.team = JSON.parse(localStorage.getItem('event_team')) || this.getDefaultTeam();
        this.eventDetails = JSON.parse(localStorage.getItem('event_details')) || this.getDefaultEventDetails();
        this.floorPlan = JSON.parse(localStorage.getItem('event_floor_plan')) || this.getDefaultFloorPlan();

        this.editingSessionId = null;
        this.activeFilter = 'all'; // For timeline date filtering
        this.currentView = 'overview'; // Current routing view
        this.selectedCellId = null; // Currently selected floor cell
        this.activeTool = 'booth-std'; // Selected floor placement tool: 'booth-std', 'booth-vip', 'stage', 'food'
        
        // Form temporary states
        this.currentSpeakers = [];
        this.currentModerators = [];

        // Core DOM Elements
        this.appContainer = document.getElementById('app-container');
        this.form = document.getElementById('session-form');
        this.submitBtn = document.getElementById('submit-btn');
        this.cancelEditBtn = document.getElementById('cancel-edit');
        this.sessionsGrid = document.getElementById('sessions-grid');
        this.sessionCountLabel = document.getElementById('session-count');
        this.clearAllBtn = document.getElementById('clear-all');
        this.tabsContainer = document.getElementById('day-tabs');

        // Nav Sidebar Elements
        this.navItems = document.querySelectorAll('.nav-item, .nav-subitem');
        this.btnParticipants = document.getElementById('btn-participants');
        this.participantsSubmenu = document.getElementById('participants-submenu');

        // Speaker/Moderator form controls
        this.speakerNameInput = document.getElementById('speaker-name');
        this.speakerImgInput = document.getElementById('speaker-img');
        this.speakerImgPreview = document.getElementById('speaker-img-preview');
        this.addSpeakerBtn = document.getElementById('add-speaker');
        this.speakersListEl = document.getElementById('speakers-list');

        this.moderatorNameInput = document.getElementById('moderator-name');
        this.moderatorImgInput = document.getElementById('moderator-img');
        this.moderatorImgPreview = document.getElementById('moderator-img-preview');
        this.addModeratorBtn = document.getElementById('add-moderator');
        this.moderatorsListEl = document.getElementById('moderators-list');

        // Resizer Controls
        this.resizer = document.getElementById('resizer');

        // Modal Elements
        this.modal = document.getElementById('add-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalFormContent = document.getElementById('modal-form-content');
        this.modalForm = document.getElementById('modal-form');
        this.btnCloseModal = document.getElementById('btn-close-modal');
        this.activeModalType = null; // 'attendee', 'org', 'sponsor', 'exhibitor', 'ticket', 'team'

        // Floor Plan Elements
        this.floorGrid = document.getElementById('interactive-floor-grid');
        this.exhibitorSelect = document.getElementById('booth-exhibitor-select');
        this.boothLabelInput = document.getElementById('booth-label-input');
        this.selectedBoothInfoBox = document.getElementById('selected-booth-info');
        this.selectedBoothDetails = document.getElementById('selected-booth-details');
        this.deleteBoothBtn = document.getElementById('btn-delete-booth');
        this.clearFloorBtn = document.getElementById('btn-clear-floor');
        this.toolButtons = document.querySelectorAll('.tool-btn');

        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupResizer();
        this.setupEventListeners();
        this.setupEventDetailsForm();
        this.setupFloorPlan();
        this.saveAll(); // Ensure defaults are stored
        this.updateBadgeCounts();
        this.renderAll();
        
        // Explicitly set the initial view as Overview (Dashboard) on load
        this.switchView('overview');
    }

    // ==========================================================================
    // ROUTING & MENU MANAGEMENT
    // ==========================================================================

    setupNavigation() {
        // Handle menu clicks
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const targetView = item.getAttribute('data-view');
                if (targetView) {
                    this.switchView(targetView);
                    
                    // Update active class on nav
                    this.navItems.forEach(btn => btn.classList.remove('active'));
                    item.classList.add('active');

                    // If it's a submenu item, ensure the parent has active style too
                    const parentGroup = item.closest('.nav-group');
                    if (parentGroup) {
                        parentGroup.querySelector('.nav-item').classList.add('active');
                    }
                }
            });
        });

        // Expand/Collapse participants submenu
        this.btnParticipants.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = this.btnParticipants.classList.toggle('open');
            this.participantsSubmenu.classList.toggle('open', isOpen);
        });

        // Load saved sidebar width
        const savedWidth = localStorage.getItem('sidebar_width');
        if (savedWidth) {
            this.appContainer.style.setProperty('--sidebar-width', savedWidth);
        }
    }

    switchView(viewName) {
        this.currentView = viewName;
        
        // Hide all views
        document.querySelectorAll('.app-view').forEach(view => {
            view.classList.add('hidden');
        });

        // Show target view
        const targetViewEl = document.getElementById(`view-${viewName}`);
        if (targetViewEl) {
            targetViewEl.classList.remove('hidden');
        }

        // Toggle layout modes (Calendar needs the session builder, others don't)
        if (viewName === 'calendar') {
            this.appContainer.classList.remove('solo-mode');
        } else {
            this.appContainer.classList.add('solo-mode');
        }

        // Update active class in sidebar if triggered programmatically
        this.navItems.forEach(item => {
            if (item.getAttribute('data-view') === viewName) {
                this.navItems.forEach(btn => btn.classList.remove('active'));
                item.classList.add('active');
                
                const parentGroup = item.closest('.nav-group');
                if (parentGroup) {
                    parentGroup.querySelector('.nav-item').classList.add('active');
                }
            }
        });

        // Perform specific render actions on tab switch
        this.renderViewSpecifics(viewName);
    }

    renderViewSpecifics(viewName) {
        switch (viewName) {
            case 'overview':
                this.renderDashboard();
                break;
            case 'calendar':
                this.renderTabs();
                this.renderSessions();
                break;
            case 'event-details':
                this.renderEventDetails();
                break;
            case 'attendees':
                this.renderAttendees();
                break;
            case 'pending':
                this.renderPending();
                break;
            case 'organizations':
                this.renderOrganizations();
                break;
            case 'sponsors':
                this.renderSponsors();
                break;
            case 'exhibitors':
                this.renderExhibitors();
                break;
            case 'speakers':
                this.renderSpeakersDirectory();
                break;
            case 'floor-plan':
                this.renderFloorPlan();
                break;
            case 'tickets':
                this.renderTickets();
                break;
            case 'check-in':
                this.renderCheckIn();
                break;
            case 'my-team':
                this.renderTeam();
                break;
        }
    }

    // ==========================================================================
    // CORE EVENT LISTENERS & FORM SUBMISSIONS
    // ==========================================================================

    setupEventListeners() {
        // Session creation form
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSessionSubmit();
        });

        // Mini preview picture triggers
        this.addSpeakerBtn.addEventListener('click', () => this.handlePersonAdd('speaker'));
        this.addModeratorBtn.addEventListener('click', () => this.handlePersonAdd('moderator'));
        this.speakerImgInput.addEventListener('change', (e) => this.handleImagePreview(e, 'speaker'));
        this.moderatorImgInput.addEventListener('change', (e) => this.handleImagePreview(e, 'moderator'));
        this.cancelEditBtn.addEventListener('click', () => this.cancelEdit());

        // Clear all sessions
        this.clearAllBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all sessions?')) {
                this.sessions = [];
                this.saveAll();
                this.renderSessions();
                this.renderTabs();
                this.updateBadgeCounts();
            }
        });

        // Modal controls
        this.btnCloseModal.addEventListener('click', () => this.closeModal());
        this.modalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleModalSubmit();
        });

        // Add buttons in views
        document.getElementById('btn-add-attendee').addEventListener('click', () => this.openModal('attendee'));
        document.getElementById('btn-add-org').addEventListener('click', () => this.openModal('org'));
        document.getElementById('btn-add-sponsor').addEventListener('click', () => this.openModal('sponsor'));
        document.getElementById('btn-add-exhibitor').addEventListener('click', () => this.openModal('exhibitor'));
        document.getElementById('btn-add-ticket').addEventListener('click', () => this.openModal('ticket'));
        document.getElementById('btn-add-team-member').addEventListener('click', () => this.openModal('team'));

        // Search inputs
        document.getElementById('attendee-search').addEventListener('input', (e) => this.renderAttendees(e.target.value));
        document.getElementById('checkin-search').addEventListener('input', (e) => this.renderCheckIn(e.target.value));
    }

    // ==========================================================================
    // COMPONENT RENDERING & VIEWS METHODS
    // ==========================================================================

    renderAll() {
        this.renderDashboard();
        this.renderTabs();
        this.renderSessions();
        this.renderEventDetails();
        this.renderAttendees();
        this.renderPending();
        this.renderOrganizations();
        this.renderSponsors();
        this.renderExhibitors();
        this.renderSpeakersDirectory();
        this.renderFloorPlan();
        this.renderTickets();
        this.renderCheckIn();
        this.renderTeam();
    }

    // --- Overview: Event Dashboard ---

    renderDashboard() {
        // Update stats
        document.getElementById('dash-event-title').textContent = this.eventDetails.title;
        document.getElementById('dash-event-meta').textContent = `📍 ${this.eventDetails.location} | 📅 ${this.formatDate(this.eventDetails.startDate)} - ${this.formatDate(this.eventDetails.endDate)} (${this.eventDetails.type})`;
        document.getElementById('dash-total-attendees').textContent = this.attendees.length;
        
        const checkedInCount = this.attendees.filter(a => a.status === 'checked-in').length;
        document.getElementById('dash-checkin-count').textContent = `${checkedInCount} / ${this.attendees.length}`;
        const checkinPct = this.attendees.length > 0 ? (checkedInCount / this.attendees.length) * 100 : 0;
        document.getElementById('dash-checkin-fill').style.width = `${checkinPct}%`;

        let totalRev = 0;
        this.attendees.forEach(a => {
            const matchingTicket = this.tickets.find(t => t.name === a.ticketType);
            if (matchingTicket) {
                totalRev += matchingTicket.price;
            }
        });
        document.getElementById('dash-total-rev').textContent = `$${totalRev.toLocaleString()}`;
        document.getElementById('dash-total-sessions').textContent = this.sessions.length;

        // Render upcoming sessions (next 2 chronologically)
        const upcomingList = document.getElementById('dash-upcoming-list');
        upcomingList.innerHTML = '';

        const sorted = [...this.sessions].sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startTime}`);
            const dateB = new Date(`${b.date}T${b.startTime}`);
            return dateA - dateB;
        });

        const nextSessions = sorted.slice(0, 2);
        if (nextSessions.length === 0) {
            upcomingList.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem;">No upcoming sessions scheduled.</p>';
            return;
        }

        nextSessions.forEach(s => {
            const item = document.createElement('div');
            item.className = 'dash-session-item';
            
            // Format short date (e.g. "Oct 12")
            const month = new Date(s.date).toLocaleDateString('en-US', { month: 'short' });
            const dayNum = new Date(s.date).getDate();

            item.innerHTML = `
                <div class="dash-session-time">
                    <span>${month}</span>
                    <span>${dayNum}</span>
                </div>
                <div class="dash-session-info">
                    <h4>${s.title}</h4>
                    <p>🕒 ${s.startTime} - ${s.endTime} | ${s.speakers.map(sp => sp.name).join(', ')}</p>
                </div>
            `;
            upcomingList.appendChild(item);
        });
    }

    // --- Overview: Timeline & Day tabs ---

    renderTabs() {
        const uniqueDates = [...new Set(this.sessions.map(s => s.date))].sort();
        if (uniqueDates.length <= 1) {
            this.tabsContainer.innerHTML = '';
            this.activeFilter = 'all';
            return;
        }

        this.tabsContainer.innerHTML = '';
        
        // "All Dates" tab
        const allBtn = document.createElement('button');
        allBtn.className = `tab-btn ${this.activeFilter === 'all' ? 'active' : ''}`;
        allBtn.textContent = 'All Dates';
        allBtn.onclick = () => {
            this.activeFilter = 'all';
            this.renderTabs();
            this.renderSessions();
        };
        this.tabsContainer.appendChild(allBtn);

        // Individual day tabs
        uniqueDates.forEach((date, index) => {
            const btn = document.createElement('button');
            btn.className = `tab-btn ${this.activeFilter === date ? 'active' : ''}`;
            btn.textContent = `Day ${index + 1} (${this.formatDate(date)})`;
            btn.onclick = () => {
                this.activeFilter = date;
                this.renderTabs();
                this.renderSessions();
            };
            this.tabsContainer.appendChild(btn);
        });
    }

    renderSessions() {
        let filteredSessions = this.sessions;
        if (this.activeFilter !== 'all') {
            filteredSessions = this.sessions.filter(s => s.date === this.activeFilter);
        }

        if (filteredSessions.length === 0) {
            this.sessionsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📅</div>
                    <h3>No sessions scheduled</h3>
                    <p>Use the form on the left to add your first session.</p>
                </div>
            `;
            this.sessionCountLabel.textContent = '0 sessions scheduled';
            return;
        }

        const sortedSessions = [...filteredSessions].sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startTime}`);
            const dateB = new Date(`${b.date}T${b.startTime}`);
            return dateA - dateB;
        });

        this.sessionCountLabel.textContent = `${sortedSessions.length} session${sortedSessions.length > 1 ? 's' : ''} scheduled`;
        this.sessionsGrid.innerHTML = '';

        let lastDate = null;
        sortedSessions.forEach(session => {
            if (this.activeFilter === 'all' && session.date !== lastDate) {
                const separator = document.createElement('div');
                separator.className = 'day-separator';
                separator.innerHTML = `<h3>${this.formatFullDate(session.date)}</h3><div class="day-line"></div>`;
                this.sessionsGrid.appendChild(separator);
                lastDate = session.date;
            }

            const gcalLink = this.generateGoogleCalendarLink(session);
            const card = document.createElement('div');
            card.className = 'session-card';
            
            const speakersHtml = session.speakers.map(s => `<div class="avatar-item"><img src="${s.image}" alt="${s.name}"><span>${s.name}</span></div>`).join('');
            const moderatorsHtml = session.moderators.map(m => `<div class="avatar-item"><img src="${m.image}" alt="${m.name}"><span>${m.name}</span></div>`).join('');

            card.innerHTML = `
                <div class="session-time">
                    <span>🕒</span>
                    <span>${session.startTime} - ${session.endTime}</span>
                </div>
                <h3 class="session-title">${session.title}</h3>
                <div class="session-people-grid">
                    <div class="person-section"><h4>Speakers</h4><div class="avatar-list">${speakersHtml}</div></div>
                    ${session.moderators.length > 0 ? `<div class="person-section"><h4>Moderators</h4><div class="avatar-list">${moderatorsHtml}</div></div>` : ''}
                </div>
                <p class="session-desc">${session.description || 'No description provided.'}</p>
                <div class="session-footer">
                    <a href="${gcalLink}" target="_blank" class="btn-add-calendar">
                        <img src="https://www.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png" width="18" height="18" alt="GCal">
                        Add to Calendar
                    </a>
                    <div class="card-actions">
                        <button class="btn-edit" onclick="calendarApp.editSession(${session.id})" title="Edit Session">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path></svg>
                        </button>
                        <button class="btn-delete" onclick="calendarApp.deleteSession(${session.id})" title="Delete Session">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                </div>
            `;
            this.sessionsGrid.appendChild(card);
        });
    }

    // --- View: Event Details ---

    setupEventDetailsForm() {
        const form = document.getElementById('event-details-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.eventDetails.title = document.getElementById('event-title').value;
            this.eventDetails.location = document.getElementById('event-location').value;
            this.eventDetails.type = document.getElementById('event-type').value;
            this.eventDetails.startDate = document.getElementById('event-start-date').value;
            this.eventDetails.endDate = document.getElementById('event-end-date').value;
            this.eventDetails.description = document.getElementById('event-description').value;

            this.saveAll();
            this.renderEventDetails();
            this.renderDashboard();
            alert('Event details updated successfully!');
        });

        // Cover image upload
        document.getElementById('event-banner-file').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const base64 = await this.fileToBase64(file);
                this.eventDetails.banner = base64;
                this.saveAll();
                this.renderEventDetails();
                this.renderDashboard();
            }
        });
    }

    renderEventDetails() {
        document.getElementById('display-event-name').textContent = this.eventDetails.title;
        document.getElementById('display-event-meta').textContent = `📍 ${this.eventDetails.location} | 📅 ${this.formatDate(this.eventDetails.startDate)} - ${this.formatDate(this.eventDetails.endDate)} (${this.eventDetails.type})`;
        
        const bannerBox = document.getElementById('banner-preview');
        if (this.eventDetails.banner) {
            bannerBox.style.backgroundImage = `url(${this.eventDetails.banner})`;
        } else {
            bannerBox.style.backgroundImage = 'linear-gradient(135deg, var(--primary), var(--accent))';
        }

        // Fill form fields
        document.getElementById('event-title').value = this.eventDetails.title;
        document.getElementById('event-location').value = this.eventDetails.location;
        document.getElementById('event-type').value = this.eventDetails.type;
        document.getElementById('event-start-date').value = this.eventDetails.startDate;
        document.getElementById('event-end-date').value = this.eventDetails.endDate;
        document.getElementById('event-description').value = this.eventDetails.description;
    }

    // --- View: Attendees & Search ---

    renderAttendees(searchQuery = '') {
        const tbody = document.getElementById('attendees-table-body');
        tbody.innerHTML = '';
        
        let filtered = this.attendees;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = this.attendees.filter(a => a.name.toLowerCase().includes(query) || a.email.toLowerCase().includes(query));
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:30px;">No attendees found matching search query.</td></tr>`;
            return;
        }

        filtered.forEach(a => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="table-attendee-cell">
                        <img src="${a.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(a.name) + '&background=random'}" class="table-avatar" alt="${a.name}">
                        <span class="table-attendee-name">${a.name}</span>
                    </div>
                </td>
                <td>${a.email}</td>
                <td>${a.ticketType}</td>
                <td><span class="status-badge ${a.status === 'checked-in' ? 'checked-in' : 'checked-out'}">${a.status}</span></td>
                <td>${a.registeredDate}</td>
                <td>
                    <button class="btn-table-action decline" onclick="calendarApp.deleteAttendee(${a.id})" title="Delete Attendee">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    deleteAttendee(id) {
        if (confirm('Are you sure you want to remove this attendee?')) {
            this.attendees = this.attendees.filter(a => a.id !== id);
            this.saveAll();
            this.renderAttendees();
            this.renderCheckIn();
            this.renderDashboard();
            this.updateBadgeCounts();
        }
    }

    // --- View: Pending Registrations ---

    renderPending() {
        const tbody = document.getElementById('pending-table-body');
        tbody.innerHTML = '';

        if (this.pending.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:30px;">No pending registration requests.</td></tr>`;
            return;
        }

        this.pending.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${p.name}</strong></td>
                <td>${p.email}</td>
                <td><span style="font-size:0.9rem; color:var(--text-muted);">${p.note || 'None'}</span></td>
                <td>${p.date}</td>
                <td style="display:flex; gap:8px;">
                    <button class="btn-table-action approve" onclick="calendarApp.approvePending(${p.id})" title="Approve Request">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Approve
                    </button>
                    <button class="btn-table-action decline" onclick="calendarApp.declinePending(${p.id})" title="Decline Request">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Decline
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    approvePending(id) {
        const item = this.pending.find(p => p.id === id);
        if (!item) return;

        // Add to All Attendees
        const newAttendee = {
            id: Date.now(),
            name: item.name,
            email: item.email,
            ticketType: 'General Admission',
            status: 'registered',
            registeredDate: new Date().toISOString().split('T')[0],
            image: ''
        };
        this.attendees.push(newAttendee);
        this.pending = this.pending.filter(p => p.id !== id);

        this.saveAll();
        this.renderPending();
        this.renderAttendees();
        this.renderCheckIn();
        this.renderDashboard();
        this.updateBadgeCounts();
    }

    declinePending(id) {
        if (confirm('Decline this registration request?')) {
            this.pending = this.pending.filter(p => p.id !== id);
            this.saveAll();
            this.renderPending();
            this.updateBadgeCounts();
        }
    }

    // --- View: Organizations ---

    renderOrganizations() {
        const grid = document.getElementById('organizations-grid');
        grid.innerHTML = '';

        if (this.organizations.length === 0) {
            grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><p>No partner organizations listed.</p></div>`;
            return;
        }

        this.organizations.forEach(o => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <div class="item-logo-row">
                    <div class="item-logo">${o.name.charAt(0)}</div>
                    <button class="btn-table-action decline" onclick="calendarApp.deleteOrganization(${o.id})" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="25"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>
                    </button>
                </div>
                <h3>${o.name}</h3>
                <div class="item-meta">
                    <span><strong>Sector:</strong> ${o.industry}</span>
                    <span><strong>Contact:</strong> ${o.contact}</span>
                    <span><a href="${o.website}" target="_blank" style="color:var(--primary); text-decoration:none;">Visit Website →</a></span>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    deleteOrganization(id) {
        if (confirm('Remove this organization?')) {
            this.organizations = this.organizations.filter(o => o.id !== id);
            this.saveAll();
            this.renderOrganizations();
            this.updateBadgeCounts();
        }
    }

    // --- View: Sponsors ---

    renderSponsors() {
        const diamondContainer = document.getElementById('sponsors-diamond');
        const goldContainer = document.getElementById('sponsors-gold');
        const silverContainer = document.getElementById('sponsors-silver');

        diamondContainer.innerHTML = '';
        goldContainer.innerHTML = '';
        silverContainer.innerHTML = '';

        const filterSponsors = (tier) => this.sponsors.filter(s => s.tier === tier);

        const buildSponsorHtml = (s) => `
            <div class="sponsor-card">
                <button class="remove-btn" onclick="calendarApp.deleteSponsor(${s.id})" title="Remove Sponsor">×</button>
                <img src="${s.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(s.name) + '&background=random'}" class="sponsor-avatar" alt="${s.name}">
                <h4>${s.name}</h4>
                <a href="${s.website}" target="_blank" style="font-size:0.85rem; color:var(--primary); text-decoration:none;">Website</a>
            </div>
        `;

        filterSponsors('diamond').forEach(s => diamondContainer.innerHTML += buildSponsorHtml(s));
        filterSponsors('gold').forEach(s => goldContainer.innerHTML += buildSponsorHtml(s));
        filterSponsors('silver').forEach(s => silverContainer.innerHTML += buildSponsorHtml(s));

        // Display empty placeholders if none
        if (diamondContainer.innerHTML === '') diamondContainer.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem;">No Diamond sponsors added.</p>';
        if (goldContainer.innerHTML === '') goldContainer.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem;">No Gold sponsors added.</p>';
        if (silverContainer.innerHTML === '') silverContainer.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem;">No Silver sponsors added.</p>';
    }

    deleteSponsor(id) {
        if (confirm('Remove this sponsor?')) {
            this.sponsors = this.sponsors.filter(s => s.id !== id);
            this.saveAll();
            this.renderSponsors();
            this.updateBadgeCounts();
        }
    }

    // --- View: Exhibitors ---

    renderExhibitors() {
        const grid = document.getElementById('exhibitors-grid');
        grid.innerHTML = '';

        if (this.exhibitors.length === 0) {
            grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><p>No exhibitors registered yet.</p></div>`;
            return;
        }

        this.exhibitors.forEach(e => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <div class="item-logo-row">
                    <div class="item-logo" style="background:linear-gradient(135deg, #fef3c7, #fffbeb); color:#b45309;">🎪</div>
                    <button class="btn-table-action decline" onclick="calendarApp.deleteExhibitor(${e.id})" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>
                    </button>
                </div>
                <h3>${e.name}</h3>
                <div class="item-meta">
                    <span><strong>Booth Number:</strong> Booth ${e.booth}</span>
                    <span><strong>Staff Contact:</strong> ${e.contact}</span>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    deleteExhibitor(id) {
        if (confirm('Remove this exhibitor?')) {
            this.exhibitors = this.exhibitors.filter(e => e.id !== id);
            this.saveAll();
            this.renderExhibitors();
            this.updateBadgeCounts();
            this.updateFloorExhibitorDropdown();
        }
    }

    // --- View: Speakers Directory (Dynamic from Timeline + Custom) ---

    renderSpeakersDirectory() {
        const grid = document.getElementById('speakers-directory-grid');
        grid.innerHTML = '';

        // Extract speakers & moderators dynamically from current sessions
        const extracted = [];
        const seenIds = new Set();

        this.sessions.forEach(session => {
            session.speakers.forEach(s => {
                if (!seenIds.has(s.name)) {
                    seenIds.add(s.name);
                    extracted.push({ name: s.name, image: s.image, role: 'speaker', sessionsCount: 1 });
                } else {
                    const match = extracted.find(e => e.name === s.name);
                    if (match) match.sessionsCount++;
                }
            });
            session.moderators.forEach(m => {
                if (!seenIds.has(m.name)) {
                    seenIds.add(m.name);
                    extracted.push({ name: m.name, image: m.image, role: 'moderator', sessionsCount: 1 });
                } else {
                    const match = extracted.find(e => e.name === m.name);
                    if (match) match.sessionsCount++;
                }
            });
        });

        if (extracted.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <div class="empty-icon">👥</div>
                    <h3>No speakers or moderators detected</h3>
                    <p>Add speakers/moderators to your sessions in the "Calendar" page to populate this directory dynamically.</p>
                </div>
            `;
            return;
        }

        extracted.forEach(s => {
            const card = document.createElement('div');
            card.className = 'speaker-dir-card';
            card.innerHTML = `
                <img src="${s.image}" class="speaker-dir-avatar" alt="${s.name}">
                <div class="speaker-dir-info">
                    <span class="speaker-dir-role ${s.role}">${s.role}</span>
                    <h3>${s.name}</h3>
                    <span class="speaker-sessions-count">Speaking in ${s.sessionsCount} session${s.sessionsCount > 1 ? 's' : ''}</span>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // --- View: Dynamic Floor Plan Layout Editor ---

    setupFloorPlan() {
        // Wire tools selector
        this.toolButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.toolButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeTool = btn.getAttribute('data-type');
            });
        });

        // Delete booth item click
        this.deleteBoothBtn.addEventListener('click', () => {
            this.deleteFloorItem();
        });

        // Clear floor
        this.clearFloorBtn.addEventListener('click', () => {
            if (confirm('Reset the entire floor plan? All placed items will be deleted.')) {
                this.floorPlan = [];
                this.selectedCellId = null;
                this.saveAll();
                this.renderFloorPlan();
            }
        });

        // Bind form change to save label/exhibitor live on text change
        this.boothLabelInput.addEventListener('input', () => {
            if (this.selectedCellId) {
                const item = this.floorPlan.find(f => f.id === this.selectedCellId);
                if (item) {
                    item.label = this.boothLabelInput.value;
                    this.saveAll();
                    this.renderFloorPlanCells();
                    this.updateSelectedInfoBox(item);
                }
            }
        });

        this.exhibitorSelect.addEventListener('change', () => {
            if (this.selectedCellId) {
                const item = this.floorPlan.find(f => f.id === this.selectedCellId);
                if (item) {
                    item.exhibitorId = parseInt(this.exhibitorSelect.value) || null;
                    this.saveAll();
                    this.renderFloorPlanCells();
                    this.updateSelectedInfoBox(item);
                }
            }
        });
    }

    updateFloorExhibitorDropdown() {
        this.exhibitorSelect.innerHTML = '<option value="">-- No Assignment / Vacant --</option>';
        this.exhibitors.forEach(ex => {
            const opt = document.createElement('option');
            opt.value = ex.id;
            opt.textContent = `${ex.name} (Booth ${ex.booth})`;
            this.exhibitorSelect.appendChild(opt);
        });
    }

    renderFloorPlan() {
        this.updateFloorExhibitorDropdown();
        this.renderFloorPlanCells();
    }

    renderFloorPlanCells() {
        this.floorGrid.innerHTML = '';
        const rows = ['A','B','C','D','E','F','G','H','I','J','K','L'];
        
        for (let r = 0; r < 12; r++) {
            for (let c = 1; c <= 12; c++) {
                const cellId = `${rows[r]}${c}`;
                const cell = document.createElement('div');
                cell.className = 'floor-cell';
                cell.id = `cell-${cellId}`;
                cell.textContent = cellId;
                
                const placed = this.floorPlan.find(f => f.id === cellId);
                if (placed) {
                    cell.classList.add(`placed-${placed.type}`);
                    
                    if (placed.type === 'booth-std') cell.textContent = '🎪';
                    else if (placed.type === 'booth-vip') cell.textContent = '⭐';
                    else if (placed.type === 'stage') cell.textContent = '🎭';
                    else if (placed.type === 'food') cell.textContent = '🍔';
                    
                    cell.title = `${placed.type.toUpperCase()}: ${placed.label || cellId}`;
                }

                if (this.selectedCellId === cellId) {
                    cell.classList.add('selected');
                }

                cell.onclick = () => this.handleFloorCellClick(cellId);
                this.floorGrid.appendChild(cell);
            }
        }
    }

    handleFloorCellClick(cellId) {
        this.selectedCellId = cellId;
        
        document.querySelectorAll('.floor-cell').forEach(c => c.classList.remove('selected'));
        const cellEl = document.getElementById(`cell-${cellId}`);
        if (cellEl) cellEl.classList.add('selected');

        const placed = this.floorPlan.find(f => f.id === cellId);
        
        if (placed) {
            this.boothLabelInput.value = placed.label || '';
            this.exhibitorSelect.value = placed.exhibitorId || '';
            this.updateSelectedInfoBox(placed);
        } else {
            const newPlacement = {
                id: cellId,
                type: this.activeTool,
                label: `Booth ${cellId}`,
                exhibitorId: null
            };
            this.floorPlan.push(newPlacement);
            this.saveAll();
            this.renderFloorPlanCells();
            
            this.boothLabelInput.value = newPlacement.label;
            this.exhibitorSelect.value = '';
            this.updateSelectedInfoBox(newPlacement);
        }
    }

    updateSelectedInfoBox(item) {
        this.selectedBoothInfoBox.classList.remove('hidden');
        
        let exhibitorName = 'Vacant / Unassigned';
        if (item.exhibitorId) {
            const ex = this.exhibitors.find(e => e.id === item.exhibitorId);
            if (ex) exhibitorName = `Assigned to: <strong>${ex.name}</strong>`;
        }

        let typeLabel = '';
        if (item.type === 'booth-std') typeLabel = 'Standard Exhibitor Booth (1x1)';
        else if (item.type === 'booth-vip') typeLabel = 'Gold VIP Sponsor Booth (1x1)';
        else if (item.type === 'stage') typeLabel = 'Main Stage / Speaker Panel';
        else if (item.type === 'food') typeLabel = 'Catering / Refreshment Spot';

        this.selectedBoothDetails.innerHTML = `
            <strong>Grid Reference:</strong> ${item.id}<br>
            <strong>Type:</strong> ${typeLabel}<br>
            <strong>Name:</strong> ${item.label}<br>
            <strong>Status:</strong> ${exhibitorName}
        `;
    }

    deleteFloorItem() {
        if (this.selectedCellId) {
            this.floorPlan = this.floorPlan.filter(f => f.id !== this.selectedCellId);
            this.selectedCellId = null;
            this.selectedBoothInfoBox.classList.add('hidden');
            this.saveAll();
            this.renderFloorPlanCells();
        }
    }

    // --- View: Tickets Pricing & Stats ---

    renderTickets() {
        const container = document.getElementById('tickets-grid-container');
        container.innerHTML = '';

        const totalSold = this.attendees.length;
        const totalCap = this.tickets.reduce((sum, t) => sum + t.maxQty, 0);
        document.getElementById('ticket-sold-val').textContent = `${totalSold} / ${totalCap}`;
        
        const pct = totalCap > 0 ? (totalSold / totalCap) * 100 : 0;
        document.querySelector('.progress-fill').style.width = `${pct}%`;

        let totalRev = 0;
        this.attendees.forEach(a => {
            const matchingTicket = this.tickets.find(t => t.name === a.ticketType);
            if (matchingTicket) {
                totalRev += matchingTicket.price;
            }
        });
        document.getElementById('ticket-rev-val').textContent = `$${totalRev.toLocaleString()}`;
        document.getElementById('active-tiers-count').textContent = this.tickets.length;

        this.tickets.forEach((t, i) => {
            const card = document.createElement('div');
            card.className = `ticket-card ${i === 1 ? 'featured' : ''}`;
            const tierSold = this.attendees.filter(a => a.ticketType === t.name).length;

            card.innerHTML = `
                ${i === 1 ? '<span class="ticket-badge">Best Seller</span>' : ''}
                <h3>${t.name}</h3>
                <div class="ticket-price">$${t.price}<span>/ ticket</span></div>
                <ul class="ticket-features">
                    ${t.features.map(f => `<li>${f}</li>`).join('')}
                </ul>
                <div style="margin-top:auto; font-size:0.85rem; color:var(--text-muted); display:flex; justify-content:space-between;">
                    <span>Sold: ${tierSold} / ${t.maxQty}</span>
                    <a href="#" style="color:var(--primary); font-weight:600; text-decoration:none;" onclick="calendarApp.deleteTicket(${t.id})">Remove</a>
                </div>
            `;
            container.appendChild(card);
        });
    }

    deleteTicket(id) {
        if (confirm('Remove this ticket tier?')) {
            this.tickets = this.tickets.filter(t => t.id !== id);
            this.saveAll();
            this.renderTickets();
            this.renderDashboard();
            this.updateBadgeCounts();
        }
    }

    // --- View: Live Check In ---

    renderCheckIn(searchQuery = '') {
        const tbody = document.getElementById('checkin-table-body');
        tbody.innerHTML = '';

        const checkedInCount = this.attendees.filter(a => a.status === 'checked-in').length;
        const totalCount = this.attendees.length;

        document.getElementById('checkin-ratio').textContent = `${checkedInCount} / ${totalCount}`;
        const pct = totalCount > 0 ? (checkedInCount / totalCount) * 100 : 0;
        document.getElementById('checkin-progress').style.width = `${pct}%`;

        let filtered = this.attendees;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = this.attendees.filter(a => a.name.toLowerCase().includes(query) || a.email.toLowerCase().includes(query));
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:30px;">No registered attendees found.</td></tr>`;
            return;
        }

        filtered.forEach(a => {
            const isCheckedIn = a.status === 'checked-in';
            const checkinTime = a.checkinTime || '-';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="table-attendee-cell">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=random" class="table-avatar" alt="${a.name}">
                        <span class="table-attendee-name">${a.name}</span>
                    </div>
                </td>
                <td>${a.ticketType}</td>
                <td><span class="status-badge ${isCheckedIn ? 'checked-in' : 'checked-out'}">${a.status}</span></td>
                <td>${checkinTime}</td>
                <td>
                    <button class="btn-primary" style="padding: 6px 12px; font-size: 0.8rem; background: ${isCheckedIn ? 'var(--accent)' : 'var(--primary)'}" onclick="calendarApp.toggleCheckin(${a.id})">
                        ${isCheckedIn ? 'Check Out' : 'Check In'}
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    toggleCheckin(id) {
        const attendee = this.attendees.find(a => a.id === id);
        if (!attendee) return;

        if (attendee.status === 'checked-in') {
            attendee.status = 'registered';
            attendee.checkinTime = null;
        } else {
            attendee.status = 'checked-in';
            attendee.checkinTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        this.saveAll();
        this.renderCheckIn();
        this.renderAttendees();
        this.renderDashboard();
    }

    // --- View: My Team ---

    renderTeam() {
        const tbody = document.getElementById('team-table-body');
        tbody.innerHTML = '';

        this.team.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${t.name}</strong></td>
                <td><span style="font-weight:600; color:var(--primary);">${t.role}</span></td>
                <td>${t.email}</td>
                <td><span class="status-badge ${t.status === 'Active' ? 'approved' : 'pending'}">${t.status}</span></td>
                <td>
                    <button class="btn-table-action decline" onclick="calendarApp.deleteTeamMember(${t.id})" title="Remove staff">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    deleteTeamMember(id) {
        if (confirm('Remove this team member?')) {
            this.team = this.team.filter(t => t.id !== id);
            this.saveAll();
            this.renderTeam();
            this.updateBadgeCounts();
        }
    }

    // ==========================================================================
    // SIDEBAR BADGE COUNTS (Participants Submenu)
    // ==========================================================================

    updateBadgeCounts() {
        document.getElementById('badge-attendees').textContent = this.attendees.length;
        document.getElementById('badge-pending').textContent = this.pending.length;
        document.getElementById('badge-organizations').textContent = this.organizations.length;
        document.getElementById('badge-sponsors').textContent = this.sponsors.length;
        document.getElementById('badge-exhibitors').textContent = this.exhibitors.length;

        const uniqueNames = new Set();
        this.sessions.forEach(s => {
            s.speakers.forEach(sp => uniqueNames.add(sp.name));
            s.moderators.forEach(mo => uniqueNames.add(mo.name));
        });
        document.getElementById('badge-speakers').textContent = uniqueNames.size;
    }

    // ==========================================================================
    // MODAL MANAGER (Form generation & submissions)
    // ==========================================================================

    openModal(type) {
        this.activeModalType = type;
        this.modal.classList.remove('hidden');

        let html = '';
        switch (type) {
            case 'attendee':
                this.modalTitle.textContent = 'Add New Attendee';
                html = `
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" id="m-name" placeholder="e.g. John Doe" required>
                    </div>
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="m-email" placeholder="e.g. john@example.com" required>
                    </div>
                    <div class="form-group">
                        <label>Ticket Type</label>
                        <select id="m-ticket">
                            ${this.tickets.map(t => `<option value="${t.name}">${t.name}</option>`).join('')}
                        </select>
                    </div>
                `;
                break;
            case 'org':
                this.modalTitle.textContent = 'Add Partner Organization';
                html = `
                    <div class="form-group">
                        <label>Organization Name</label>
                        <input type="text" id="m-name" placeholder="e.g. Sonatrach" required>
                    </div>
                    <div class="form-group">
                        <label>Industry/Sector</label>
                        <input type="text" id="m-sector" placeholder="e.g. Energy / Hydrocarbons" required>
                    </div>
                    <div class="form-group">
                        <label>Contact Person</label>
                        <input type="text" id="m-contact" placeholder="e.g. Ahmed B." required>
                    </div>
                    <div class="form-group">
                        <label>Website URL</label>
                        <input type="url" id="m-website" placeholder="https://" value="https://">
                    </div>
                `;
                break;
            case 'sponsor':
                this.modalTitle.textContent = 'Add Event Sponsor';
                html = `
                    <div class="form-group">
                        <label>Company Name</label>
                        <input type="text" id="m-name" placeholder="e.g. Air Liquide" required>
                    </div>
                    <div class="form-group">
                        <label>Sponsor Tier</label>
                        <select id="m-tier">
                            <option value="diamond">Diamond Tier</option>
                            <option value="gold">Gold Tier</option>
                            <option value="silver">Silver Tier</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Website URL</label>
                        <input type="url" id="m-website" placeholder="https://">
                    </div>
                `;
                break;
            case 'exhibitor':
                this.modalTitle.textContent = 'Register Exhibitor';
                html = `
                    <div class="form-group">
                        <label>Exhibitor Company Name</label>
                        <input type="text" id="m-name" placeholder="e.g. Hydrogen Systems" required>
                    </div>
                    <div class="form-group">
                        <label>Booth Number</label>
                        <input type="text" id="m-booth" placeholder="e.g. 104" required>
                    </div>
                    <div class="form-group">
                        <label>Staff Contact</label>
                        <input type="text" id="m-contact" placeholder="e.g. Leila K." required>
                    </div>
                `;
                break;
            case 'ticket':
                this.modalTitle.textContent = 'Create Ticket Tier';
                html = `
                    <div class="form-group">
                        <label>Tier Name</label>
                        <input type="text" id="m-name" placeholder="e.g. VIP Access Pass" required>
                    </div>
                    <div class="form-group">
                        <label>Price ($)</label>
                        <input type="number" id="m-price" placeholder="e.g. 299" required>
                    </div>
                    <div class="form-group">
                        <label>Max Availability</label>
                        <input type="number" id="m-max" placeholder="e.g. 100" required>
                    </div>
                    <div class="form-group">
                        <label>Key Feature (Comma-separated)</label>
                        <input type="text" id="m-features" placeholder="e.g. Lunch included, Front-row seating, Workshop access" required>
                    </div>
                `;
                break;
            case 'team':
                this.modalTitle.textContent = 'Invite Team Member';
                html = `
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" id="m-name" placeholder="e.g. Sarah M." required>
                    </div>
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="m-email" placeholder="e.g. sarah@eventzone.com" required>
                    </div>
                    <div class="form-group">
                        <label>Access Role</label>
                        <select id="m-role">
                            <option value="Admin">Administrator (Full Access)</option>
                            <option value="Editor">Editor (Edit Sessions)</option>
                            <option value="Staff">Staff (Check-in Door Only)</option>
                        </select>
                    </div>
                `;
                break;
        }

        this.modalFormContent.innerHTML = html;
    }

    closeModal() {
        this.modal.classList.add('hidden');
        this.modalForm.reset();
        this.activeModalType = null;
    }

    handleModalSubmit() {
        const type = this.activeModalType;
        
        switch (type) {
            case 'attendee':
                const newAttendee = {
                    id: Date.now(),
                    name: document.getElementById('m-name').value,
                    email: document.getElementById('m-email').value,
                    ticketType: document.getElementById('m-ticket').value,
                    status: 'registered',
                    registeredDate: new Date().toISOString().split('T')[0],
                    image: ''
                };
                this.attendees.push(newAttendee);
                this.renderAttendees();
                this.renderCheckIn();
                this.renderDashboard();
                break;

            case 'org':
                const newOrg = {
                    id: Date.now(),
                    name: document.getElementById('m-name').value,
                    industry: document.getElementById('m-sector').value,
                    contact: document.getElementById('m-contact').value,
                    website: document.getElementById('m-website').value
                };
                this.organizations.push(newOrg);
                this.renderOrganizations();
                break;

            case 'sponsor':
                const newSponsor = {
                    id: Date.now(),
                    name: document.getElementById('m-name').value,
                    tier: document.getElementById('m-tier').value,
                    website: document.getElementById('m-website').value || '#',
                    image: ''
                };
                this.sponsors.push(newSponsor);
                this.renderSponsors();
                break;

            case 'exhibitor':
                const newExhibitor = {
                    id: Date.now(),
                    name: document.getElementById('m-name').value,
                    booth: document.getElementById('m-booth').value,
                    contact: document.getElementById('m-contact').value
                };
                this.exhibitors.push(newExhibitor);
                this.renderExhibitors();
                this.updateFloorExhibitorDropdown();
                break;

            case 'ticket':
                const newTicket = {
                    id: Date.now(),
                    name: document.getElementById('m-name').value,
                    price: parseInt(document.getElementById('m-price').value) || 0,
                    maxQty: parseInt(document.getElementById('m-max').value) || 100,
                    features: document.getElementById('m-features').value.split(',').map(f => f.trim())
                };
                this.tickets.push(newTicket);
                this.renderTickets();
                this.renderDashboard();
                break;

            case 'team':
                const newMember = {
                    id: Date.now(),
                    name: document.getElementById('m-name').value,
                    email: document.getElementById('m-email').value,
                    role: document.getElementById('m-role').value,
                    status: 'Pending Invite'
                };
                this.team.push(newMember);
                this.renderTeam();
                break;
        }

        this.saveAll();
        this.updateBadgeCounts();
        this.closeModal();
    }

    // ==========================================================================
    // PERSISTENCE & DATA STORAGE
    // ==========================================================================

    saveAll() {
        try {
            localStorage.setItem('event_sessions', JSON.stringify(this.sessions));
            localStorage.setItem('event_attendees', JSON.stringify(this.attendees));
            localStorage.setItem('event_pending', JSON.stringify(this.pending));
            localStorage.setItem('event_organizations', JSON.stringify(this.organizations));
            localStorage.setItem('event_sponsors', JSON.stringify(this.sponsors));
            localStorage.setItem('event_exhibitors', JSON.stringify(this.exhibitors));
            localStorage.setItem('event_tickets', JSON.stringify(this.tickets));
            localStorage.setItem('event_team', JSON.stringify(this.team));
            localStorage.setItem('event_details', JSON.stringify(this.eventDetails));
            localStorage.setItem('event_floor_plan', JSON.stringify(this.floorPlan));
        } catch (e) {
            console.error('Storage quota exceeded!', e);
        }
    }

    // ==========================================================================
    // SESSION EDIT/CREATE FLOW HANDLERS
    // ==========================================================================

    async handleImagePreview(e, type) {
        const file = e.target.files[0];
        const previewEl = type === 'speaker' ? this.speakerImgPreview : this.moderatorImgPreview;
        if (file) {
            const base64 = await this.fileToBase64(file);
            previewEl.style.backgroundImage = `url(${base64})`;
            previewEl.classList.add('active');
        } else {
            previewEl.classList.remove('active');
        }
    }

    async handlePersonAdd(type) {
        const nameInput = type === 'speaker' ? this.speakerNameInput : this.moderatorNameInput;
        const imgInput = type === 'speaker' ? this.speakerImgInput : this.moderatorImgInput;
        const previewEl = type === 'speaker' ? this.speakerImgPreview : this.moderatorImgPreview;
        const name = nameInput.value.trim();
        if (!name) return;
        let imgSrc = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=random';
        if (imgInput.files && imgInput.files[0]) {
            imgSrc = await this.fileToBase64(imgInput.files[0]);
        }
        const person = { id: Date.now(), name, image: imgSrc };
        if (type === 'speaker') {
            this.currentSpeakers.push(person);
            this.renderPersonChips('speaker');
        } else {
            this.currentModerators.push(person);
            this.renderPersonChips('moderator');
        }
        nameInput.value = '';
        imgInput.value = '';
        previewEl.classList.remove('active');
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    renderPersonChips(type) {
        const listEl = type === 'speaker' ? this.speakersListEl : this.moderatorsListEl;
        const people = type === 'speaker' ? this.currentSpeakers : this.currentModerators;
        listEl.innerHTML = '';
        people.forEach(p => {
            const chip = document.createElement('div');
            chip.className = 'person-chip';
            chip.innerHTML = `
                <img src="${p.image}" alt="${p.name}">
                <span>${p.name}</span>
                <span class="remove" onclick="calendarApp.removePerson(${p.id}, '${type}')">×</span>
            `;
            listEl.appendChild(chip);
        });
    }

    removePerson(id, type) {
        if (type === 'speaker') {
            this.currentSpeakers = this.currentSpeakers.filter(p => p.id !== id);
            this.renderPersonChips('speaker');
        } else {
            this.currentModerators = this.currentModerators.filter(p => p.id !== id);
            this.renderPersonChips('moderator');
        }
    }

    handleSessionSubmit() {
        const title = document.getElementById('title').value;
        const date = document.getElementById('date').value;
        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;
        const description = document.getElementById('description').value;

        if (this.currentSpeakers.length === 0) {
            alert('Please add at least one speaker.');
            return;
        }

        if (this.editingSessionId) {
            const index = this.sessions.findIndex(s => s.id === this.editingSessionId);
            this.sessions[index] = {
                ...this.sessions[index],
                title, date, startTime, endTime, description,
                speakers: [...this.currentSpeakers],
                moderators: [...this.currentModerators]
            };
            this.editingSessionId = null;
            this.submitBtn.innerHTML = '<span class="icon">+</span> Create Session';
            this.cancelEditBtn.classList.add('hidden');
        } else {
            const newSession = {
                id: Date.now(),
                title, date, startTime, endTime, description,
                speakers: [...this.currentSpeakers],
                moderators: [...this.currentModerators],
                createdAt: new Date().toISOString()
            };
            this.sessions.unshift(newSession);
        }

        this.saveAll();
        this.renderTabs();
        this.renderSessions();
        this.renderDashboard();
        this.updateBadgeCounts();
        this.resetForm();
    }

    editSession(id) {
        const session = this.sessions.find(s => s.id === id);
        if (!session) return;

        this.editingSessionId = id;
        document.getElementById('title').value = session.title;
        document.getElementById('date').value = session.date;
        document.getElementById('start-time').value = session.startTime;
        document.getElementById('end-time').value = session.endTime;
        document.getElementById('description').value = session.description;

        this.currentSpeakers = [...session.speakers];
        this.currentModerators = [...session.moderators];
        this.renderPersonChips('speaker');
        this.renderPersonChips('moderator');

        this.submitBtn.innerHTML = '<span class="icon">✓</span> Update Session';
        this.cancelEditBtn.classList.remove('hidden');
        
        // Scroll to form
        document.querySelector('.controls').scrollIntoView({ behavior: 'smooth' });
    }

    cancelEdit() {
        this.editingSessionId = null;
        this.submitBtn.innerHTML = '<span class="icon">+</span> Create Session';
        this.cancelEditBtn.classList.add('hidden');
        this.resetForm();
    }

    resetForm() {
        this.form.reset();
        this.currentSpeakers = [];
        this.currentModerators = [];
        this.renderPersonChips('speaker');
        this.renderPersonChips('moderator');
        this.speakerImgPreview.classList.remove('active');
        this.moderatorImgPreview.classList.remove('active');
    }

    deleteSession(id) {
        if (confirm('Delete this session?')) {
            this.sessions = this.sessions.filter(s => s.id !== id);
            if (this.editingSessionId === id) this.cancelEdit();
            this.saveAll();
            this.renderTabs();
            this.renderSessions();
            this.renderDashboard();
            this.updateBadgeCounts();
        }
    }

    setupResizer() {
        let isDragging = false;
        this.resizer.addEventListener('mousedown', (e) => {
            isDragging = true;
            this.resizer.classList.add('dragging');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const newWidth = e.clientX;
            if (newWidth > 320 && newWidth < 800) {
                this.appContainer.style.setProperty('--sidebar-width', `${newWidth}px`);
                localStorage.setItem('sidebar_width', `${newWidth}px`);
            }
        });
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.resizer.classList.remove('dragging');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    }

    // ==========================================================================
    // UTILITY FORMATTERS
    // ==========================================================================

    formatDate(dateStr) {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    }

    formatFullDate(dateStr) {
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    }

    generateGoogleCalendarLink(session) {
        const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
        const title = encodeURIComponent(session.title);
        const speakersText = session.speakers.map(s => s.name).join(', ');
        const moderatorsText = session.moderators.map(m => m.name).join(', ');
        const description = encodeURIComponent(
            `${session.description}\n\nSpeakers: ${speakersText}${moderatorsText ? '\nModerators: ' + moderatorsText : ''}`
        );
        const start = new Date(`${session.date}T${session.startTime}`);
        const end = new Date(`${session.date}T${session.endTime}`);
        const formatGCalDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
        const dates = `${formatGCalDate(start)}/${formatGCalDate(end)}`;
        return `${baseUrl}&text=${title}&details=${description}&dates=${dates}`;
    }

    // ==========================================================================
    // DEFAULTS & INITIAL DATA SEEDING
    // ==========================================================================

    getDefaultEventDetails() {
        return {
            title: "Algeria Hydrogen Law Conference 2026",
            location: "Algiers International Conference Center & Online",
            type: "Hybrid",
            startDate: "2026-10-12",
            endDate: "2026-10-18",
            description: "The premiere global forum covering the legal, regulatory, and financial frameworks for the developing green hydrogen sector in North Africa.",
            banner: ""
        };
    }

    getDefaultSessions() {
        return [
            {
                id: 1,
                title: "Opening Ceremony & Ministerial Keynote",
                date: "2026-10-12",
                startTime: "09:00",
                endTime: "10:30",
                description: "Welcoming remarks and keynote speeches by the Ministry of Energy and Mines, outlining Algeria's strategic legal pathway for green hydrogen exportation to Europe.",
                speakers: [
                    { id: 101, name: "Mohamed Arkab", image: "https://ui-avatars.com/api/?name=Mohamed+Arkab&background=0b5cdb&color=fff" }
                ],
                moderators: [
                    { id: 201, name: "Dr. Amel Bouraoui", image: "https://ui-avatars.com/api/?name=Amel+Bouraoui&background=64748b&color=fff" }
                ]
            },
            {
                id: 2,
                title: "Regulatory Frameworks for Trans-Mediterranean Pipelines",
                date: "2026-10-12",
                startTime: "11:00",
                endTime: "12:30",
                description: "A panel debating the harmonization of technical codes and safety regulations for transporting gaseous hydrogen blends through the SoutH2 Corridor infrastructure.",
                speakers: [
                    { id: 102, name: "Jean-Marc Lhomme", image: "https://ui-avatars.com/api/?name=Jean-Marc+Lhomme&background=0b5cdb&color=fff" },
                    { id: 103, name: "Noureddine Yassaa", image: "https://ui-avatars.com/api/?name=Noureddine+Yassaa&background=0b5cdb&color=fff" }
                ],
                moderators: []
            },
            {
                id: 3,
                title: "Financing Large-Scale Clean Hydrogen Projects in North Africa",
                date: "2026-10-13",
                startTime: "14:00",
                endTime: "15:30",
                description: "Insights from the African Development Bank, IMF, and private equity heads on risk mitigation, sovereign guarantees, and project financing contracts.",
                speakers: [
                    { id: 104, name: "Fatima Al-Mansoori", image: "https://ui-avatars.com/api/?name=Fatima+Al-Mansoori&background=0b5cdb&color=fff" }
                ],
                moderators: [
                    { id: 202, name: "Christian Vance", image: "https://ui-avatars.com/api/?name=Christian+Vance&background=64748b&color=fff" }
                ]
            }
        ];
    }

    getDefaultAttendees() {
        return [
            { id: 1, name: "Sofiane Merabet", email: "s.merabet@sonatrach.dz", ticketType: "VIP Access Pass", status: "checked-in", registeredDate: "2026-09-15" },
            { id: 2, name: "Elena Rostova", email: "e.rostova@hydrogeneurope.eu", ticketType: "VIP Access Pass", status: "registered", registeredDate: "2026-09-18" },
            { id: 3, name: "Marcus Aurel", email: "m.aurel@deutschgas.de", ticketType: "Standard Admission", status: "checked-in", registeredDate: "2026-09-20" },
            { id: 4, name: "Amine Zerrouki", email: "a.zerrouki@univ-alger.dz", ticketType: "Online Only", status: "registered", registeredDate: "2026-09-24" }
        ];
    }

    getDefaultPending() {
        return [
            { id: 1, name: "Karim Benchikh", email: "k.benchikh@algeriapower.com", note: "Interested in the pipeline legal regulatory panels.", date: "2026-10-01" },
            { id: 2, name: "Sophia Martinez", email: "s.martinez@h2invest.com", note: "Investor wishing to schedule meetings with officials.", date: "2026-10-03" }
        ];
    }

    getDefaultOrganizations() {
        return [
            { id: 1, name: "Sonatrach", industry: "Energy & Hydrocarbons", contact: "Lamine O.", website: "https://www.sonatrach.com" },
            { id: 2, name: "Sonelgaz", industry: "Power Generation & Grid", contact: "Yassine A.", website: "https://www.sonelgaz.dz" },
            { id: 3, name: "Hydrogen Europe", industry: "Trade Association", contact: "Valerie D.", website: "https://www.hydrogeneurope.eu" }
        ];
    }

    getDefaultSponsors() {
        return [
            { id: 1, name: "Sonatrach", tier: "diamond", website: "https://www.sonatrach.com", image: "" },
            { id: 2, name: "Deutsche Bank", tier: "gold", website: "https://www.db.com", image: "" },
            { id: 3, name: "Air Liquide", tier: "silver", website: "https://www.airliquide.com", image: "" }
        ];
    }

    getDefaultExhibitors() {
        return [
            { id: 1, name: "Hydrogen Systems Corp", booth: "B12", contact: "Tariq S." },
            { id: 2, name: "Snam SpA", booth: "A04", contact: "Giuseppe M." }
        ];
    }

    getDefaultTickets() {
        return [
            { id: 1, name: "Standard Admission", price: 150, maxQty: 200, features: ["Access to all days", "Access to exhibition halls", "Standard lunch", "Presentation materials"] },
            { id: 2, name: "VIP Access Pass", price: 350, maxQty: 50, features: ["Access to all days", "Front-row auditorium seating", "Ministerial networking lunch", "VIP lounge access", "All session video recordings"] },
            { id: 3, name: "Online Only", price: 50, maxQty: 500, features: ["Access to live webinar stream", "Submit questions online", "Digital presentation materials"] }
        ];
    }

    getDefaultTeam() {
        return [
            { id: 1, name: "Dr. Amel Bouraoui", role: "Admin", email: "a.bouraoui@eventzone.com", status: "Active" },
            { id: 2, name: "Yasmin Cherif", role: "Editor", email: "y.cherif@eventzone.com", status: "Active" },
            { id: 3, name: "Rafik Khelil", role: "Staff", email: "r.khelil@eventzone.com", status: "Active" }
        ];
    }

    getDefaultFloorPlan() {
        return [
            { id: "A1", type: "booth-std", label: "Booth A1", exhibitorId: 2 },
            { id: "A3", type: "booth-std", label: "Booth A3", exhibitorId: null },
            { id: "B1", type: "booth-std", label: "Booth B1", exhibitorId: 1 },
            { id: "C3", type: "booth-vip", label: "VIP C3", exhibitorId: null },
            { id: "C5", type: "booth-vip", label: "VIP C5", exhibitorId: null },
            { id: "E6", type: "stage", label: "Main Stage", exhibitorId: null },
            { id: "E7", type: "stage", label: "Main Stage", exhibitorId: null },
            { id: "F6", type: "stage", label: "Main Stage", exhibitorId: null },
            { id: "F7", type: "stage", label: "Main Stage", exhibitorId: null },
            { id: "K11", type: "food", label: "Catering", exhibitorId: null },
            { id: "K12", type: "food", label: "Catering", exhibitorId: null },
            { id: "L11", type: "food", label: "Catering", exhibitorId: null },
            { id: "L12", type: "food", label: "Catering", exhibitorId: null }
        ];
    }
}

// Initialize the app
const calendarApp = new EventCalendar();
window.calendarApp = calendarApp;

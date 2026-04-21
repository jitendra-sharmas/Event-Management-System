/* ═══════════════════════════════════════════════════════════
   CampusVibe - College Event Management System
   Frontend Application JavaScript
   ═══════════════════════════════════════════════════════════ */

const API = '/api';
let currentUser = null;
let currentPage = 'dashboard';
let allEvents = [];
let currentFilter = 'all';

// ─── Category Config ───
const CATEGORY_CONFIG = {
  'Technical':  { icon: '💻', gradient: 'linear-gradient(135deg, #6C63FF, #3B82F6)' },
  'Cultural':   { icon: '🎭', gradient: 'linear-gradient(135deg, #FF6B9D, #D65DB1)' },
  'Workshop':   { icon: '🔧', gradient: 'linear-gradient(135deg, #00C9A7, #00D2FC)' },
  'Sports':     { icon: '⚽', gradient: 'linear-gradient(135deg, #FF9671, #FFC75F)' },
  'Seminar':    { icon: '🎤', gradient: 'linear-gradient(135deg, #845EC2, #6C63FF)' },
  'Social':     { icon: '🌿', gradient: 'linear-gradient(135deg, #00C9A7, #2ECC71)' },
  'Other':      { icon: '✨', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' }
};

// ─── Initialize ───
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  checkAuth();
});

function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const colors = ['#6C63FF', '#00D2FC', '#FF6B9D', '#00C9A7', '#FFC75F'];
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (8 + Math.random() * 15) + 's';
    particle.style.animationDelay = Math.random() * 10 + 's';
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.width = (2 + Math.random() * 3) + 'px';
    particle.style.height = particle.style.width;
    container.appendChild(particle);
  }
}

// ─── Auth Functions ───
function checkAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (token && user) {
    currentUser = JSON.parse(user);
    showApp();
  } else {
    showAuth();
  }
}

function showAuth() {
  document.getElementById('authPage').style.display = 'flex';
  document.getElementById('appLayout').style.display = 'none';
}

function showApp() {
  document.getElementById('authPage').style.display = 'none';
  document.getElementById('appLayout').style.display = 'flex';
  renderSidebar();
  navigateTo('dashboard');
}

function switchAuthTab(tab) {
  document.getElementById('loginTab').classList.toggle('active', tab === 'login');
  document.getElementById('registerTab').classList.toggle('active', tab === 'register');
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) return showToast('Please fill in all fields', 'warning');

  const btn = document.getElementById('loginBtn');
  btn.disabled = true;
  btn.textContent = 'Signing in...';

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    currentUser = data.user;
    showToast('Welcome back, ' + currentUser.full_name + '! 🎉', 'success');
    showApp();
  } catch (err) {
    showToast(err.message || 'Login failed', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In →';
  }
}

async function handleRegister() {
  const full_name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const role = document.getElementById('regRole').value;
  const department = document.getElementById('regDepartment').value;
  const year = document.getElementById('regYear').value;
  const phone = document.getElementById('regPhone').value.trim();

  if (!full_name || !email || !password) return showToast('Please fill in required fields', 'warning');

  const btn = document.getElementById('regBtn');
  btn.disabled = true;
  btn.textContent = 'Creating account...';

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password, role, department, year, phone })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    currentUser = data.user;
    showToast('Account created! Welcome to CampusVibe! 🎉', 'success');
    showApp();
  } catch (err) {
    showToast(err.message || 'Registration failed', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create Account →';
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentUser = null;
  showAuth();
  showToast('Logged out successfully', 'info');
}

// ─── API Helper ───
async function apiCall(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API}${endpoint}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ─── Sidebar ───
function renderSidebar() {
  const nav = document.getElementById('sidebarNav');
  const role = currentUser.role;

  let links = [
    { section: 'Main', items: [
      { id: 'dashboard', icon: '📊', label: 'Dashboard' },
      { id: 'events', icon: '📅', label: 'Events' },
      { id: 'announcements', icon: '📢', label: 'Announcements' },
    ]},
  ];

  if (role === 'student') {
    links.push({ section: 'My Space', items: [
      { id: 'my-registrations', icon: '🎟️', label: 'My Registrations' },
      { id: 'profile', icon: '👤', label: 'Profile' },
    ]});
  }

  if (role === 'organizer' || role === 'admin') {
    links.push({ section: 'Manage', items: [
      { id: 'create-event', icon: '➕', label: 'Create Event' },
      { id: 'my-events', icon: '📋', label: 'My Events' },
    ]});
  }

  if (role === 'admin') {
    links.push({ section: 'Admin', items: [
      { id: 'manage-users', icon: '👥', label: 'Manage Users' },
      { id: 'create-announcement', icon: '📣', label: 'Post Announcement' },
    ]});
  }

  links.push({ section: 'Account', items: [
    { id: 'profile', icon: '👤', label: 'Profile' },
  ]});

  nav.innerHTML = links.map(section => `
    <div class="sidebar-section-title">${section.section}</div>
    ${section.items.map(item => `
      <div class="sidebar-link ${currentPage === item.id ? 'active' : ''}" onclick="navigateTo('${item.id}')" id="nav-${item.id}">
        <span class="sidebar-link-icon">${item.icon}</span>
        ${item.label}
      </div>
    `).join('')}
  `).join('');

  // User info
  const initials = currentUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
  document.getElementById('sidebarUser').innerHTML = `
    <div class="sidebar-avatar" style="background:${currentUser.avatar_color}">${initials}</div>
    <div class="sidebar-user-info">
      <div class="sidebar-user-name">${currentUser.full_name}</div>
      <div class="sidebar-user-role">${currentUser.role}</div>
    </div>
    <button class="sidebar-logout" onclick="logout()" title="Logout">🚪</button>
  `;
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('active');
}

// ─── Navigation ───
function navigateTo(page) {
  currentPage = page;
  document.getElementById('pageTitle').textContent = getPageTitle(page);
  renderSidebar();

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('active');

  const content = document.getElementById('pageContent');
  content.innerHTML = '<div class="spinner"></div>';

  switch(page) {
    case 'dashboard':        renderDashboard(); break;
    case 'events':           renderEvents(); break;
    case 'announcements':    renderAnnouncements(); break;
    case 'my-registrations': renderMyRegistrations(); break;
    case 'create-event':     renderCreateEvent(); break;
    case 'my-events':        renderMyEvents(); break;
    case 'manage-users':     renderManageUsers(); break;
    case 'create-announcement': renderCreateAnnouncement(); break;
    case 'profile':          renderProfile(); break;
    default:                 renderDashboard();
  }
}

function getPageTitle(page) {
  const titles = {
    'dashboard': 'Dashboard',
    'events': 'Explore Events',
    'announcements': 'Announcements',
    'my-registrations': 'My Registrations',
    'create-event': 'Create Event',
    'my-events': 'My Events',
    'manage-users': 'Manage Users',
    'create-announcement': 'Post Announcement',
    'profile': 'My Profile'
  };
  return titles[page] || 'Dashboard';
}

// ─── Dashboard Page ───
async function renderDashboard() {
  const content = document.getElementById('pageContent');

  try {
    let statsHtml = '';
    if (currentUser.role === 'admin' || currentUser.role === 'organizer') {
      const stats = await apiCall('/admin/stats');

      statsHtml = `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon">👥</div>
              <span class="stat-card-label">Total Users</span>
            </div>
            <div class="stat-card-value">${stats.totalUsers}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon">📅</div>
              <span class="stat-card-label">Total Events</span>
            </div>
            <div class="stat-card-value">${stats.totalEvents}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon">📝</div>
              <span class="stat-card-label">Registrations</span>
            </div>
            <div class="stat-card-value">${stats.totalRegistrations}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon">🎉</div>
              <span class="stat-card-label">Upcoming</span>
            </div>
            <div class="stat-card-value">${stats.upcomingEvents}</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="card">
            <div class="card-header">
              <h3>📊 Events by Category</h3>
            </div>
            <div class="card-body">
              <div class="chart-container">
                ${stats.categoryStats.map((cat, i) => {
                  const colors = ['#6C63FF', '#FF6B9D', '#00C9A7', '#FFC75F', '#00D2FC', '#845EC2'];
                  const maxCount = Math.max(...stats.categoryStats.map(c => c.count));
                  const height = (cat.count / maxCount) * 100;
                  return `
                    <div class="chart-bar" style="height:${height}%; background:${colors[i % colors.length]}">
                      <span class="chart-bar-value">${cat.count}</span>
                      <span class="chart-bar-label">${cat.category}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3>🔥 Popular Events</h3>
            </div>
            <div class="card-body">
              ${stats.popularEvents.length > 0 ? stats.popularEvents.map((ev, i) => `
                <div class="popular-event">
                  <div class="popular-event-rank">${i + 1}</div>
                  <div class="popular-event-info">
                    <div class="popular-event-title">${ev.title}</div>
                    <div class="popular-event-meta">${ev.category} · ${formatDate(ev.date)}</div>
                  </div>
                  <div class="popular-event-count">${ev.reg_count} 📝</div>
                </div>
              `).join('') : '<div class="empty-state"><p>No events yet</p></div>'}
            </div>
          </div>
        </div>

        <div class="card" style="margin-top:24px;">
          <div class="card-header">
            <h3>📝 Recent Registrations</h3>
          </div>
          <div class="card-body">
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr><th>Student</th><th>Event</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  ${stats.recentRegistrations.map(reg => `
                    <tr>
                      <td>${reg.full_name}</td>
                      <td>${reg.event_title}</td>
                      <td><span class="reg-status reg-status-${reg.status}">${reg.status}</span></td>
                      <td>${formatDate(reg.registered_at)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } else {
      // Student dashboard
      const events = await apiCall('/events?status=upcoming');
      const regs = await apiCall('/events/user/registrations');

      statsHtml = `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon">📅</div>
              <span class="stat-card-label">Upcoming Events</span>
            </div>
            <div class="stat-card-value">${events.length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon">🎟️</div>
              <span class="stat-card-label">My Registrations</span>
            </div>
            <div class="stat-card-value">${regs.filter(r => r.status === 'confirmed').length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon">✅</div>
              <span class="stat-card-label">Attended</span>
            </div>
            <div class="stat-card-value">${regs.filter(r => r.status === 'attended').length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon">🌟</div>
              <span class="stat-card-label">Welcome</span>
            </div>
            <div class="stat-card-value" style="font-size:1rem;color:var(--text-secondary);">${currentUser.full_name.split(' ')[0]}</div>
          </div>
        </div>

        <h3 class="section-title"><span>🔥</span> Upcoming Events</h3>
        <div class="events-grid">
          ${events.slice(0, 6).map(ev => renderEventCard(ev)).join('')}
        </div>
      `;
    }

    content.innerHTML = statsHtml;
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><h3>Could not load dashboard</h3><p>${err.message}</p></div>`;
  }
}

// ─── Events Page ───
async function renderEvents() {
  const content = document.getElementById('pageContent');

  try {
    allEvents = await apiCall('/events');
    const categories = ['all', ...new Set(allEvents.map(e => e.category))];

    content.innerHTML = `
      <div class="filter-bar">
        ${categories.map(cat => `
          <div class="filter-chip ${currentFilter === cat ? 'active' : ''}" onclick="filterEvents('${cat}')">${cat === 'all' ? '🌟 All' : (CATEGORY_CONFIG[cat]?.icon || '✨') + ' ' + cat}</div>
        `).join('')}
      </div>
      <div class="events-grid" id="eventsGrid">
        ${allEvents.map(ev => renderEventCard(ev)).join('')}
      </div>
    `;

    if (allEvents.length === 0) {
      document.getElementById('eventsGrid').innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><h3>No events found</h3><p>Check back later for exciting events!</p></div>';
    }
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><h3>Could not load events</h3><p>${err.message}</p></div>`;
  }
}

function filterEvents(category) {
  currentFilter = category;
  const grid = document.getElementById('eventsGrid');
  if (!grid) return;

  const filtered = category === 'all' ? allEvents : allEvents.filter(e => e.category === category);
  grid.innerHTML = filtered.length > 0
    ? filtered.map(ev => renderEventCard(ev)).join('')
    : '<div class="empty-state"><div class="empty-state-icon">🔍</div><h3>No events in this category</h3></div>';

  // Update active chip
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.classList.toggle('active', chip.textContent.includes(category === 'all' ? 'All' : category));
  });
}

function handleGlobalSearch(query) {
  if (currentPage !== 'events') {
    currentFilter = 'all';
    navigateTo('events');
    setTimeout(() => handleGlobalSearch(query), 500);
    return;
  }
  if (!query.trim()) {
    filterEvents('all');
    return;
  }
  const q = query.toLowerCase();
  const filtered = allEvents.filter(e =>
    e.title.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q)
  );
  const grid = document.getElementById('eventsGrid');
  if (grid) {
    grid.innerHTML = filtered.length > 0
      ? filtered.map(ev => renderEventCard(ev)).join('')
      : '<div class="empty-state"><div class="empty-state-icon">🔍</div><h3>No results found</h3></div>';
  }
}

function renderEventCard(ev) {
  const config = CATEGORY_CONFIG[ev.category] || CATEGORY_CONFIG['Other'];
  const pct = ev.capacity > 0 ? Math.min((ev.registered_count / ev.capacity) * 100, 100) : 0;

  return `
    <div class="event-card" onclick="showEventDetail(${ev.id})">
      <div class="event-card-banner">
        <div class="event-card-banner-bg" style="background:${config.gradient}"></div>
        <span class="event-card-status status-${ev.status}">${ev.status}</span>
        <span class="event-card-category">${ev.category}</span>
        <span class="event-icon">${config.icon}</span>
      </div>
      <div class="event-card-content">
        <h3 class="event-card-title">${ev.title}</h3>
        <p class="event-card-desc">${ev.description || ''}</p>
        <div class="event-card-meta">
          <span class="event-meta-item"><span>📅</span> ${formatDate(ev.date)}</span>
          <span class="event-meta-item"><span>🕐</span> ${formatTime(ev.time)}</span>
          <span class="event-meta-item"><span>📍</span> ${ev.venue}</span>
        </div>
        <div class="event-card-footer">
          <div class="event-capacity">
            <span>${ev.registered_count || 0} / ${ev.capacity} registered</span>
            <div class="event-capacity-bar">
              <div class="event-capacity-fill" style="width:${pct}%"></div>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); showEventDetail(${ev.id})">View Details</button>
        </div>
      </div>
    </div>
  `;
}

// ─── Event Detail Modal ───
async function showEventDetail(eventId) {
  try {
    const ev = await apiCall(`/events/${eventId}`);
    const config = CATEGORY_CONFIG[ev.category] || CATEGORY_CONFIG['Other'];

    // Check if user is registered
    let isRegistered = false;
    if (currentUser) {
      isRegistered = ev.registrations?.some(r => r.user_id === currentUser.id && r.status === 'confirmed');
    }

    const modal = document.getElementById('modalContent');
    modal.innerHTML = `
      <div class="modal-header">
        <h2>${config.icon} ${ev.title}</h2>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="event-detail-banner" style="background:${config.gradient}">
          <span class="event-icon">${config.icon}</span>
        </div>

        <div class="event-detail-info">
          <div class="event-info-item">
            <span class="event-info-icon">📅</span>
            <div><div class="event-info-label">Date</div><div class="event-info-value">${formatDate(ev.date)}</div></div>
          </div>
          <div class="event-info-item">
            <span class="event-info-icon">🕐</span>
            <div><div class="event-info-label">Time</div><div class="event-info-value">${formatTime(ev.time)}</div></div>
          </div>
          <div class="event-info-item">
            <span class="event-info-icon">📍</span>
            <div><div class="event-info-label">Venue</div><div class="event-info-value">${ev.venue}</div></div>
          </div>
          <div class="event-info-item">
            <span class="event-info-icon">👥</span>
            <div><div class="event-info-label">Capacity</div><div class="event-info-value">${ev.registered_count} / ${ev.capacity}</div></div>
          </div>
        </div>

        <p style="color:var(--text-secondary); line-height:1.7; margin-bottom:20px;">${ev.description || 'No description available.'}</p>

        ${ev.organizer_name ? `<p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:20px;">Organized by <strong style="color:var(--text-primary)">${ev.organizer_name}</strong> · ${ev.organizer_dept || ''}</p>` : ''}

        ${ev.feedback && ev.feedback.length > 0 ? `
          <h4 class="section-title" style="margin-top:24px"><span>⭐</span> Reviews</h4>
          ${ev.feedback.map(f => `
            <div class="feedback-item">
              <div class="feedback-avatar" style="background:${f.avatar_color}">${f.full_name[0]}</div>
              <div class="feedback-content">
                <div class="feedback-name">${f.full_name}</div>
                <div class="feedback-stars">${'⭐'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}</div>
                <div class="feedback-text">${f.comment || ''}</div>
              </div>
            </div>
          `).join('')}
        ` : ''}

        ${currentUser?.role === 'student' ? `
          <div style="margin-top:24px; padding-top:20px; border-top:1px solid var(--border-glass);">
            <h4 class="section-title"><span>⭐</span> Leave Feedback</h4>
            <div class="stars" id="feedbackStars" style="margin-bottom:12px;">
              ${[1,2,3,4,5].map(s => `<span class="star" onclick="setRating(${s})" data-rating="${s}">☆</span>`).join('')}
            </div>
            <textarea class="form-input" id="feedbackComment" placeholder="Share your experience..." style="min-height:80px;margin-bottom:12px;"></textarea>
            <button class="btn btn-success btn-sm" onclick="submitFeedback(${ev.id})">Submit Review</button>
          </div>
        ` : ''}

        ${currentUser?.role === 'admin' || (currentUser?.role === 'organizer' && ev.organizer_id === currentUser?.id) ? `
          <div style="margin-top:24px; padding-top:20px; border-top:1px solid var(--border-glass);">
            <h4 class="section-title"><span>👥</span> Registrations (${ev.registrations?.length || 0})</h4>
            ${ev.registrations && ev.registrations.length > 0 ? `
              <div class="table-wrapper">
                <table class="data-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Status</th></tr></thead>
                  <tbody>
                    ${ev.registrations.map(r => `
                      <tr>
                        <td>${r.full_name}</td>
                        <td>${r.email}</td>
                        <td>${r.department || '-'}</td>
                        <td><span class="reg-status reg-status-${r.status}">${r.status}</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : '<p style="color:var(--text-muted)">No registrations yet</p>'}
          </div>
        ` : ''}
      </div>
      <div class="modal-footer">
        ${currentUser?.role === 'admin' ? `<button class="btn btn-danger btn-sm" onclick="deleteEvent(${ev.id})">🗑️ Delete</button>` : ''}
        ${currentUser?.role === 'student' ?
          (isRegistered ?
            `<button class="btn btn-danger btn-sm" onclick="cancelRegistration(${ev.id})">Cancel Registration</button>` :
            `<button class="btn btn-success" onclick="registerForEvent(${ev.id})" ${ev.registered_count >= ev.capacity ? 'disabled' : ''}>
              ${ev.registered_count >= ev.capacity ? '🚫 Event Full' : '🎟️ Register Now'}
            </button>`
          ) : ''}
        <button class="btn btn-secondary" onclick="closeModal()">Close</button>
      </div>
    `;

    openModal();
  } catch (err) {
    showToast('Failed to load event details: ' + err.message, 'error');
  }
}

let selectedRating = 0;
function setRating(rating) {
  selectedRating = rating;
  document.querySelectorAll('#feedbackStars .star').forEach((star, i) => {
    star.textContent = i < rating ? '⭐' : '☆';
    star.classList.toggle('filled', i < rating);
  });
}

async function submitFeedback(eventId) {
  if (selectedRating === 0) return showToast('Please select a rating', 'warning');
  const comment = document.getElementById('feedbackComment')?.value || '';
  try {
    await apiCall(`/events/${eventId}/feedback`, 'POST', { rating: selectedRating, comment });
    showToast('Thank you for your feedback! ⭐', 'success');
    selectedRating = 0;
    showEventDetail(eventId);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function registerForEvent(eventId) {
  try {
    await apiCall(`/events/${eventId}/register`, 'POST');
    showToast('Successfully registered! 🎉', 'success');
    showEventDetail(eventId);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function cancelRegistration(eventId) {
  try {
    await apiCall(`/events/${eventId}/register`, 'DELETE');
    showToast('Registration cancelled', 'info');
    showEventDetail(eventId);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteEvent(eventId) {
  if (!confirm('Are you sure you want to delete this event?')) return;
  try {
    await apiCall(`/events/${eventId}`, 'DELETE');
    showToast('Event deleted', 'success');
    closeModal();
    navigateTo(currentPage);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ─── Announcements Page ───
async function renderAnnouncements() {
  const content = document.getElementById('pageContent');
  try {
    const announcements = await apiCall('/announcements');
    content.innerHTML = announcements.length > 0 ? announcements.map(a => `
      <div class="announcement-card priority-${a.priority}">
        <div class="announcement-header">
          <div class="announcement-title">${a.title}</div>
          <span class="announcement-priority">${a.priority}</span>
        </div>
        <p class="announcement-message">${a.message}</p>
        <div class="announcement-footer">
          <span>👤 ${a.author_name || 'Admin'}</span>
          <span>📅 ${formatDate(a.created_at)}</span>
          ${currentUser?.role === 'admin' ? `<span style="cursor:pointer;color:var(--accent-pink);" onclick="deleteAnnouncement(${a.id})">🗑️ Delete</span>` : ''}
        </div>
      </div>
    `).join('') : '<div class="empty-state"><div class="empty-state-icon">📢</div><h3>No announcements</h3><p>All caught up!</p></div>';
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><h3>Could not load announcements</h3><p>${err.message}</p></div>`;
  }
}

async function deleteAnnouncement(id) {
  if (!confirm('Delete this announcement?')) return;
  try {
    await apiCall(`/announcements/${id}`, 'DELETE');
    showToast('Announcement deleted', 'success');
    renderAnnouncements();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ─── My Registrations ───
async function renderMyRegistrations() {
  const content = document.getElementById('pageContent');
  try {
    const regs = await apiCall('/events/user/registrations');
    content.innerHTML = regs.length > 0 ? regs.map(r => {
      const config = CATEGORY_CONFIG[r.category] || CATEGORY_CONFIG['Other'];
      return `
        <div class="reg-card">
          <div class="reg-icon">${config.icon}</div>
          <div class="reg-info">
            <div class="reg-title">${r.title}</div>
            <div class="reg-meta">
              <span>📅 ${formatDate(r.date)}</span>
              <span>🕐 ${formatTime(r.time)}</span>
              <span>📍 ${r.venue}</span>
            </div>
          </div>
          <span class="reg-status reg-status-${r.status}">${r.status}</span>
          ${r.status === 'confirmed' ? `<button class="btn btn-danger btn-sm" onclick="cancelRegistration(${r.event_id}); setTimeout(() => navigateTo('my-registrations'), 500);">Cancel</button>` : ''}
        </div>
      `;
    }).join('') : '<div class="empty-state"><div class="empty-state-icon">🎟️</div><h3>No registrations</h3><p>Browse events and register for ones that interest you!</p><button class="btn btn-primary" onclick="navigateTo(\'events\')" style="margin-top:16px;">Explore Events</button></div>';
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><h3>Error</h3><p>${err.message}</p></div>`;
  }
}

// ─── Create Event ───
function renderCreateEvent() {
  const content = document.getElementById('pageContent');
  content.innerHTML = `
    <div class="card" style="max-width:700px;">
      <div class="card-header"><h3>➕ Create New Event</h3></div>
      <div class="card-body">
        <div class="form-group">
          <label>Event Title</label>
          <input class="form-input" id="eventTitle" placeholder="Enter event title">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea class="form-input" id="eventDesc" placeholder="Describe your event in detail..."></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Category</label>
            <select class="form-input" id="eventCategory">
              <option value="Technical">💻 Technical</option>
              <option value="Cultural">🎭 Cultural</option>
              <option value="Workshop">🔧 Workshop</option>
              <option value="Sports">⚽ Sports</option>
              <option value="Seminar">🎤 Seminar</option>
              <option value="Social">🌿 Social</option>
            </select>
          </div>
          <div class="form-group">
            <label>Venue</label>
            <input class="form-input" id="eventVenue" placeholder="Event location">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Date</label>
            <input type="date" class="form-input" id="eventDate">
          </div>
          <div class="form-group">
            <label>Time</label>
            <input type="time" class="form-input" id="eventTime">
          </div>
        </div>
        <div class="form-group">
          <label>Capacity</label>
          <input type="number" class="form-input" id="eventCapacity" value="100" min="1">
        </div>
        <button class="btn btn-primary btn-lg" onclick="submitEvent()">🚀 Create Event</button>
      </div>
    </div>
  `;
}

async function submitEvent() {
  const title = document.getElementById('eventTitle').value.trim();
  const description = document.getElementById('eventDesc').value.trim();
  const category = document.getElementById('eventCategory').value;
  const venue = document.getElementById('eventVenue').value.trim();
  const date = document.getElementById('eventDate').value;
  const time = document.getElementById('eventTime').value;
  const capacity = parseInt(document.getElementById('eventCapacity').value);

  if (!title || !category || !venue || !date || !time) {
    return showToast('Please fill in all required fields', 'warning');
  }

  try {
    await apiCall('/events', 'POST', { title, description, category, venue, date, time, capacity });
    showToast('Event created successfully! 🎉', 'success');
    navigateTo('events');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ─── My Events (Organizer) ───
async function renderMyEvents() {
  const content = document.getElementById('pageContent');
  try {
    const events = await apiCall('/events');
    const myEvents = events.filter(e => e.organizer_id === currentUser.id || currentUser.role === 'admin');

    content.innerHTML = myEvents.length > 0 ? `
      <div class="events-grid">
        ${myEvents.map(ev => renderEventCard(ev)).join('')}
      </div>
    ` : '<div class="empty-state"><div class="empty-state-icon">📋</div><h3>No events yet</h3><p>Create your first event!</p><button class="btn btn-primary" onclick="navigateTo(\'create-event\')" style="margin-top:16px;">Create Event</button></div>';
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><p>${err.message}</p></div>`;
  }
}

// ─── Manage Users (Admin) ───
async function renderManageUsers() {
  const content = document.getElementById('pageContent');
  try {
    const users = await apiCall('/admin/users');
    content.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>👥 All Users (${users.length})</h3>
        </div>
        <div class="card-body">
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr><th>User</th><th>Email</th><th>Role</th><th>Department</th><th>Actions</th></tr>
              </thead>
              <tbody>
                ${users.map(u => {
                  const initials = u.full_name.split(' ').map(n => n[0]).join('');
                  return `
                    <tr>
                      <td><div class="user-cell"><div class="mini-avatar" style="background:${u.avatar_color}">${initials}</div>${u.full_name}</div></td>
                      <td>${u.email}</td>
                      <td><span class="role-badge role-${u.role}">${u.role}</span></td>
                      <td>${u.department || '-'}</td>
                      <td>
                        <select class="form-input" style="width:auto;padding:6px 30px 6px 10px;font-size:0.78rem;" onchange="updateUserRole(${u.id}, this.value)">
                          <option value="student" ${u.role==='student'?'selected':''}>Student</option>
                          <option value="organizer" ${u.role==='organizer'?'selected':''}>Organizer</option>
                          <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
                        </select>
                        ${u.id !== currentUser.id ? `<button class="btn btn-danger btn-sm" style="margin-left:8px;" onclick="deleteUser(${u.id})">🗑️</button>` : ''}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><p>${err.message}</p></div>`;
  }
}

async function updateUserRole(userId, role) {
  try {
    await apiCall(`/admin/users/${userId}/role`, 'PUT', { role });
    showToast('Role updated successfully', 'success');
  } catch (err) {
    showToast(err.message, 'error');
    renderManageUsers();
  }
}

async function deleteUser(userId) {
  if (!confirm('Are you sure? This will delete the user and all their data.')) return;
  try {
    await apiCall(`/admin/users/${userId}`, 'DELETE');
    showToast('User deleted', 'success');
    renderManageUsers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ─── Create Announcement (Admin) ───
function renderCreateAnnouncement() {
  const content = document.getElementById('pageContent');
  content.innerHTML = `
    <div class="card" style="max-width:700px;">
      <div class="card-header"><h3>📣 Post Announcement</h3></div>
      <div class="card-body">
        <div class="form-group">
          <label>Title</label>
          <input class="form-input" id="annTitle" placeholder="Announcement title">
        </div>
        <div class="form-group">
          <label>Message</label>
          <textarea class="form-input" id="annMessage" placeholder="Write your announcement..."></textarea>
        </div>
        <div class="form-group">
          <label>Priority</label>
          <select class="form-input" id="annPriority">
            <option value="low">🟢 Low</option>
            <option value="normal" selected>🔵 Normal</option>
            <option value="high">🟠 High</option>
            <option value="urgent">🔴 Urgent</option>
          </select>
        </div>
        <button class="btn btn-primary btn-lg" onclick="submitAnnouncement()">📢 Post Announcement</button>
      </div>
    </div>
  `;
}

async function submitAnnouncement() {
  const title = document.getElementById('annTitle').value.trim();
  const message = document.getElementById('annMessage').value.trim();
  const priority = document.getElementById('annPriority').value;

  if (!title || !message) return showToast('Please fill in all fields', 'warning');

  try {
    await apiCall('/announcements', 'POST', { title, message, priority });
    showToast('Announcement posted! 📢', 'success');
    navigateTo('announcements');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ─── Profile Page ───
async function renderProfile() {
  const content = document.getElementById('pageContent');
  try {
    const user = await apiCall('/auth/me');
    const initials = user.full_name.split(' ').map(n => n[0]).join('').toUpperCase();

    let regCount = 0, attendedCount = 0;
    try {
      const regs = await apiCall('/events/user/registrations');
      regCount = regs.filter(r => r.status === 'confirmed').length;
      attendedCount = regs.filter(r => r.status === 'attended').length;
    } catch(e) {}

    content.innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar" style="background:${user.avatar_color}">${initials}</div>
        <div class="profile-info">
          <h2>${user.full_name}</h2>
          <p>${user.email}</p>
          <p style="margin-top:4px;"><span class="role-badge role-${user.role}">${user.role}</span></p>
        </div>
      </div>

      <div class="profile-stats">
        <div class="profile-stat">
          <div class="profile-stat-value">${regCount}</div>
          <div class="profile-stat-label">Registrations</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-value">${attendedCount}</div>
          <div class="profile-stat-label">Attended</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-value">${user.department || '-'}</div>
          <div class="profile-stat-label">Department</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3>👤 Profile Details</h3></div>
        <div class="card-body">
          <div class="table-wrapper">
            <table class="data-table">
              <tbody>
                <tr><td style="font-weight:600;color:var(--text-primary);">Full Name</td><td>${user.full_name}</td></tr>
                <tr><td style="font-weight:600;color:var(--text-primary);">Email</td><td>${user.email}</td></tr>
                <tr><td style="font-weight:600;color:var(--text-primary);">Role</td><td style="text-transform:capitalize;">${user.role}</td></tr>
                <tr><td style="font-weight:600;color:var(--text-primary);">Department</td><td>${user.department || '-'}</td></tr>
                <tr><td style="font-weight:600;color:var(--text-primary);">Year</td><td>${user.year || '-'}</td></tr>
                <tr><td style="font-weight:600;color:var(--text-primary);">Phone</td><td>${user.phone || '-'}</td></tr>
                <tr><td style="font-weight:600;color:var(--text-primary);">Member Since</td><td>${formatDate(user.created_at)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><p>${err.message}</p></div>`;
  }
}

// ─── Modal Helpers ───
function openModal() {
  document.getElementById('modalBackdrop').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('active');
  document.body.style.overflow = '';
}

function closeModalOnBackdrop(e) {
  if (e.target === document.getElementById('modalBackdrop')) closeModal();
}

// ─── Toast ───
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ─── Format Helpers ───
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '-';
  const [h, m] = timeStr.split(':');
  const hr = parseInt(h);
  const ampm = hr >= 12 ? 'PM' : 'AM';
  const hour = hr % 12 || 12;
  return `${hour}:${m} ${ampm}`;
}

// ─── Keyboard Shortcuts ───
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
  if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
    document.getElementById('globalSearch')?.focus();
  }
});

/**
 * Al-Huda SIMS - SPA Core Application
 * ES6 Fetch API driven module loader
 */

import { initSidebar } from './sidebar.js';
import { showSkeleton } from './skeleton.js';
import { loadDashboard } from './dashboard.js';
import { loadStudents, loadStudentForm } from './students.js';
import { loadStaff, loadStaffForm } from './staff.js';
import { loadPerformance } from './performance.js';
import { loadSubjects } from './subjects.js';

// =============================================
// API Helper
// =============================================
export const api = {
    /**
     * Make an authenticated fetch request.
     */
    async request(endpoint, options = {}) {
        const url = `${window.SIMS.apiBase}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'X-CSRF-Token': window.SIMS.csrfToken,
            ...options.headers,
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (!response.ok) {
                throw { status: response.status, ...data };
            }

            // Update CSRF token if provided
            if (data.csrf_token) {
                window.SIMS.csrfToken = data.csrf_token;
            }

            return data;
        } catch (error) {
            if (error.status === 401) {
                showLogin();
            }
            throw error;
        }
    },

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify({ ...body, _csrf_token: window.SIMS.csrfToken }),
        });
    },

    put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify({ ...body, _csrf_token: window.SIMS.csrfToken }),
        });
    },

    delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
            body: JSON.stringify({ _csrf_token: window.SIMS.csrfToken }),
        });
    },
};

// =============================================
// Toast Notifications
// =============================================
export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const icons = {
        success: 'bx-check-circle',
        error: 'bx-error-circle',
        info: 'bx-info-circle',
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class='bx ${icons[type] || icons.info}'></i><span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// =============================================
// Modal
// =============================================
export function showModal(title, bodyHtml, footerHtml = '') {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    document.getElementById('modal-footer').innerHTML = footerHtml;
    document.getElementById('modal-overlay').classList.remove('hidden');
}

export function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

// =============================================
// Utility
// =============================================
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function formatDate(dateStr) {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function getStatusBadge(status) {
    const cls = status.toLowerCase().replace(/\s+/g, '-');
    return `<span class="badge badge-${cls}">${escapeHtml(status)}</span>`;
}

// =============================================
// Pagination Builder
// =============================================
export function buildPagination(paginationData, onPageChange) {
    const { page, total_pages, total, per_page } = paginationData;
    const start = (page - 1) * per_page + 1;
    const end = Math.min(page * per_page, total);

    let html = `
        <div class="pagination">
            <div class="pagination-info">
                Showing ${start}–${end} of ${total} records
            </div>
            <div class="pagination-controls">
                <button class="pagination-btn" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>
                    <i class='bx bx-chevron-left'></i>
                </button>`;

    // Page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(total_pages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="pagination-btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    html += `
                <button class="pagination-btn" data-page="${page + 1}" ${page >= total_pages ? 'disabled' : ''}>
                    <i class='bx bx-chevron-right'></i>
                </button>
            </div>
        </div>`;

    return html;
}

export function bindPagination(container, onPageChange) {
    container.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = parseInt(btn.dataset.page);
            if (!btn.disabled && page > 0) {
                onPageChange(page);
            }
        });
    });
}

// =============================================
// SPA Router
// =============================================
const routes = {
    dashboard: { title: 'Dashboard', loader: loadDashboard },
    students: { title: 'Students', loader: loadStudents },
    'students-add': { title: 'Add Student', loader: loadStudentForm },
    staff: { title: 'Staff', loader: loadStaff },
    'staff-add': { title: 'Add Staff', loader: loadStaffForm },
    performance: { title: 'Academic Performance', loader: loadPerformance },
    subjects: { title: 'Subjects', loader: loadSubjects },
};

let currentModule = '';

export function navigateTo(module) {
    const route = routes[module];
    if (!route) {
        console.warn('Unknown module:', module);
        return;
    }

    currentModule = module;

    // Update page title
    document.getElementById('page-title').textContent = route.title;
    document.title = `${route.title} | Al-Huda SIMS`;

    // Update active nav
    document.querySelectorAll('.nav-link[data-module]').forEach(link => {
        const parent = link.closest('.nav-item');
        if (parent) parent.classList.remove('active');
        if (link.dataset.module === module) {
            if (parent) parent.classList.add('active');
            // Open parent accordion if in submenu
            const submenuParent = link.closest('.has-submenu');
            if (submenuParent) submenuParent.classList.add('open');
        }
    });

    // Show skeleton loader
    const mainContent = document.getElementById('main-content');
    showSkeleton(mainContent, module);

    // Load module content
    route.loader(mainContent);

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('open');
        document.querySelector('.sidebar-overlay')?.classList.remove('active');
    }
}

// =============================================
// Authentication
// =============================================
function showLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('app-shell').classList.add('hidden');
    window.SIMS.user = null;
}

function showApp(user) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
    window.SIMS.user = user;

    // Update user info in sidebar
    document.getElementById('sidebar-user-name').textContent = user.full_name || user.username;
    document.getElementById('sidebar-user-role').textContent = user.role;
    document.getElementById('topbar-user-name').textContent = user.full_name || user.username;

    // Navigate to dashboard
    navigateTo('dashboard');
}

async function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    const errorEl = document.getElementById('login-error');

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        errorEl.textContent = 'Please enter both username and password.';
        errorEl.classList.remove('hidden');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Signing in...';
    errorEl.classList.add('hidden');

    try {
        const result = await api.post('/auth/login', { username, password });
        if (result.data?.csrf_token) {
            window.SIMS.csrfToken = result.data.csrf_token;
        }
        showToast('Welcome back, ' + result.data.user.full_name + '!');
        showApp(result.data.user);
    } catch (error) {
        errorEl.textContent = error.message || 'Login failed. Please try again.';
        errorEl.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bx bx-log-in"></i> Sign In';
    }
}

async function handleLogout() {
    try {
        await api.post('/auth/logout', {});
    } catch {
        // Ignore errors
    }
    showLogin();
    showToast('You have been logged out.', 'info');
}

// =============================================
// Initialization
// =============================================
document.addEventListener('DOMContentLoaded', async () => {
    // Init sidebar accordion + toggle
    initSidebar();

    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);

    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // Modal close
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });

    // Navigation links
    document.querySelectorAll('.nav-link[data-module]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.dataset.module);
        });
    });

    // Hash-based routing
    function handleHash() {
        const hash = window.location.hash.replace('#', '').replace('/', '-') || 'dashboard';
        const module = hash.split('?')[0];
        if (routes[module] && window.SIMS.user) {
            navigateTo(module);
        }
    }
    window.addEventListener('hashchange', handleHash);

    // Check session on load
    if (window.SIMS.user) {
        showApp(window.SIMS.user);
    } else {
        try {
            const session = await api.get('/auth/session');
            if (session.authenticated) {
                window.SIMS.csrfToken = session.csrf_token;
                showApp(session.user);
            }
        } catch {
            // Not authenticated, show login
        }
    }
});

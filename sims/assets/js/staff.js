/**
 * Al-Huda SIMS - Staff Module
 */

import { api, showToast, showModal, closeModal, escapeHtml, formatDate, getStatusBadge, buildPagination, bindPagination, navigateTo } from './app.js';

let currentFilters = { page: 1, search: '', status: '', department: '' };

export async function loadStaff(container) {
    try {
        const params = new URLSearchParams({
            page: currentFilters.page,
            per_page: 20,
            search: currentFilters.search,
            status: currentFilters.status,
            department: currentFilters.department,
        });

        const result = await api.get(`/staff?${params}`);
        renderStaffList(container, result);
    } catch (error) {
        container.innerHTML = `<div class="empty-state"><i class='bx bx-error-circle'></i><h4>Failed to load staff</h4><p>${error.message || ''}</p></div>`;
    }
}

function renderStaffList(container, result) {
    const { data, total, page, per_page, total_pages } = result;

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3><i class='bx bxs-briefcase'></i> Staff Directory</h3>
                <button class="btn btn-primary btn-sm" id="btn-add-staff">
                    <i class='bx bx-plus'></i> Add Staff
                </button>
            </div>

            <div class="table-toolbar">
                <div class="search-box">
                    <i class='bx bx-search'></i>
                    <input type="text" id="staff-search" placeholder="Search staff..."
                           value="${escapeHtml(currentFilters.search)}">
                </div>
                <select class="filter-select" id="staff-status-filter">
                    <option value="">All Status</option>
                    <option value="Active" ${currentFilters.status === 'Active' ? 'selected' : ''}>Active</option>
                    <option value="Inactive" ${currentFilters.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                    <option value="On Leave" ${currentFilters.status === 'On Leave' ? 'selected' : ''}>On Leave</option>
                    <option value="Terminated" ${currentFilters.status === 'Terminated' ? 'selected' : ''}>Terminated</option>
                </select>
                <select class="filter-select" id="staff-dept-filter">
                    <option value="">All Departments</option>
                </select>
            </div>

            <div class="card-body-flush">
                <div class="data-table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Staff ID</th>
                                <th>Name</th>
                                <th>Department</th>
                                <th>Position</th>
                                <th>Gender</th>
                                <th>Status</th>
                                <th>Hired</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.length === 0 ? `
                                <tr><td colspan="8" class="text-center" style="padding:3rem">
                                    <div class="empty-state" style="padding:1rem">
                                        <i class='bx bx-user-x'></i>
                                        <h4>No staff found</h4>
                                    </div>
                                </td></tr>
                            ` : data.map(s => `
                                <tr>
                                    <td><strong>${escapeHtml(s.staff_id)}</strong></td>
                                    <td>${escapeHtml(s.first_name)} ${escapeHtml(s.last_name)}</td>
                                    <td>${escapeHtml(s.department)}</td>
                                    <td>${escapeHtml(s.position)}</td>
                                    <td>${escapeHtml(s.gender)}</td>
                                    <td>${getStatusBadge(s.status)}</td>
                                    <td>${formatDate(s.hire_date)}</td>
                                    <td>
                                        <div class="btn-group-actions">
                                            <button class="btn btn-sm btn-outline-primary btn-view-staff" data-id="${s.id}" title="View">
                                                <i class='bx bx-show'></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-primary btn-edit-staff" data-id="${s.id}" title="Edit">
                                                <i class='bx bx-edit'></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger btn-delete-staff" data-id="${s.id}" title="Delete">
                                                <i class='bx bx-trash'></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            ${total_pages > 1 ? buildPagination(result, () => {}) : ''}
        </div>`;

    bindStaffEvents(container);
    loadDeptFilter();
}

function bindStaffEvents(container) {
    let searchTimeout;
    const searchInput = container.querySelector('#staff-search');
    searchInput?.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentFilters.search = searchInput.value;
            currentFilters.page = 1;
            loadStaff(container);
        }, 400);
    });

    container.querySelector('#staff-status-filter')?.addEventListener('change', (e) => {
        currentFilters.status = e.target.value;
        currentFilters.page = 1;
        loadStaff(container);
    });

    container.querySelector('#staff-dept-filter')?.addEventListener('change', (e) => {
        currentFilters.department = e.target.value;
        currentFilters.page = 1;
        loadStaff(container);
    });

    bindPagination(container, (page) => {
        currentFilters.page = page;
        loadStaff(container);
    });

    container.querySelector('#btn-add-staff')?.addEventListener('click', () => {
        navigateTo('staff-add');
    });

    container.querySelectorAll('.btn-view-staff').forEach(btn => {
        btn.addEventListener('click', () => viewStaff(btn.dataset.id));
    });

    container.querySelectorAll('.btn-edit-staff').forEach(btn => {
        btn.addEventListener('click', () => editStaff(btn.dataset.id, container));
    });

    container.querySelectorAll('.btn-delete-staff').forEach(btn => {
        btn.addEventListener('click', () => deleteStaff(btn.dataset.id, container));
    });
}

async function loadDeptFilter() {
    try {
        const depts = await api.get('/staff/departments');
        const select = document.getElementById('staff-dept-filter');
        if (select) {
            depts.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.department;
                opt.textContent = d.department;
                if (d.department === currentFilters.department) opt.selected = true;
                select.appendChild(opt);
            });
        }
    } catch { /* ignore */ }
}

async function viewStaff(id) {
    try {
        const s = await api.get(`/staff/${id}`);
        showModal(`${s.first_name} ${s.last_name}`, `
            <div class="form-grid">
                <div class="form-group"><label>Staff ID</label><p><strong>${escapeHtml(s.staff_id)}</strong></p></div>
                <div class="form-group"><label>Status</label><p>${getStatusBadge(s.status)}</p></div>
                <div class="form-group"><label>Department</label><p>${escapeHtml(s.department)}</p></div>
                <div class="form-group"><label>Position</label><p>${escapeHtml(s.position)}</p></div>
                <div class="form-group"><label>Gender</label><p>${escapeHtml(s.gender)}</p></div>
                <div class="form-group"><label>Email</label><p>${escapeHtml(s.email || '—')}</p></div>
                <div class="form-group"><label>Phone</label><p>${escapeHtml(s.phone || '—')}</p></div>
                <div class="form-group"><label>Hire Date</label><p>${formatDate(s.hire_date)}</p></div>
            </div>
        `);
    } catch (error) {
        showToast(error.message || 'Failed to load staff', 'error');
    }
}

async function editStaff(id, container) {
    try {
        const s = await api.get(`/staff/${id}`);
        const mainContent = document.getElementById('main-content');
        renderStaffForm(mainContent, s);
    } catch (error) {
        showToast(error.message || 'Failed to load staff', 'error');
    }
}

async function deleteStaff(id, container) {
    showModal('Delete Staff Member', `
        <p>Are you sure you want to delete this staff member? This action cannot be undone.</p>
    `, `
        <button class="btn btn-outline-primary" onclick="document.getElementById('modal-overlay').classList.add('hidden')">Cancel</button>
        <button class="btn btn-danger" id="confirm-delete-staff">Delete</button>
    `);

    document.getElementById('confirm-delete-staff')?.addEventListener('click', async () => {
        try {
            await api.delete(`/staff/${id}`);
            closeModal();
            showToast('Staff member deleted successfully.');
            loadStaff(container);
        } catch (error) {
            showToast(error.message || 'Failed to delete staff', 'error');
        }
    });
}

// =============================================
// Staff Form (Add/Edit)
// =============================================
export async function loadStaffForm(container) {
    renderStaffForm(container, null);
}

function renderStaffForm(container, staff = null) {
    const isEdit = staff !== null;
    const title = isEdit ? 'Edit Staff Member' : 'Add New Staff Member';

    document.getElementById('page-title').textContent = title;

    const departments = ['Islamic Studies', 'Languages', 'Computer Science', 'Mathematics', 'Education', 'Business', 'Administration'];
    const positions = ['Department Head', 'Senior Lecturer', 'Lecturer', 'Assistant Lecturer', 'Lab Technician', 'Registrar', 'IT Support', 'Secretary'];

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3><i class='bx ${isEdit ? 'bx-edit' : 'bx-user-plus'}'></i> ${title}</h3>
                <button class="btn btn-outline-primary btn-sm" id="btn-back-staff">
                    <i class='bx bx-arrow-back'></i> Back to List
                </button>
            </div>
            <div class="card-body">
                <form id="staff-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="stf-staff-id">Staff ID *</label>
                            <input type="text" id="stf-staff-id" class="form-control" value="${escapeHtml(staff?.staff_id || '')}"
                                   ${isEdit ? 'readonly' : ''} required placeholder="Auto-generated">
                        </div>
                        <div class="form-group">
                            <label for="stf-first-name">First Name *</label>
                            <input type="text" id="stf-first-name" class="form-control" value="${escapeHtml(staff?.first_name || '')}" required>
                        </div>
                        <div class="form-group">
                            <label for="stf-last-name">Last Name *</label>
                            <input type="text" id="stf-last-name" class="form-control" value="${escapeHtml(staff?.last_name || '')}" required>
                        </div>
                        <div class="form-group">
                            <label for="stf-email">Email</label>
                            <input type="email" id="stf-email" class="form-control" value="${escapeHtml(staff?.email || '')}">
                        </div>
                        <div class="form-group">
                            <label for="stf-phone">Phone</label>
                            <input type="text" id="stf-phone" class="form-control" value="${escapeHtml(staff?.phone || '')}">
                        </div>
                        <div class="form-group">
                            <label for="stf-gender">Gender *</label>
                            <select id="stf-gender" class="form-control" required>
                                <option value="">Select Gender</option>
                                <option value="Male" ${staff?.gender === 'Male' ? 'selected' : ''}>Male</option>
                                <option value="Female" ${staff?.gender === 'Female' ? 'selected' : ''}>Female</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="stf-department">Department *</label>
                            <select id="stf-department" class="form-control" required>
                                <option value="">Select Department</option>
                                ${departments.map(d => `<option value="${d}" ${staff?.department === d ? 'selected' : ''}>${d}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="stf-position">Position *</label>
                            <select id="stf-position" class="form-control" required>
                                <option value="">Select Position</option>
                                ${positions.map(p => `<option value="${p}" ${staff?.position === p ? 'selected' : ''}>${p}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="stf-hire-date">Hire Date *</label>
                            <input type="date" id="stf-hire-date" class="form-control"
                                   value="${staff?.hire_date || new Date().toISOString().split('T')[0]}" required>
                        </div>
                        <div class="form-group">
                            <label for="stf-status">Status</label>
                            <select id="stf-status" class="form-control">
                                ${['Active','Inactive','On Leave','Terminated'].map(s =>
                                    `<option value="${s}" ${staff?.status === s ? 'selected' : ''}>${s}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline-primary" id="btn-cancel-staff">Cancel</button>
                        <button type="submit" class="btn btn-primary" id="btn-save-staff">
                            <i class='bx bx-save'></i> ${isEdit ? 'Update' : 'Create'} Staff
                        </button>
                    </div>
                </form>
            </div>
        </div>`;

    if (!isEdit) {
        api.get('/staff/next-id').then(res => {
            const el = document.getElementById('stf-staff-id');
            if (el && !el.value) el.value = res.staff_id;
        }).catch(() => {});
    }

    container.querySelector('#btn-back-staff')?.addEventListener('click', () => navigateTo('staff'));
    container.querySelector('#btn-cancel-staff')?.addEventListener('click', () => navigateTo('staff'));

    container.querySelector('#staff-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-staff');
        btn.disabled = true;
        btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Saving...';

        const formData = {
            staff_id: document.getElementById('stf-staff-id').value,
            first_name: document.getElementById('stf-first-name').value,
            last_name: document.getElementById('stf-last-name').value,
            email: document.getElementById('stf-email').value,
            phone: document.getElementById('stf-phone').value,
            gender: document.getElementById('stf-gender').value,
            department: document.getElementById('stf-department').value,
            position: document.getElementById('stf-position').value,
            hire_date: document.getElementById('stf-hire-date').value,
            status: document.getElementById('stf-status').value,
        };

        try {
            if (isEdit) {
                await api.put(`/staff/${staff.id}`, formData);
                showToast('Staff member updated successfully.');
            } else {
                await api.post('/staff', formData);
                showToast('Staff member created successfully.');
            }
            currentFilters = { page: 1, search: '', status: '', department: '' };
            navigateTo('staff');
        } catch (error) {
            showToast(error.message || 'Failed to save staff', 'error');
            btn.disabled = false;
            btn.innerHTML = `<i class='bx bx-save'></i> ${isEdit ? 'Update' : 'Create'} Staff`;
        }
    });
}

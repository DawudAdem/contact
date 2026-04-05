/**
 * Al-Huda SIMS - Students Module
 */

import { api, showToast, showModal, closeModal, escapeHtml, formatDate, getStatusBadge, buildPagination, bindPagination, navigateTo } from './app.js';

let currentFilters = { page: 1, search: '', status: '', program: '' };

export async function loadStudents(container) {
    try {
        const params = new URLSearchParams({
            page: currentFilters.page,
            per_page: 20,
            search: currentFilters.search,
            status: currentFilters.status,
            program: currentFilters.program,
        });

        const result = await api.get(`/students?${params}`);
        renderStudentsList(container, result);
    } catch (error) {
        container.innerHTML = `<div class="empty-state"><i class='bx bx-error-circle'></i><h4>Failed to load students</h4><p>${error.message || ''}</p></div>`;
    }
}

function renderStudentsList(container, result) {
    const { data, total, page, per_page, total_pages } = result;

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3><i class='bx bxs-user-detail'></i> Students Registry</h3>
                <button class="btn btn-primary btn-sm" id="btn-add-student">
                    <i class='bx bx-plus'></i> Add Student
                </button>
            </div>

            <div class="table-toolbar">
                <div class="search-box">
                    <i class='bx bx-search'></i>
                    <input type="text" id="student-search" placeholder="Search students..."
                           value="${escapeHtml(currentFilters.search)}">
                </div>
                <select class="filter-select" id="student-status-filter">
                    <option value="">All Status</option>
                    <option value="Active" ${currentFilters.status === 'Active' ? 'selected' : ''}>Active</option>
                    <option value="Inactive" ${currentFilters.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                    <option value="Graduated" ${currentFilters.status === 'Graduated' ? 'selected' : ''}>Graduated</option>
                    <option value="Suspended" ${currentFilters.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
                    <option value="Withdrawn" ${currentFilters.status === 'Withdrawn' ? 'selected' : ''}>Withdrawn</option>
                </select>
                <select class="filter-select" id="student-program-filter">
                    <option value="">All Programs</option>
                </select>
            </div>

            <div class="card-body-flush">
                <div class="data-table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Name</th>
                                <th>Program</th>
                                <th>Year</th>
                                <th>Gender</th>
                                <th>Status</th>
                                <th>Enrolled</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.length === 0 ? `
                                <tr><td colspan="8" class="text-center" style="padding:3rem">
                                    <div class="empty-state" style="padding:1rem">
                                        <i class='bx bx-user-x'></i>
                                        <h4>No students found</h4>
                                        <p>Try adjusting your search or filters</p>
                                    </div>
                                </td></tr>
                            ` : data.map(s => `
                                <tr>
                                    <td><strong>${escapeHtml(s.student_id)}</strong></td>
                                    <td>${escapeHtml(s.first_name)} ${escapeHtml(s.last_name)}</td>
                                    <td>${escapeHtml(s.program)}</td>
                                    <td>${s.year_level}</td>
                                    <td>${escapeHtml(s.gender)}</td>
                                    <td>${getStatusBadge(s.status)}</td>
                                    <td>${formatDate(s.enrollment_date)}</td>
                                    <td>
                                        <div class="btn-group-actions">
                                            <button class="btn btn-sm btn-outline-primary btn-view-student" data-id="${s.id}" title="View">
                                                <i class='bx bx-show'></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-primary btn-edit-student" data-id="${s.id}" title="Edit">
                                                <i class='bx bx-edit'></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger btn-delete-student" data-id="${s.id}" title="Delete">
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

    // Bind events
    bindStudentEvents(container);
    loadProgramFilter();
}

function bindStudentEvents(container) {
    // Search with debounce
    let searchTimeout;
    const searchInput = container.querySelector('#student-search');
    searchInput?.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentFilters.search = searchInput.value;
            currentFilters.page = 1;
            loadStudents(container);
        }, 400);
    });

    // Status filter
    container.querySelector('#student-status-filter')?.addEventListener('change', (e) => {
        currentFilters.status = e.target.value;
        currentFilters.page = 1;
        loadStudents(container);
    });

    // Program filter
    container.querySelector('#student-program-filter')?.addEventListener('change', (e) => {
        currentFilters.program = e.target.value;
        currentFilters.page = 1;
        loadStudents(container);
    });

    // Pagination
    bindPagination(container, (page) => {
        currentFilters.page = page;
        loadStudents(container);
    });

    // Add student
    container.querySelector('#btn-add-student')?.addEventListener('click', () => {
        navigateTo('students-add');
    });

    // View
    container.querySelectorAll('.btn-view-student').forEach(btn => {
        btn.addEventListener('click', () => viewStudent(btn.dataset.id));
    });

    // Edit
    container.querySelectorAll('.btn-edit-student').forEach(btn => {
        btn.addEventListener('click', () => editStudent(btn.dataset.id, container));
    });

    // Delete
    container.querySelectorAll('.btn-delete-student').forEach(btn => {
        btn.addEventListener('click', () => deleteStudent(btn.dataset.id, container));
    });
}

async function loadProgramFilter() {
    try {
        const programs = await api.get('/students/programs');
        const select = document.getElementById('student-program-filter');
        if (select) {
            programs.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.program;
                opt.textContent = p.program;
                if (p.program === currentFilters.program) opt.selected = true;
                select.appendChild(opt);
            });
        }
    } catch { /* ignore */ }
}

async function viewStudent(id) {
    try {
        const s = await api.get(`/students/${id}`);
        showModal(`${s.first_name} ${s.last_name}`, `
            <div class="form-grid">
                <div class="form-group"><label>Student ID</label><p><strong>${escapeHtml(s.student_id)}</strong></p></div>
                <div class="form-group"><label>Status</label><p>${getStatusBadge(s.status)}</p></div>
                <div class="form-group"><label>Program</label><p>${escapeHtml(s.program)}</p></div>
                <div class="form-group"><label>Year Level</label><p>${s.year_level}</p></div>
                <div class="form-group"><label>Gender</label><p>${escapeHtml(s.gender)}</p></div>
                <div class="form-group"><label>Date of Birth</label><p>${formatDate(s.date_of_birth)}</p></div>
                <div class="form-group"><label>Email</label><p>${escapeHtml(s.email || '—')}</p></div>
                <div class="form-group"><label>Phone</label><p>${escapeHtml(s.phone || '—')}</p></div>
                <div class="form-group"><label>Enrollment Date</label><p>${formatDate(s.enrollment_date)}</p></div>
                <div class="form-group"><label>Guardian</label><p>${escapeHtml(s.guardian_name || '—')}</p></div>
                <div class="form-group"><label>Guardian Phone</label><p>${escapeHtml(s.guardian_phone || '—')}</p></div>
                <div class="form-group"><label>Address</label><p>${escapeHtml(s.address || '—')}</p></div>
            </div>
        `);
    } catch (error) {
        showToast(error.message || 'Failed to load student', 'error');
    }
}

async function editStudent(id, container) {
    try {
        const s = await api.get(`/students/${id}`);
        const mainContent = document.getElementById('main-content');
        renderStudentForm(mainContent, s);
    } catch (error) {
        showToast(error.message || 'Failed to load student', 'error');
    }
}

async function deleteStudent(id, container) {
    showModal('Delete Student', `
        <p>Are you sure you want to delete this student? This action cannot be undone.</p>
    `, `
        <button class="btn btn-outline-primary" onclick="document.getElementById('modal-overlay').classList.add('hidden')">Cancel</button>
        <button class="btn btn-danger" id="confirm-delete-student">Delete</button>
    `);

    document.getElementById('confirm-delete-student')?.addEventListener('click', async () => {
        try {
            await api.delete(`/students/${id}`);
            closeModal();
            showToast('Student deleted successfully.');
            loadStudents(container);
        } catch (error) {
            showToast(error.message || 'Failed to delete student', 'error');
        }
    });
}

// =============================================
// Student Form (Add/Edit)
// =============================================
export async function loadStudentForm(container) {
    renderStudentForm(container, null);
}

function renderStudentForm(container, student = null) {
    const isEdit = student !== null;
    const title = isEdit ? 'Edit Student' : 'Add New Student';

    document.getElementById('page-title').textContent = title;

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3><i class='bx ${isEdit ? 'bx-edit' : 'bx-user-plus'}'></i> ${title}</h3>
                <button class="btn btn-outline-primary btn-sm" id="btn-back-students">
                    <i class='bx bx-arrow-back'></i> Back to List
                </button>
            </div>
            <div class="card-body">
                <form id="student-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="sf-student-id">Student ID *</label>
                            <input type="text" id="sf-student-id" class="form-control" value="${escapeHtml(student?.student_id || '')}"
                                   ${isEdit ? 'readonly' : ''} required placeholder="Auto-generated">
                        </div>
                        <div class="form-group">
                            <label for="sf-first-name">First Name *</label>
                            <input type="text" id="sf-first-name" class="form-control" value="${escapeHtml(student?.first_name || '')}" required>
                        </div>
                        <div class="form-group">
                            <label for="sf-last-name">Last Name *</label>
                            <input type="text" id="sf-last-name" class="form-control" value="${escapeHtml(student?.last_name || '')}" required>
                        </div>
                        <div class="form-group">
                            <label for="sf-email">Email</label>
                            <input type="email" id="sf-email" class="form-control" value="${escapeHtml(student?.email || '')}">
                        </div>
                        <div class="form-group">
                            <label for="sf-phone">Phone</label>
                            <input type="text" id="sf-phone" class="form-control" value="${escapeHtml(student?.phone || '')}">
                        </div>
                        <div class="form-group">
                            <label for="sf-gender">Gender *</label>
                            <select id="sf-gender" class="form-control" required>
                                <option value="">Select Gender</option>
                                <option value="Male" ${student?.gender === 'Male' ? 'selected' : ''}>Male</option>
                                <option value="Female" ${student?.gender === 'Female' ? 'selected' : ''}>Female</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="sf-dob">Date of Birth *</label>
                            <input type="date" id="sf-dob" class="form-control" value="${student?.date_of_birth || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="sf-enrollment">Enrollment Date *</label>
                            <input type="date" id="sf-enrollment" class="form-control"
                                   value="${student?.enrollment_date || new Date().toISOString().split('T')[0]}" required>
                        </div>
                        <div class="form-group">
                            <label for="sf-program">Program *</label>
                            <select id="sf-program" class="form-control" required>
                                <option value="">Select Program</option>
                                <option value="Islamic Studies" ${student?.program === 'Islamic Studies' ? 'selected' : ''}>Islamic Studies</option>
                                <option value="Arabic Language" ${student?.program === 'Arabic Language' ? 'selected' : ''}>Arabic Language</option>
                                <option value="Computer Science" ${student?.program === 'Computer Science' ? 'selected' : ''}>Computer Science</option>
                                <option value="Education" ${student?.program === 'Education' ? 'selected' : ''}>Education</option>
                                <option value="Business Administration" ${student?.program === 'Business Administration' ? 'selected' : ''}>Business Administration</option>
                                <option value="Mathematics" ${student?.program === 'Mathematics' ? 'selected' : ''}>Mathematics</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="sf-year">Year Level</label>
                            <select id="sf-year" class="form-control">
                                ${[1,2,3,4].map(y => `<option value="${y}" ${student?.year_level == y ? 'selected' : ''}>${y}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="sf-status">Status</label>
                            <select id="sf-status" class="form-control">
                                ${['Active','Inactive','Graduated','Suspended','Withdrawn'].map(s =>
                                    `<option value="${s}" ${student?.status === s ? 'selected' : ''}>${s}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="sf-guardian">Guardian Name</label>
                            <input type="text" id="sf-guardian" class="form-control" value="${escapeHtml(student?.guardian_name || '')}">
                        </div>
                        <div class="form-group">
                            <label for="sf-guardian-phone">Guardian Phone</label>
                            <input type="text" id="sf-guardian-phone" class="form-control" value="${escapeHtml(student?.guardian_phone || '')}">
                        </div>
                        <div class="form-group" style="grid-column: 1 / -1">
                            <label for="sf-address">Address</label>
                            <input type="text" id="sf-address" class="form-control" value="${escapeHtml(student?.address || '')}">
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline-primary" id="btn-cancel-student">Cancel</button>
                        <button type="submit" class="btn btn-primary" id="btn-save-student">
                            <i class='bx bx-save'></i> ${isEdit ? 'Update' : 'Create'} Student
                        </button>
                    </div>
                </form>
            </div>
        </div>`;

    // Auto-generate student ID for new students
    if (!isEdit) {
        api.get('/students/next-id').then(res => {
            const el = document.getElementById('sf-student-id');
            if (el && !el.value) el.value = res.student_id;
        }).catch(() => {});
    }

    // Back / Cancel
    container.querySelector('#btn-back-students')?.addEventListener('click', () => {
        navigateTo('students');
    });
    container.querySelector('#btn-cancel-student')?.addEventListener('click', () => {
        navigateTo('students');
    });

    // Submit
    container.querySelector('#student-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-student');
        btn.disabled = true;
        btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Saving...';

        const formData = {
            student_id: document.getElementById('sf-student-id').value,
            first_name: document.getElementById('sf-first-name').value,
            last_name: document.getElementById('sf-last-name').value,
            email: document.getElementById('sf-email').value,
            phone: document.getElementById('sf-phone').value,
            gender: document.getElementById('sf-gender').value,
            date_of_birth: document.getElementById('sf-dob').value,
            enrollment_date: document.getElementById('sf-enrollment').value,
            program: document.getElementById('sf-program').value,
            year_level: document.getElementById('sf-year').value,
            status: document.getElementById('sf-status').value,
            guardian_name: document.getElementById('sf-guardian').value,
            guardian_phone: document.getElementById('sf-guardian-phone').value,
            address: document.getElementById('sf-address').value,
        };

        try {
            if (isEdit) {
                await api.put(`/students/${student.id}`, formData);
                showToast('Student updated successfully.');
            } else {
                await api.post('/students', formData);
                showToast('Student created successfully.');
            }
            currentFilters = { page: 1, search: '', status: '', program: '' };
            navigateTo('students');
        } catch (error) {
            showToast(error.message || 'Failed to save student', 'error');
            btn.disabled = false;
            btn.innerHTML = `<i class='bx bx-save'></i> ${isEdit ? 'Update' : 'Create'} Student`;
        }
    });
}

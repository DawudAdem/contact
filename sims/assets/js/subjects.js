/**
 * Al-Huda SIMS - Subjects Module
 */

import { api, showToast, showModal, closeModal, escapeHtml, buildPagination, bindPagination } from './app.js';

let currentFilters = { page: 1, search: '', department: '' };

export async function loadSubjects(container) {
    try {
        const params = new URLSearchParams({
            page: currentFilters.page,
            per_page: 20,
            search: currentFilters.search,
            department: currentFilters.department,
        });

        const result = await api.get(`/subjects?${params}`);
        renderSubjects(container, result);
    } catch (error) {
        container.innerHTML = `<div class="empty-state"><i class='bx bx-error-circle'></i><h4>Failed to load subjects</h4></div>`;
    }
}

function renderSubjects(container, result) {
    const { data, total, page, per_page, total_pages } = result;

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3><i class='bx bxs-book'></i> Subjects</h3>
                <button class="btn btn-primary btn-sm" id="btn-add-subject">
                    <i class='bx bx-plus'></i> Add Subject
                </button>
            </div>

            <div class="table-toolbar">
                <div class="search-box">
                    <i class='bx bx-search'></i>
                    <input type="text" id="subject-search" placeholder="Search subjects..."
                           value="${escapeHtml(currentFilters.search)}">
                </div>
                <select class="filter-select" id="subject-dept-filter">
                    <option value="">All Departments</option>
                    <option value="Islamic Studies">Islamic Studies</option>
                    <option value="Languages">Languages</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Education">Education</option>
                    <option value="Business">Business</option>
                </select>
            </div>

            <div class="card-body-flush">
                <div class="data-table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Subject Name</th>
                                <th>Credit Hours</th>
                                <th>Department</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.length === 0 ? `
                                <tr><td colspan="5" class="text-center" style="padding:3rem">
                                    <div class="empty-state" style="padding:1rem">
                                        <i class='bx bx-book'></i>
                                        <h4>No subjects found</h4>
                                    </div>
                                </td></tr>
                            ` : data.map(s => `
                                <tr>
                                    <td><strong>${escapeHtml(s.subject_code)}</strong></td>
                                    <td>${escapeHtml(s.subject_name)}</td>
                                    <td>${s.credit_hours}</td>
                                    <td>${escapeHtml(s.department)}</td>
                                    <td>
                                        <div class="btn-group-actions">
                                            <button class="btn btn-sm btn-outline-primary btn-edit-subject" data-id="${s.id}" title="Edit">
                                                <i class='bx bx-edit'></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger btn-delete-subject" data-id="${s.id}" title="Delete">
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

    bindSubjectEvents(container);
}

function bindSubjectEvents(container) {
    let searchTimeout;
    const searchInput = container.querySelector('#subject-search');
    searchInput?.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentFilters.search = searchInput.value;
            currentFilters.page = 1;
            loadSubjects(container);
        }, 400);
    });

    container.querySelector('#subject-dept-filter')?.addEventListener('change', (e) => {
        currentFilters.department = e.target.value;
        currentFilters.page = 1;
        loadSubjects(container);
    });

    bindPagination(container, (page) => {
        currentFilters.page = page;
        loadSubjects(container);
    });

    container.querySelector('#btn-add-subject')?.addEventListener('click', () => showSubjectForm(container));

    container.querySelectorAll('.btn-edit-subject').forEach(btn => {
        btn.addEventListener('click', () => showEditSubjectForm(btn.dataset.id, container));
    });

    container.querySelectorAll('.btn-delete-subject').forEach(btn => {
        btn.addEventListener('click', () => deleteSubject(btn.dataset.id, container));
    });
}

function showSubjectForm(container) {
    showModal('Add Subject', `
        <form id="subject-form">
            <div class="form-group">
                <label>Subject Code *</label>
                <input type="text" id="subj-code" class="form-control" required placeholder="e.g. CS301">
            </div>
            <div class="form-group">
                <label>Subject Name *</label>
                <input type="text" id="subj-name" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Credit Hours</label>
                <input type="number" id="subj-credits" class="form-control" value="3" min="1" max="6">
            </div>
            <div class="form-group">
                <label>Department *</label>
                <select id="subj-dept" class="form-control" required>
                    <option value="">Select Department</option>
                    <option value="Islamic Studies">Islamic Studies</option>
                    <option value="Languages">Languages</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Education">Education</option>
                    <option value="Business">Business</option>
                </select>
            </div>
        </form>
    `, `
        <button class="btn btn-outline-primary" onclick="document.getElementById('modal-overlay').classList.add('hidden')">Cancel</button>
        <button class="btn btn-primary" id="btn-save-subject"><i class='bx bx-save'></i> Save</button>
    `);

    document.getElementById('btn-save-subject')?.addEventListener('click', async () => {
        const btn = document.getElementById('btn-save-subject');
        btn.disabled = true;

        try {
            await api.post('/subjects', {
                subject_code: document.getElementById('subj-code').value,
                subject_name: document.getElementById('subj-name').value,
                credit_hours: document.getElementById('subj-credits').value,
                department: document.getElementById('subj-dept').value,
            });
            closeModal();
            showToast('Subject created.');
            loadSubjects(container);
        } catch (error) {
            showToast(error.message || 'Failed to create subject', 'error');
            btn.disabled = false;
        }
    });
}

async function showEditSubjectForm(id, container) {
    try {
        const subject = await api.get(`/subjects/${id}`);
        showModal('Edit Subject', `
            <form id="subject-edit-form">
                <div class="form-group">
                    <label>Subject Code *</label>
                    <input type="text" id="sube-code" class="form-control" value="${escapeHtml(subject.subject_code)}" required>
                </div>
                <div class="form-group">
                    <label>Subject Name *</label>
                    <input type="text" id="sube-name" class="form-control" value="${escapeHtml(subject.subject_name)}" required>
                </div>
                <div class="form-group">
                    <label>Credit Hours</label>
                    <input type="number" id="sube-credits" class="form-control" value="${subject.credit_hours}" min="1" max="6">
                </div>
                <div class="form-group">
                    <label>Department *</label>
                    <select id="sube-dept" class="form-control" required>
                        ${['Islamic Studies','Languages','Computer Science','Mathematics','Education','Business']
                            .map(d => `<option value="${d}" ${subject.department === d ? 'selected' : ''}>${d}</option>`).join('')}
                    </select>
                </div>
            </form>
        `, `
            <button class="btn btn-outline-primary" onclick="document.getElementById('modal-overlay').classList.add('hidden')">Cancel</button>
            <button class="btn btn-primary" id="btn-update-subject"><i class='bx bx-save'></i> Update</button>
        `);

        document.getElementById('btn-update-subject')?.addEventListener('click', async () => {
            const btn = document.getElementById('btn-update-subject');
            btn.disabled = true;

            try {
                await api.put(`/subjects/${id}`, {
                    subject_code: document.getElementById('sube-code').value,
                    subject_name: document.getElementById('sube-name').value,
                    credit_hours: document.getElementById('sube-credits').value,
                    department: document.getElementById('sube-dept').value,
                });
                closeModal();
                showToast('Subject updated.');
                loadSubjects(container);
            } catch (error) {
                showToast(error.message || 'Failed to update', 'error');
                btn.disabled = false;
            }
        });
    } catch (error) {
        showToast('Failed to load subject', 'error');
    }
}

async function deleteSubject(id, container) {
    showModal('Delete Subject', `<p>Delete this subject? This cannot be undone.</p>`, `
        <button class="btn btn-outline-primary" onclick="document.getElementById('modal-overlay').classList.add('hidden')">Cancel</button>
        <button class="btn btn-danger" id="confirm-delete-subject">Delete</button>
    `);

    document.getElementById('confirm-delete-subject')?.addEventListener('click', async () => {
        try {
            await api.delete(`/subjects/${id}`);
            closeModal();
            showToast('Subject deleted.');
            loadSubjects(container);
        } catch (error) {
            showToast(error.message || 'Failed to delete', 'error');
        }
    });
}

/**
 * Al-Huda SIMS - Academic Performance Module
 */

import { api, showToast, showModal, closeModal, escapeHtml, formatDate, getStatusBadge, buildPagination, bindPagination } from './app.js';

let currentFilters = { page: 1, search: '', semester: '', academic_year: '' };

export async function loadPerformance(container) {
    try {
        const params = new URLSearchParams({
            page: currentFilters.page,
            per_page: 20,
            search: currentFilters.search,
            semester: currentFilters.semester,
            academic_year: currentFilters.academic_year,
        });

        const result = await api.get(`/performance?${params}`);
        renderPerformance(container, result);
    } catch (error) {
        container.innerHTML = `<div class="empty-state"><i class='bx bx-error-circle'></i><h4>Failed to load performance data</h4><p>${error.message || ''}</p></div>`;
    }
}

function renderPerformance(container, result) {
    const { data, total, page, per_page, total_pages } = result;

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3><i class='bx bxs-bar-chart-alt-2'></i> Academic Performance</h3>
                <button class="btn btn-primary btn-sm" id="btn-add-perf">
                    <i class='bx bx-plus'></i> Add Record
                </button>
            </div>

            <div class="table-toolbar">
                <div class="search-box">
                    <i class='bx bx-search'></i>
                    <input type="text" id="perf-search" placeholder="Search by student or subject..."
                           value="${escapeHtml(currentFilters.search)}">
                </div>
                <select class="filter-select" id="perf-semester-filter">
                    <option value="">All Semesters</option>
                    <option value="1" ${currentFilters.semester === '1' ? 'selected' : ''}>Semester 1</option>
                    <option value="2" ${currentFilters.semester === '2' ? 'selected' : ''}>Semester 2</option>
                    <option value="Summer" ${currentFilters.semester === 'Summer' ? 'selected' : ''}>Summer</option>
                </select>
                <select class="filter-select" id="perf-year-filter">
                    <option value="">All Years</option>
                </select>
            </div>

            <div class="card-body-flush">
                <div class="data-table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Student ID</th>
                                <th>Subject</th>
                                <th>Semester</th>
                                <th>Year</th>
                                <th>Score</th>
                                <th>Grade</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.length === 0 ? `
                                <tr><td colspan="8" class="text-center" style="padding:3rem">
                                    <div class="empty-state" style="padding:1rem">
                                        <i class='bx bx-bar-chart'></i>
                                        <h4>No performance records</h4>
                                    </div>
                                </td></tr>
                            ` : data.map(r => `
                                <tr>
                                    <td>${escapeHtml(r.first_name)} ${escapeHtml(r.last_name)}</td>
                                    <td><strong>${escapeHtml(r.student_code)}</strong></td>
                                    <td>${escapeHtml(r.subject_name)}</td>
                                    <td>${r.semester}</td>
                                    <td>${escapeHtml(r.academic_year)}</td>
                                    <td><strong>${r.score}</strong></td>
                                    <td>${getGradeBadge(r.grade)}</td>
                                    <td>
                                        <div class="btn-group-actions">
                                            <button class="btn btn-sm btn-outline-primary btn-edit-perf" data-id="${r.id}" title="Edit">
                                                <i class='bx bx-edit'></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger btn-delete-perf" data-id="${r.id}" title="Delete">
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

    bindPerfEvents(container);
    loadYearFilter();
}

function getGradeBadge(grade) {
    if (!grade) return '<span class="badge badge-inactive">—</span>';
    const colors = {
        'A+': 'active', 'A': 'active', 'B+': 'graduated', 'B': 'graduated',
        'C+': 'on-leave', 'C': 'on-leave', 'D': 'withdrawn', 'F': 'suspended',
    };
    return `<span class="badge badge-${colors[grade] || 'inactive'}">${grade}</span>`;
}

function bindPerfEvents(container) {
    let searchTimeout;
    const searchInput = container.querySelector('#perf-search');
    searchInput?.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentFilters.search = searchInput.value;
            currentFilters.page = 1;
            loadPerformance(container);
        }, 400);
    });

    container.querySelector('#perf-semester-filter')?.addEventListener('change', (e) => {
        currentFilters.semester = e.target.value;
        currentFilters.page = 1;
        loadPerformance(container);
    });

    container.querySelector('#perf-year-filter')?.addEventListener('change', (e) => {
        currentFilters.academic_year = e.target.value;
        currentFilters.page = 1;
        loadPerformance(container);
    });

    bindPagination(container, (page) => {
        currentFilters.page = page;
        loadPerformance(container);
    });

    container.querySelector('#btn-add-perf')?.addEventListener('click', () => showPerfForm(container));

    container.querySelectorAll('.btn-edit-perf').forEach(btn => {
        btn.addEventListener('click', () => showEditPerfForm(btn.dataset.id, container));
    });

    container.querySelectorAll('.btn-delete-perf').forEach(btn => {
        btn.addEventListener('click', () => deletePerfRecord(btn.dataset.id, container));
    });
}

async function loadYearFilter() {
    try {
        const years = await api.get('/performance/years');
        const select = document.getElementById('perf-year-filter');
        if (select) {
            years.forEach(y => {
                const opt = document.createElement('option');
                opt.value = y.academic_year;
                opt.textContent = y.academic_year;
                if (y.academic_year === currentFilters.academic_year) opt.selected = true;
                select.appendChild(opt);
            });
        }
    } catch { /* ignore */ }
}

async function showPerfForm(container) {
    try {
        const subjects = await api.get('/subjects/list');
        showModal('Add Performance Record', `
            <form id="perf-form">
                <div class="form-group">
                    <label>Student ID *</label>
                    <input type="number" id="pf-student-id" class="form-control" required placeholder="Enter student DB ID">
                </div>
                <div class="form-group">
                    <label>Subject *</label>
                    <select id="pf-subject" class="form-control" required>
                        <option value="">Select Subject</option>
                        ${subjects.map(s => `<option value="${s.id}">${s.subject_code} - ${s.subject_name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Semester *</label>
                    <select id="pf-semester" class="form-control" required>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                        <option value="Summer">Summer</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Academic Year *</label>
                    <input type="text" id="pf-year" class="form-control" value="2024-2025" required placeholder="e.g. 2024-2025">
                </div>
                <div class="form-group">
                    <label>Score (0-100) *</label>
                    <input type="number" id="pf-score" class="form-control" min="0" max="100" step="0.01" required>
                </div>
            </form>
        `, `
            <button class="btn btn-outline-primary" onclick="document.getElementById('modal-overlay').classList.add('hidden')">Cancel</button>
            <button class="btn btn-primary" id="btn-save-perf"><i class='bx bx-save'></i> Save</button>
        `);

        document.getElementById('btn-save-perf')?.addEventListener('click', async () => {
            const btn = document.getElementById('btn-save-perf');
            btn.disabled = true;

            try {
                await api.post('/performance', {
                    student_id: document.getElementById('pf-student-id').value,
                    subject_id: document.getElementById('pf-subject').value,
                    semester: document.getElementById('pf-semester').value,
                    academic_year: document.getElementById('pf-year').value,
                    score: document.getElementById('pf-score').value,
                });
                closeModal();
                showToast('Performance record created.');
                loadPerformance(container);
            } catch (error) {
                showToast(error.message || 'Failed to create record', 'error');
                btn.disabled = false;
            }
        });
    } catch (error) {
        showToast('Failed to load form: ' + (error.message || ''), 'error');
    }
}

async function showEditPerfForm(id, container) {
    try {
        const record = await api.get(`/performance/${id}`);
        showModal('Edit Performance Record', `
            <form id="perf-edit-form">
                <div class="form-group">
                    <label>Student</label>
                    <p><strong>${escapeHtml(record.first_name)} ${escapeHtml(record.last_name)} (${escapeHtml(record.student_code)})</strong></p>
                </div>
                <div class="form-group">
                    <label>Subject</label>
                    <p><strong>${escapeHtml(record.subject_name)}</strong></p>
                </div>
                <div class="form-group">
                    <label>Semester *</label>
                    <select id="pfe-semester" class="form-control" required>
                        <option value="1" ${record.semester === '1' ? 'selected' : ''}>Semester 1</option>
                        <option value="2" ${record.semester === '2' ? 'selected' : ''}>Semester 2</option>
                        <option value="Summer" ${record.semester === 'Summer' ? 'selected' : ''}>Summer</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Academic Year *</label>
                    <input type="text" id="pfe-year" class="form-control" value="${escapeHtml(record.academic_year)}" required>
                </div>
                <div class="form-group">
                    <label>Score (0-100) *</label>
                    <input type="number" id="pfe-score" class="form-control" min="0" max="100" step="0.01" value="${record.score}" required>
                </div>
            </form>
        `, `
            <button class="btn btn-outline-primary" onclick="document.getElementById('modal-overlay').classList.add('hidden')">Cancel</button>
            <button class="btn btn-primary" id="btn-update-perf"><i class='bx bx-save'></i> Update</button>
        `);

        document.getElementById('btn-update-perf')?.addEventListener('click', async () => {
            const btn = document.getElementById('btn-update-perf');
            btn.disabled = true;

            try {
                await api.put(`/performance/${id}`, {
                    semester: document.getElementById('pfe-semester').value,
                    academic_year: document.getElementById('pfe-year').value,
                    score: document.getElementById('pfe-score').value,
                });
                closeModal();
                showToast('Performance record updated.');
                loadPerformance(container);
            } catch (error) {
                showToast(error.message || 'Failed to update', 'error');
                btn.disabled = false;
            }
        });
    } catch (error) {
        showToast('Failed to load record', 'error');
    }
}

async function deletePerfRecord(id, container) {
    showModal('Delete Record', `<p>Delete this performance record? This action cannot be undone.</p>`, `
        <button class="btn btn-outline-primary" onclick="document.getElementById('modal-overlay').classList.add('hidden')">Cancel</button>
        <button class="btn btn-danger" id="confirm-delete-perf">Delete</button>
    `);

    document.getElementById('confirm-delete-perf')?.addEventListener('click', async () => {
        try {
            await api.delete(`/performance/${id}`);
            closeModal();
            showToast('Record deleted.');
            loadPerformance(container);
        } catch (error) {
            showToast(error.message || 'Failed to delete', 'error');
        }
    });
}

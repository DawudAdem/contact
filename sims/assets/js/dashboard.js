/**
 * Al-Huda SIMS - Dashboard Module with Chart.js Analytics
 */

import { api, showToast } from './app.js';

let charts = {};

export async function loadDashboard(container) {
    try {
        const stats = await api.get('/dashboard/stats');
        renderDashboard(container, stats);
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-error-circle'></i>
                <h4>Failed to load dashboard</h4>
                <p>${error.message || 'Please try again later.'}</p>
            </div>`;
    }
}

function renderDashboard(container, stats) {
    const s = stats.students;
    const st = stats.staff;

    container.innerHTML = `
        <!-- Stat Cards -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon green"><i class='bx bxs-user-detail'></i></div>
                <div class="stat-info">
                    <h3>${s.total}</h3>
                    <p>Total Students</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon blue"><i class='bx bxs-user-check'></i></div>
                <div class="stat-info">
                    <h3>${s.active}</h3>
                    <p>Active Students</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange"><i class='bx bxs-briefcase'></i></div>
                <div class="stat-info">
                    <h3>${st.total}</h3>
                    <p>Total Staff</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon red"><i class='bx bxs-graduation'></i></div>
                <div class="stat-info">
                    <h3>${s.by_status.find(x => x.status === 'Graduated')?.count || 0}</h3>
                    <p>Graduated</p>
                </div>
            </div>
        </div>

        <!-- Charts -->
        <div class="charts-grid">
            <div class="chart-card">
                <h4><i class='bx bx-line-chart'></i> Enrollment Trend</h4>
                <div class="chart-container"><canvas id="chart-enrollment"></canvas></div>
            </div>
            <div class="chart-card">
                <h4><i class='bx bx-pie-chart'></i> Students by Program</h4>
                <div class="chart-container"><canvas id="chart-programs"></canvas></div>
            </div>
            <div class="chart-card">
                <h4><i class='bx bx-bar-chart'></i> Grade Distribution</h4>
                <div class="chart-container"><canvas id="chart-grades"></canvas></div>
            </div>
            <div class="chart-card">
                <h4><i class='bx bx-doughnut-chart'></i> Gender Ratio</h4>
                <div class="chart-container"><canvas id="chart-gender"></canvas></div>
            </div>
        </div>

        <!-- Recent Stats Tables -->
        <div class="charts-grid">
            <div class="chart-card">
                <h4><i class='bx bx-book-reader'></i> Average Score by Subject</h4>
                <div class="data-table-wrapper">
                    <table class="data-table">
                        <thead><tr><th>Subject</th><th>Avg Score</th><th>Records</th></tr></thead>
                        <tbody>
                            ${stats.avg_by_subject.map(s => `
                                <tr>
                                    <td>${s.subject_name}</td>
                                    <td><strong>${s.avg_score}</strong></td>
                                    <td>${s.total}</td>
                                </tr>
                            `).join('')}
                            ${stats.avg_by_subject.length === 0 ? '<tr><td colspan="3" class="text-center text-muted">No data available</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="chart-card">
                <h4><i class='bx bx-group'></i> Staff by Department</h4>
                <div class="data-table-wrapper">
                    <table class="data-table">
                        <thead><tr><th>Department</th><th>Count</th></tr></thead>
                        <tbody>
                            ${st.by_department.map(d => `
                                <tr><td>${d.department}</td><td><strong>${d.count}</strong></td></tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;

    // Render charts
    setTimeout(() => {
        renderCharts(stats);
    }, 100);
}

function renderCharts(stats) {
    // Destroy existing charts
    Object.values(charts).forEach(c => c.destroy());
    charts = {};

    const chartColors = [
        '#0d6e3f', '#1a237e', '#ff6f00', '#d32f2f', '#0277bd',
        '#2e7d32', '#6a1b9a', '#00838f', '#ef6c00', '#4e342e',
    ];

    // 1. Enrollment Trend (Line)
    const enrollCtx = document.getElementById('chart-enrollment');
    if (enrollCtx && stats.students.enrollment_trend.length > 0) {
        charts.enrollment = new Chart(enrollCtx, {
            type: 'line',
            data: {
                labels: stats.students.enrollment_trend.map(t => t.month),
                datasets: [{
                    label: 'New Enrollments',
                    data: stats.students.enrollment_trend.map(t => t.count),
                    borderColor: '#0d6e3f',
                    backgroundColor: 'rgba(13, 110, 63, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#0d6e3f',
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 } },
                    x: { ticks: { maxRotation: 45 } },
                },
            },
        });
    }

    // 2. Students by Program (Doughnut)
    const progCtx = document.getElementById('chart-programs');
    if (progCtx && stats.students.by_program.length > 0) {
        charts.programs = new Chart(progCtx, {
            type: 'doughnut',
            data: {
                labels: stats.students.by_program.map(p => p.program),
                datasets: [{
                    data: stats.students.by_program.map(p => p.count),
                    backgroundColor: chartColors,
                    borderWidth: 2,
                    borderColor: '#fff',
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 12, font: { size: 11 } },
                    },
                },
            },
        });
    }

    // 3. Grade Distribution (Bar)
    const gradeCtx = document.getElementById('chart-grades');
    if (gradeCtx && stats.grade_distribution.length > 0) {
        const gradeOrder = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];
        const gradeColors = {
            'A+': '#1b5e20', 'A': '#2e7d32', 'B+': '#388e3c', 'B': '#43a047',
            'C+': '#ff8f00', 'C': '#ff6f00', 'D': '#e65100', 'F': '#d32f2f',
        };
        const sorted = gradeOrder.filter(g => stats.grade_distribution.find(d => d.grade === g));

        charts.grades = new Chart(gradeCtx, {
            type: 'bar',
            data: {
                labels: sorted,
                datasets: [{
                    label: 'Students',
                    data: sorted.map(g => {
                        const found = stats.grade_distribution.find(d => d.grade === g);
                        return found ? found.count : 0;
                    }),
                    backgroundColor: sorted.map(g => gradeColors[g] || '#888'),
                    borderRadius: 6,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 } },
                },
            },
        });
    }

    // 4. Gender Ratio (Pie)
    const genderCtx = document.getElementById('chart-gender');
    if (genderCtx && stats.students.by_gender.length > 0) {
        charts.gender = new Chart(genderCtx, {
            type: 'pie',
            data: {
                labels: stats.students.by_gender.map(g => g.gender),
                datasets: [{
                    data: stats.students.by_gender.map(g => g.count),
                    backgroundColor: ['#1a237e', '#e91e63'],
                    borderWidth: 2,
                    borderColor: '#fff',
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 12, font: { size: 12 } },
                    },
                },
            },
        });
    }
}

/**
 * Al-Huda SIMS - Skeleton Loader Utilities
 */

/**
 * Show a skeleton loader appropriate for the given module.
 */
export function showSkeleton(container, module) {
    const skeletons = {
        dashboard: getDashboardSkeleton(),
        students: getTableSkeleton(),
        'students-add': getFormSkeleton(),
        staff: getTableSkeleton(),
        'staff-add': getFormSkeleton(),
        performance: getTableSkeleton(),
        subjects: getTableSkeleton(),
    };

    container.innerHTML = skeletons[module] || getTableSkeleton();
}

function getDashboardSkeleton() {
    return `
        <div class="skeleton-dashboard">
            <div class="skeleton-stats-grid">
                ${repeat(4, `
                    <div class="skeleton-stat-card">
                        <div class="skeleton skeleton-stat-icon"></div>
                        <div class="skeleton-stat-text">
                            <div class="skeleton skeleton-text"></div>
                            <div class="skeleton skeleton-text"></div>
                        </div>
                    </div>
                `)}
            </div>
            <div class="skeleton-charts-grid">
                ${repeat(4, `
                    <div class="skeleton-chart-card">
                        <div class="skeleton skeleton-title"></div>
                        <div class="skeleton skeleton-chart"></div>
                    </div>
                `)}
            </div>
        </div>`;
}

function getTableSkeleton() {
    return `
        <div class="skeleton-table-page">
            <div class="skeleton-toolbar">
                <div class="skeleton skeleton-search"></div>
                <div class="skeleton skeleton-filter"></div>
                <div class="skeleton skeleton-filter"></div>
            </div>
            ${repeat(8, `
                <div class="skeleton-table-row">
                    <div class="skeleton skeleton-text" style="width:8%"></div>
                    <div class="skeleton skeleton-text" style="width:18%"></div>
                    <div class="skeleton skeleton-text" style="width:18%"></div>
                    <div class="skeleton skeleton-text" style="width:15%"></div>
                    <div class="skeleton skeleton-text" style="width:12%"></div>
                    <div class="skeleton skeleton-text" style="width:10%"></div>
                    <div class="skeleton skeleton-text" style="width:10%"></div>
                </div>
            `)}
        </div>`;
}

function getFormSkeleton() {
    return `
        <div class="card">
            <div style="padding:2rem">
                <div class="skeleton skeleton-title" style="width:40%"></div>
                <div class="form-grid" style="margin-top:2rem">
                    ${repeat(6, `
                        <div class="form-group">
                            <div class="skeleton skeleton-text" style="width:30%;height:1.2rem"></div>
                            <div class="skeleton" style="height:4rem;margin-top:0.6rem;border-radius:8px"></div>
                        </div>
                    `)}
                </div>
                <div style="display:flex;justify-content:flex-end;gap:1rem;margin-top:2rem">
                    <div class="skeleton skeleton-btn"></div>
                    <div class="skeleton skeleton-btn"></div>
                </div>
            </div>
        </div>`;
}

function repeat(n, html) {
    return Array(n).fill(html).join('');
}

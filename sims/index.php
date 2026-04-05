<?php
/**
 * Al-Huda SIMS - Single Page Application Entry Point
 */
declare(strict_types=1);

require_once __DIR__ . '/core/Session.php';
require_once __DIR__ . '/core/CSRF.php';

Session::start();
$csrfToken = CSRF::getToken();
$isAuthenticated = Session::isAuthenticated();
$user = Session::getUser();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Al-Huda Student Information Management System">
    <meta name="theme-color" content="#0d6e3f">

    <title>Al-Huda SIMS</title>

    <!-- PWA Manifest -->
    <link rel="manifest" href="manifest.json">
    <link rel="apple-touch-icon" href="assets/icons/icon-192.png">

    <!-- Fonts & Icons -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">

    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

    <!-- App Styles -->
    <link rel="stylesheet" href="assets/css/app.css">
    <link rel="stylesheet" href="assets/css/skeleton.css">
</head>
<body>

    <!-- ========== LOGIN SCREEN ========== -->
    <div id="login-screen" class="login-screen <?= $isAuthenticated ? 'hidden' : '' ?>">
        <div class="login-container">
            <div class="login-header">
                <div class="login-logo">
                    <i class='bx bxs-graduation'></i>
                </div>
                <h1>Al-Huda <span>SIMS</span></h1>
                <p>Student Information Management System</p>
            </div>
            <form id="login-form" class="login-form" autocomplete="on">
                <div class="form-group">
                    <label for="login-username">
                        <i class='bx bx-user'></i> Username
                    </label>
                    <input type="text" id="login-username" name="username"
                           placeholder="Enter your username" required autocomplete="username">
                </div>
                <div class="form-group">
                    <label for="login-password">
                        <i class='bx bx-lock-alt'></i> Password
                    </label>
                    <input type="password" id="login-password" name="password"
                           placeholder="Enter your password" required autocomplete="current-password">
                </div>
                <div id="login-error" class="alert alert-danger hidden"></div>
                <button type="submit" class="btn btn-primary btn-block" id="login-btn">
                    <i class='bx bx-log-in'></i> Sign In
                </button>
                <p class="login-hint">Default: admin / Admin@123</p>
            </form>
        </div>
    </div>

    <!-- ========== APP SHELL ========== -->
    <div id="app-shell" class="app-shell <?= !$isAuthenticated ? 'hidden' : '' ?>">

        <!-- ---- SIDEBAR ---- -->
        <aside id="sidebar" class="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-brand">
                    <i class='bx bxs-graduation'></i>
                    <span class="brand-text">Al-Huda SIMS</span>
                </div>
                <button id="sidebar-close" class="sidebar-close" aria-label="Close sidebar">
                    <i class='bx bx-x'></i>
                </button>
            </div>

            <div class="sidebar-user">
                <div class="user-avatar">
                    <i class='bx bx-user-circle'></i>
                </div>
                <div class="user-info">
                    <span class="user-name" id="sidebar-user-name"><?= htmlspecialchars($user['full_name'] ?? 'User') ?></span>
                    <span class="user-role" id="sidebar-user-role"><?= htmlspecialchars($user['role'] ?? 'Role') ?></span>
                </div>
            </div>

            <nav class="sidebar-nav">
                <ul class="nav-list">
                    <!-- Dashboard -->
                    <li class="nav-item active">
                        <a href="#dashboard" class="nav-link" data-module="dashboard">
                            <i class='bx bxs-dashboard'></i>
                            <span>Dashboard</span>
                        </a>
                    </li>

                    <!-- Students Accordion -->
                    <li class="nav-item has-submenu">
                        <a href="#" class="nav-link accordion-toggle">
                            <i class='bx bxs-user-detail'></i>
                            <span>Students</span>
                            <i class='bx bx-chevron-down accordion-icon'></i>
                        </a>
                        <ul class="submenu">
                            <li><a href="#students" class="nav-link" data-module="students">
                                <i class='bx bx-list-ul'></i> All Students
                            </a></li>
                            <li><a href="#students/add" class="nav-link" data-module="students-add">
                                <i class='bx bx-user-plus'></i> Add Student
                            </a></li>
                        </ul>
                    </li>

                    <!-- Staff Accordion -->
                    <li class="nav-item has-submenu">
                        <a href="#" class="nav-link accordion-toggle">
                            <i class='bx bxs-briefcase'></i>
                            <span>Staff</span>
                            <i class='bx bx-chevron-down accordion-icon'></i>
                        </a>
                        <ul class="submenu">
                            <li><a href="#staff" class="nav-link" data-module="staff">
                                <i class='bx bx-list-ul'></i> All Staff
                            </a></li>
                            <li><a href="#staff/add" class="nav-link" data-module="staff-add">
                                <i class='bx bx-user-plus'></i> Add Staff
                            </a></li>
                        </ul>
                    </li>

                    <!-- Academics Accordion -->
                    <li class="nav-item has-submenu">
                        <a href="#" class="nav-link accordion-toggle">
                            <i class='bx bxs-book-reader'></i>
                            <span>Academics</span>
                            <i class='bx bx-chevron-down accordion-icon'></i>
                        </a>
                        <ul class="submenu">
                            <li><a href="#performance" class="nav-link" data-module="performance">
                                <i class='bx bx-bar-chart-alt-2'></i> Performance
                            </a></li>
                            <li><a href="#subjects" class="nav-link" data-module="subjects">
                                <i class='bx bx-book'></i> Subjects
                            </a></li>
                        </ul>
                    </li>
                </ul>
            </nav>

            <div class="sidebar-footer">
                <button id="logout-btn" class="btn btn-outline btn-block">
                    <i class='bx bx-log-out'></i>
                    <span>Logout</span>
                </button>
            </div>
        </aside>

        <!-- ---- MAIN CONTENT AREA ---- -->
        <main class="main-wrapper">
            <!-- Top Bar -->
            <header class="topbar">
                <button id="sidebar-toggle" class="sidebar-toggle" aria-label="Toggle sidebar">
                    <i class='bx bx-menu'></i>
                </button>
                <div class="topbar-title">
                    <h2 id="page-title">Dashboard</h2>
                </div>
                <div class="topbar-actions">
                    <span class="topbar-user" id="topbar-user-name"><?= htmlspecialchars($user['full_name'] ?? 'User') ?></span>
                </div>
            </header>

            <!-- Dynamic Content Container -->
            <div id="main-content" class="main-content">
                <!-- Content loaded via AJAX -->
            </div>
        </main>
    </div>

    <!-- ========== TOAST NOTIFICATION ========== -->
    <div id="toast-container" class="toast-container"></div>

    <!-- ========== MODAL ========== -->
    <div id="modal-overlay" class="modal-overlay hidden">
        <div class="modal" id="modal">
            <div class="modal-header">
                <h3 id="modal-title">Modal</h3>
                <button class="modal-close" id="modal-close" aria-label="Close modal">
                    <i class='bx bx-x'></i>
                </button>
            </div>
            <div class="modal-body" id="modal-body"></div>
            <div class="modal-footer" id="modal-footer"></div>
        </div>
    </div>

    <!-- CSRF Token (injected by PHP) -->
    <script>
        window.SIMS = {
            csrfToken: '<?= htmlspecialchars($csrfToken, ENT_QUOTES) ?>',
            apiBase: '/sims/api',
            user: <?= $isAuthenticated ? json_encode($user, JSON_HEX_TAG) : 'null' ?>,
        };
    </script>

    <!-- App Scripts -->
    <script src="assets/js/app.js" type="module"></script>

    <!-- Service Worker Registration -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sims/sw.js')
                    .then(reg => console.log('SW registered:', reg.scope))
                    .catch(err => console.warn('SW registration failed:', err));
            });
        }
    </script>
</body>
</html>

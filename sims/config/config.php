<?php
/**
 * Al-Huda SIMS - Application Configuration
 */

define('APP_NAME', 'Al-Huda SIMS');
define('APP_VERSION', '1.0.0');
define('APP_URL', '/sims');

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_PORT', 3306);
define('DB_NAME', 'alhuda_sims');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Session Configuration
define('SESSION_LIFETIME', 3600); // 1 hour
define('SESSION_NAME', 'ALHUDA_SIMS_SESSION');

// Pagination
define('DEFAULT_PAGE_SIZE', 20);
define('MAX_PAGE_SIZE', 100);

// Security
define('CSRF_TOKEN_NAME', '_csrf_token');
define('BCRYPT_COST', 12);

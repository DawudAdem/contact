<?php
/**
 * Al-Huda SIMS - Authentication API
 */

declare(strict_types=1);

require_once __DIR__ . '/../core/Router.php';
require_once __DIR__ . '/../core/Session.php';
require_once __DIR__ . '/../core/CSRF.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../models/User.php';

$router = new Router();

// POST /auth/login
$router->post('/auth/login', function () {
    $data = Router::getJsonBody();
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';

    if ($username === '' || $password === '') {
        Response::error('Username and password are required.', 422);
    }

    $userModel = new User();
    $user = $userModel->authenticate($username, $password);

    if ($user === null) {
        Response::error('Invalid username or password.', 401);
    }

    // Regenerate session to prevent fixation
    Session::regenerate();
    Session::set('user_id', $user['id']);
    Session::set('username', $user['username']);
    Session::set('full_name', $user['full_name']);
    Session::set('role', $user['role_name']);
    Session::set('role_id', $user['role_id']);
    Session::set('permissions', $user['permissions']);

    // Generate new CSRF token for authenticated session
    $csrfToken = CSRF::generate();

    Response::success('Login successful.', [
        'user' => [
            'id'       => $user['id'],
            'username' => $user['username'],
            'full_name'=> $user['full_name'],
            'role'     => $user['role_name'],
            'email'    => $user['email'],
        ],
        'csrf_token' => $csrfToken,
    ]);
});

// POST /auth/logout
$router->post('/auth/logout', function () {
    Session::destroy();
    Response::success('Logged out successfully.');
});

// GET /auth/session
$router->get('/auth/session', function () {
    if (!Session::isAuthenticated()) {
        Response::json([
            'authenticated' => false,
            'csrf_token'    => CSRF::getToken(),
        ]);
    }

    $user = Session::getUser();
    Response::json([
        'authenticated' => true,
        'user'          => $user,
        'csrf_token'    => CSRF::getToken(),
    ]);
});

$router->dispatch();

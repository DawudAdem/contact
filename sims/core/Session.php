<?php
/**
 * Al-Huda SIMS - Secure Session Management
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/config.php';

final class Session
{
    private static bool $started = false;

    /**
     * Start session with secure settings.
     */
    public static function start(): void
    {
        if (self::$started) {
            return;
        }

        if (session_status() === PHP_SESSION_ACTIVE) {
            self::$started = true;
            return;
        }

        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');
        ini_set('session.cookie_httponly', '1');
        ini_set('session.cookie_samesite', 'Strict');

        session_name(SESSION_NAME);
        session_set_cookie_params([
            'lifetime' => SESSION_LIFETIME,
            'path'     => '/',
            'secure'   => isset($_SERVER['HTTPS']),
            'httponly'  => true,
            'samesite'  => 'Strict',
        ]);

        session_start();
        self::$started = true;

        // Session fixation protection - regenerate if older than 30 min
        if (!isset($_SESSION['_created'])) {
            $_SESSION['_created'] = time();
        } elseif (time() - $_SESSION['_created'] > 1800) {
            session_regenerate_id(true);
            $_SESSION['_created'] = time();
        }
    }

    /**
     * Set a session value.
     */
    public static function set(string $key, mixed $value): void
    {
        self::start();
        $_SESSION[$key] = $value;
    }

    /**
     * Get a session value.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        self::start();
        return $_SESSION[$key] ?? $default;
    }

    /**
     * Check if a session key exists.
     */
    public static function has(string $key): bool
    {
        self::start();
        return isset($_SESSION[$key]);
    }

    /**
     * Remove a session key.
     */
    public static function remove(string $key): void
    {
        self::start();
        unset($_SESSION[$key]);
    }

    /**
     * Destroy the entire session.
     */
    public static function destroy(): void
    {
        self::start();
        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }

        session_destroy();
        self::$started = false;
    }

    /**
     * Regenerate session ID (e.g., after login).
     */
    public static function regenerate(): void
    {
        self::start();
        session_regenerate_id(true);
        $_SESSION['_created'] = time();
    }

    /**
     * Check if user is authenticated.
     */
    public static function isAuthenticated(): bool
    {
        return self::has('user_id') && self::has('role');
    }

    /**
     * Get authenticated user data.
     *
     * @return array{user_id: int, username: string, role: string, role_id: int, permissions: array}|null
     */
    public static function getUser(): ?array
    {
        if (!self::isAuthenticated()) {
            return null;
        }

        return [
            'user_id'     => self::get('user_id'),
            'username'    => self::get('username'),
            'full_name'   => self::get('full_name'),
            'role'        => self::get('role'),
            'role_id'     => self::get('role_id'),
            'permissions' => self::get('permissions', []),
        ];
    }
}

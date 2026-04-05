<?php
/**
 * Al-Huda SIMS - CSRF Token Protection
 */

declare(strict_types=1);

require_once __DIR__ . '/Session.php';

final class CSRF
{
    /**
     * Generate a new CSRF token and store in session.
     */
    public static function generate(): string
    {
        Session::start();
        $token = bin2hex(random_bytes(32));
        Session::set(CSRF_TOKEN_NAME, $token);
        return $token;
    }

    /**
     * Get existing token or generate a new one.
     */
    public static function getToken(): string
    {
        Session::start();
        $token = Session::get(CSRF_TOKEN_NAME);
        if ($token === null) {
            $token = self::generate();
        }
        return $token;
    }

    /**
     * Validate CSRF token from request.
     * Checks both header (X-CSRF-Token) and POST body (_csrf_token).
     */
    public static function validate(): bool
    {
        Session::start();
        $sessionToken = Session::get(CSRF_TOKEN_NAME);

        if ($sessionToken === null) {
            return false;
        }

        // Check header first (for AJAX requests)
        $headerToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
        if ($headerToken !== null && hash_equals($sessionToken, $headerToken)) {
            return true;
        }

        // Check POST body
        $bodyToken = $_POST[CSRF_TOKEN_NAME] ?? null;
        if ($bodyToken !== null && hash_equals($sessionToken, $bodyToken)) {
            return true;
        }

        // Check JSON body
        $input = json_decode(file_get_contents('php://input'), true);
        $jsonToken = $input[CSRF_TOKEN_NAME] ?? null;
        if ($jsonToken !== null && hash_equals($sessionToken, $jsonToken)) {
            return true;
        }

        return false;
    }

    /**
     * Enforce CSRF on state-changing requests.
     * Skips validation for GET/HEAD/OPTIONS.
     */
    public static function enforce(): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        if (in_array($method, ['GET', 'HEAD', 'OPTIONS'], true)) {
            return;
        }

        if (!self::validate()) {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode(['error' => true, 'message' => 'Invalid or missing CSRF token.']);
            exit;
        }
    }

    /**
     * Output a hidden input field with the CSRF token (for HTML forms).
     */
    public static function field(): string
    {
        $token = self::getToken();
        return '<input type="hidden" name="' . CSRF_TOKEN_NAME . '" value="' . htmlspecialchars($token, ENT_QUOTES, 'UTF-8') . '">';
    }
}

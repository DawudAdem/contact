<?php
/**
 * Al-Huda SIMS - JSON Response Helper
 */

declare(strict_types=1);

final class Response
{
    /**
     * Send a JSON success response.
     *
     * @param mixed $data Response payload
     * @param int $code HTTP status code
     */
    public static function json(mixed $data, int $code = 200): never
    {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        exit;
    }

    /**
     * Send a JSON error response.
     */
    public static function error(string $message, int $code = 400, array $errors = []): never
    {
        $payload = ['error' => true, 'message' => $message];
        if (!empty($errors)) {
            $payload['errors'] = $errors;
        }
        self::json($payload, $code);
    }

    /**
     * Send a success response with a message.
     */
    public static function success(string $message, mixed $data = null, int $code = 200): never
    {
        $payload = ['success' => true, 'message' => $message];
        if ($data !== null) {
            $payload['data'] = $data;
        }
        self::json($payload, $code);
    }
}

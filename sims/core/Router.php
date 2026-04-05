<?php
/**
 * Al-Huda SIMS - Simple API Router
 */

declare(strict_types=1);

require_once __DIR__ . '/Response.php';

final class Router
{
    /** @var array<string, array<string, callable>> */
    private array $routes = [];

    /**
     * Register a GET route.
     */
    public function get(string $path, callable $handler): self
    {
        $this->routes['GET'][$path] = $handler;
        return $this;
    }

    /**
     * Register a POST route.
     */
    public function post(string $path, callable $handler): self
    {
        $this->routes['POST'][$path] = $handler;
        return $this;
    }

    /**
     * Register a PUT route.
     */
    public function put(string $path, callable $handler): self
    {
        $this->routes['PUT'][$path] = $handler;
        return $this;
    }

    /**
     * Register a DELETE route.
     */
    public function delete(string $path, callable $handler): self
    {
        $this->routes['DELETE'][$path] = $handler;
        return $this;
    }

    /**
     * Dispatch the current request.
     */
    public function dispatch(): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $uri = $_SERVER['REQUEST_URI'] ?? '/';

        // Strip query string
        $path = parse_url($uri, PHP_URL_PATH);

        // Remove base path prefix (/sims/api)
        $basePath = '/sims/api';
        if (str_starts_with($path, $basePath)) {
            $path = substr($path, strlen($basePath));
        }

        // Normalize
        $path = '/' . trim($path, '/');
        if ($path === '/') {
            $path = '/';
        }

        // Handle OPTIONS for CORS preflight
        if ($method === 'OPTIONS') {
            http_response_code(204);
            exit;
        }

        // Match route with dynamic segments
        if (isset($this->routes[$method])) {
            foreach ($this->routes[$method] as $routePath => $handler) {
                $params = $this->matchRoute($routePath, $path);
                if ($params !== false) {
                    $handler($params);
                    return;
                }
            }
        }

        Response::error('Route not found: ' . $method . ' ' . $path, 404);
    }

    /**
     * Match a route pattern against a path.
     * Supports {param} style placeholders.
     *
     * @return array<string, string>|false
     */
    private function matchRoute(string $pattern, string $path): array|false
    {
        // Exact match
        if ($pattern === $path) {
            return [];
        }

        // Pattern with parameters
        $patternParts = explode('/', trim($pattern, '/'));
        $pathParts = explode('/', trim($path, '/'));

        if (count($patternParts) !== count($pathParts)) {
            return false;
        }

        $params = [];
        foreach ($patternParts as $i => $part) {
            if (str_starts_with($part, '{') && str_ends_with($part, '}')) {
                $paramName = trim($part, '{}');
                $params[$paramName] = $pathParts[$i];
            } elseif ($part !== $pathParts[$i]) {
                return false;
            }
        }

        return $params;
    }

    /**
     * Get JSON request body as an associative array.
     *
     * @return array<string, mixed>
     */
    public static function getJsonBody(): array
    {
        $input = file_get_contents('php://input');
        if (empty($input)) {
            return $_POST;
        }
        $data = json_decode($input, true);
        return is_array($data) ? $data : [];
    }

    /**
     * Get a query parameter with optional default.
     */
    public static function getQueryParam(string $key, mixed $default = null): mixed
    {
        return $_GET[$key] ?? $default;
    }
}

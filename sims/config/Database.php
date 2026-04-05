<?php
/**
 * Al-Huda SIMS - Secure Database Singleton
 * 
 * Thread-safe singleton pattern with PDO.
 * Uses prepared statements exclusively to prevent SQL injection.
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

final class Database
{
    private static ?Database $instance = null;
    private PDO $pdo;

    /**
     * Private constructor - prevents direct instantiation.
     * Configures PDO with secure defaults.
     */
    private function __construct()
    {
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            DB_HOST,
            DB_PORT,
            DB_NAME,
            DB_CHARSET
        );

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_STRINGIFY_FETCHES  => false,
            PDO::MYSQL_ATTR_FOUND_ROWS   => true,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'",
        ];

        try {
            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log('Database connection failed: ' . $e->getMessage());
            throw new RuntimeException('Database connection failed. Please try again later.');
        }
    }

    /** Prevent cloning */
    private function __clone(): void {}

    /** Prevent unserialization */
    public function __wakeup(): void
    {
        throw new RuntimeException('Cannot unserialize singleton');
    }

    /**
     * Get the singleton instance.
     */
    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Get the raw PDO connection.
     */
    public function getConnection(): PDO
    {
        return $this->pdo;
    }

    /**
     * Execute a prepared statement and return the PDOStatement.
     *
     * @param string $sql SQL query with placeholders
     * @param array<int|string, mixed> $params Bound parameters
     */
    public function query(string $sql, array $params = []): PDOStatement
    {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log('Query failed: ' . $e->getMessage() . ' | SQL: ' . $sql);
            throw new RuntimeException('A database error occurred.');
        }
    }

    /**
     * Fetch all rows from a prepared query.
     *
     * @param string $sql SQL query with placeholders
     * @param array<int|string, mixed> $params Bound parameters
     * @return array<int, array<string, mixed>>
     */
    public function fetchAll(string $sql, array $params = []): array
    {
        return $this->query($sql, $params)->fetchAll();
    }

    /**
     * Fetch a single row from a prepared query.
     *
     * @param string $sql SQL query with placeholders
     * @param array<int|string, mixed> $params Bound parameters
     * @return array<string, mixed>|false
     */
    public function fetchOne(string $sql, array $params = []): array|false
    {
        return $this->query($sql, $params)->fetch();
    }

    /**
     * Execute an INSERT and return the last insert ID.
     *
     * @param string $sql SQL query with placeholders
     * @param array<int|string, mixed> $params Bound parameters
     */
    public function insert(string $sql, array $params = []): string
    {
        $this->query($sql, $params);
        return $this->pdo->lastInsertId();
    }

    /**
     * Execute an UPDATE/DELETE and return affected row count.
     *
     * @param string $sql SQL query with placeholders
     * @param array<int|string, mixed> $params Bound parameters
     */
    public function execute(string $sql, array $params = []): int
    {
        return $this->query($sql, $params)->rowCount();
    }

    /**
     * Begin a transaction.
     */
    public function beginTransaction(): bool
    {
        return $this->pdo->beginTransaction();
    }

    /**
     * Commit a transaction.
     */
    public function commit(): bool
    {
        return $this->pdo->commit();
    }

    /**
     * Roll back a transaction.
     */
    public function rollBack(): bool
    {
        return $this->pdo->rollBack();
    }

    /**
     * Get a paginated result set with total count.
     *
     * @param string $sql Base SELECT query (without LIMIT/OFFSET)
     * @param array<int|string, mixed> $params Bound parameters
     * @param int $page Current page number (1-indexed)
     * @param int $perPage Records per page
     * @return array{data: array, total: int, page: int, per_page: int, total_pages: int}
     */
    public function paginate(string $sql, array $params = [], int $page = 1, int $perPage = DEFAULT_PAGE_SIZE): array
    {
        $page = max(1, $page);
        $perPage = min(max(1, $perPage), MAX_PAGE_SIZE);
        $offset = ($page - 1) * $perPage;

        // Count total rows
        $countSql = "SELECT COUNT(*) as total FROM ($sql) AS count_query";
        $total = (int) $this->fetchOne($countSql, $params)['total'];

        // Fetch page data
        $pagedSql = "$sql LIMIT :_limit OFFSET :_offset";
        $stmt = $this->pdo->prepare($pagedSql);

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':_limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':_offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $data = $stmt->fetchAll();

        return [
            'data'        => $data,
            'total'       => $total,
            'page'        => $page,
            'per_page'    => $perPage,
            'total_pages' => (int) ceil($total / $perPage),
        ];
    }
}

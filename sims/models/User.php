<?php
/**
 * Al-Huda SIMS - User Model
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/Database.php';

final class User
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Authenticate a user by username and password.
     *
     * @return array<string, mixed>|null User data on success, null on failure
     */
    public function authenticate(string $username, string $password): ?array
    {
        $sql = "SELECT u.*, r.role_name, r.permissions
                FROM users u
                JOIN roles r ON u.role_id = r.id
                WHERE u.username = :username AND u.is_active = 1";

        $user = $this->db->fetchOne($sql, [':username' => $username]);

        if ($user === false || !password_verify($password, $user['password_hash'])) {
            return null;
        }

        // Update last login
        $this->db->execute(
            "UPDATE users SET last_login = NOW() WHERE id = :id",
            [':id' => $user['id']]
        );

        // Remove sensitive data
        unset($user['password_hash']);
        $user['permissions'] = json_decode($user['permissions'], true);

        return $user;
    }

    /**
     * Find user by ID.
     */
    public function findById(int $id): array|false
    {
        $sql = "SELECT u.id, u.username, u.email, u.full_name, u.role_id, u.is_active,
                       u.last_login, u.created_at, r.role_name, r.permissions
                FROM users u
                JOIN roles r ON u.role_id = r.id
                WHERE u.id = :id";

        $user = $this->db->fetchOne($sql, [':id' => $id]);
        if ($user !== false) {
            $user['permissions'] = json_decode($user['permissions'], true);
        }
        return $user;
    }

    /**
     * Create a new user.
     */
    public function create(array $data): string
    {
        $sql = "INSERT INTO users (username, password_hash, email, full_name, role_id)
                VALUES (:username, :password_hash, :email, :full_name, :role_id)";

        return $this->db->insert($sql, [
            ':username'      => $data['username'],
            ':password_hash' => password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]),
            ':email'         => $data['email'],
            ':full_name'     => $data['full_name'],
            ':role_id'       => $data['role_id'],
        ]);
    }

    /**
     * Get all users (paginated).
     */
    public function getAll(int $page = 1, int $perPage = DEFAULT_PAGE_SIZE): array
    {
        $sql = "SELECT u.id, u.username, u.email, u.full_name, u.is_active,
                       u.last_login, u.created_at, r.role_name
                FROM users u
                JOIN roles r ON u.role_id = r.id
                ORDER BY u.created_at DESC";

        return $this->db->paginate($sql, [], $page, $perPage);
    }
}

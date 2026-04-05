<?php
/**
 * Al-Huda SIMS - Subject Model
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/Database.php';

final class Subject
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Get all subjects with optional search.
     */
    public function getAll(int $page = 1, int $perPage = DEFAULT_PAGE_SIZE, string $search = '', string $department = ''): array
    {
        $sql = "SELECT * FROM subjects WHERE 1=1";
        $params = [];

        if ($search !== '') {
            $sql .= " AND (subject_code LIKE :search OR subject_name LIKE :search2)";
            $searchTerm = "%$search%";
            $params[':search'] = $searchTerm;
            $params[':search2'] = $searchTerm;
        }

        if ($department !== '') {
            $sql .= " AND department = :department";
            $params[':department'] = $department;
        }

        $sql .= " ORDER BY subject_code ASC";

        return $this->db->paginate($sql, $params, $page, $perPage);
    }

    /**
     * Find by ID.
     */
    public function findById(int $id): array|false
    {
        return $this->db->fetchOne(
            "SELECT * FROM subjects WHERE id = :id",
            [':id' => $id]
        );
    }

    /**
     * Create a subject.
     */
    public function create(array $data): string
    {
        $sql = "INSERT INTO subjects (subject_code, subject_name, credit_hours, department)
                VALUES (:code, :name, :credits, :department)";

        return $this->db->insert($sql, [
            ':code'       => $data['subject_code'],
            ':name'       => $data['subject_name'],
            ':credits'    => $data['credit_hours'] ?? 3,
            ':department' => $data['department'],
        ]);
    }

    /**
     * Update a subject.
     */
    public function update(int $id, array $data): int
    {
        $sql = "UPDATE subjects SET subject_code = :code, subject_name = :name,
                credit_hours = :credits, department = :department WHERE id = :id";

        return $this->db->execute($sql, [
            ':id'         => $id,
            ':code'       => $data['subject_code'],
            ':name'       => $data['subject_name'],
            ':credits'    => $data['credit_hours'],
            ':department' => $data['department'],
        ]);
    }

    /**
     * Delete a subject.
     */
    public function delete(int $id): int
    {
        return $this->db->execute(
            "DELETE FROM subjects WHERE id = :id",
            [':id' => $id]
        );
    }

    /**
     * Get all subjects as a simple list (for dropdowns).
     */
    public function listAll(): array
    {
        return $this->db->fetchAll(
            "SELECT id, subject_code, subject_name FROM subjects ORDER BY subject_code"
        );
    }
}

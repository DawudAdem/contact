<?php
/**
 * Al-Huda SIMS - Staff Model
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/Database.php';

final class Staff
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Get all staff with pagination, search, and filters.
     */
    public function getAll(
        int $page = 1,
        int $perPage = DEFAULT_PAGE_SIZE,
        string $search = '',
        string $status = '',
        string $department = '',
        string $sortBy = 'created_at',
        string $sortDir = 'DESC'
    ): array {
        $sql = "SELECT * FROM staff WHERE 1=1";
        $params = [];

        if ($search !== '') {
            $sql .= " AND (first_name LIKE :search OR last_name LIKE :search2
                      OR staff_id LIKE :search3 OR email LIKE :search4)";
            $searchTerm = "%$search%";
            $params[':search'] = $searchTerm;
            $params[':search2'] = $searchTerm;
            $params[':search3'] = $searchTerm;
            $params[':search4'] = $searchTerm;
        }

        if ($status !== '') {
            $sql .= " AND status = :status";
            $params[':status'] = $status;
        }

        if ($department !== '') {
            $sql .= " AND department = :department";
            $params[':department'] = $department;
        }

        $allowedSorts = ['staff_id', 'first_name', 'last_name', 'department', 'position', 'status', 'hire_date', 'created_at'];
        $sortBy = in_array($sortBy, $allowedSorts, true) ? $sortBy : 'created_at';
        $sortDir = strtoupper($sortDir) === 'ASC' ? 'ASC' : 'DESC';
        $sql .= " ORDER BY $sortBy $sortDir";

        return $this->db->paginate($sql, $params, $page, $perPage);
    }

    /**
     * Find a staff member by ID.
     */
    public function findById(int $id): array|false
    {
        return $this->db->fetchOne(
            "SELECT * FROM staff WHERE id = :id",
            [':id' => $id]
        );
    }

    /**
     * Create a new staff member.
     */
    public function create(array $data): string
    {
        $sql = "INSERT INTO staff
                (staff_id, first_name, last_name, email, phone, gender, department, position, hire_date, status)
                VALUES
                (:staff_id, :first_name, :last_name, :email, :phone, :gender, :department, :position, :hire_date, :status)";

        return $this->db->insert($sql, [
            ':staff_id'   => $data['staff_id'],
            ':first_name' => $data['first_name'],
            ':last_name'  => $data['last_name'],
            ':email'      => $data['email'] ?? null,
            ':phone'      => $data['phone'] ?? null,
            ':gender'     => $data['gender'],
            ':department' => $data['department'],
            ':position'   => $data['position'],
            ':hire_date'  => $data['hire_date'],
            ':status'     => $data['status'] ?? 'Active',
        ]);
    }

    /**
     * Update a staff member.
     */
    public function update(int $id, array $data): int
    {
        $sql = "UPDATE staff SET
                first_name = :first_name, last_name = :last_name, email = :email,
                phone = :phone, gender = :gender, department = :department,
                position = :position, status = :status
                WHERE id = :id";

        return $this->db->execute($sql, [
            ':id'         => $id,
            ':first_name' => $data['first_name'],
            ':last_name'  => $data['last_name'],
            ':email'      => $data['email'] ?? null,
            ':phone'      => $data['phone'] ?? null,
            ':gender'     => $data['gender'],
            ':department' => $data['department'],
            ':position'   => $data['position'],
            ':status'     => $data['status'],
        ]);
    }

    /**
     * Delete a staff member.
     */
    public function delete(int $id): int
    {
        return $this->db->execute(
            "DELETE FROM staff WHERE id = :id",
            [':id' => $id]
        );
    }

    /**
     * Get unique departments.
     */
    public function getDepartments(): array
    {
        return $this->db->fetchAll(
            "SELECT DISTINCT department FROM staff ORDER BY department"
        );
    }

    /**
     * Generate next staff ID.
     */
    public function generateStaffId(): string
    {
        $year = date('Y');
        $result = $this->db->fetchOne(
            "SELECT staff_id FROM staff WHERE staff_id LIKE :prefix ORDER BY id DESC LIMIT 1",
            [':prefix' => "STF-$year-%"]
        );

        if ($result === false) {
            return "STF-$year-0001";
        }

        $lastNum = (int) substr($result['staff_id'], -4);
        return sprintf("STF-%s-%04d", $year, $lastNum + 1);
    }

    /**
     * Get statistics for dashboard.
     */
    public function getStats(): array
    {
        $total = $this->db->fetchOne("SELECT COUNT(*) as count FROM staff")['count'];
        $active = $this->db->fetchOne("SELECT COUNT(*) as count FROM staff WHERE status = 'Active'")['count'];

        $byDepartment = $this->db->fetchAll(
            "SELECT department, COUNT(*) as count FROM staff GROUP BY department ORDER BY count DESC"
        );

        $byGender = $this->db->fetchAll(
            "SELECT gender, COUNT(*) as count FROM staff GROUP BY gender"
        );

        return [
            'total'         => (int) $total,
            'active'        => (int) $active,
            'by_department' => $byDepartment,
            'by_gender'     => $byGender,
        ];
    }
}

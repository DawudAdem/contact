<?php
/**
 * Al-Huda SIMS - Student Model
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/Database.php';

final class Student
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Get all students with pagination, search, and filters.
     */
    public function getAll(
        int $page = 1,
        int $perPage = DEFAULT_PAGE_SIZE,
        string $search = '',
        string $status = '',
        string $program = '',
        string $sortBy = 'created_at',
        string $sortDir = 'DESC'
    ): array {
        $sql = "SELECT * FROM students WHERE 1=1";
        $params = [];

        if ($search !== '') {
            $sql .= " AND (first_name LIKE :search OR last_name LIKE :search2
                      OR student_id LIKE :search3 OR email LIKE :search4)";
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

        if ($program !== '') {
            $sql .= " AND program = :program";
            $params[':program'] = $program;
        }

        // Whitelist sort columns
        $allowedSorts = ['student_id', 'first_name', 'last_name', 'program', 'year_level', 'status', 'enrollment_date', 'created_at'];
        $sortBy = in_array($sortBy, $allowedSorts, true) ? $sortBy : 'created_at';
        $sortDir = strtoupper($sortDir) === 'ASC' ? 'ASC' : 'DESC';
        $sql .= " ORDER BY $sortBy $sortDir";

        return $this->db->paginate($sql, $params, $page, $perPage);
    }

    /**
     * Find a student by ID.
     */
    public function findById(int $id): array|false
    {
        return $this->db->fetchOne(
            "SELECT * FROM students WHERE id = :id",
            [':id' => $id]
        );
    }

    /**
     * Create a new student.
     */
    public function create(array $data): string
    {
        $sql = "INSERT INTO students
                (student_id, first_name, last_name, email, phone, gender, date_of_birth,
                 enrollment_date, program, year_level, status, address, guardian_name, guardian_phone)
                VALUES
                (:student_id, :first_name, :last_name, :email, :phone, :gender, :dob,
                 :enrollment_date, :program, :year_level, :status, :address, :guardian_name, :guardian_phone)";

        return $this->db->insert($sql, [
            ':student_id'      => $data['student_id'],
            ':first_name'      => $data['first_name'],
            ':last_name'       => $data['last_name'],
            ':email'           => $data['email'] ?? null,
            ':phone'           => $data['phone'] ?? null,
            ':gender'          => $data['gender'],
            ':dob'             => $data['date_of_birth'],
            ':enrollment_date' => $data['enrollment_date'],
            ':program'         => $data['program'],
            ':year_level'      => $data['year_level'] ?? 1,
            ':status'          => $data['status'] ?? 'Active',
            ':address'         => $data['address'] ?? null,
            ':guardian_name'   => $data['guardian_name'] ?? null,
            ':guardian_phone'  => $data['guardian_phone'] ?? null,
        ]);
    }

    /**
     * Update a student.
     */
    public function update(int $id, array $data): int
    {
        $sql = "UPDATE students SET
                first_name = :first_name, last_name = :last_name, email = :email,
                phone = :phone, gender = :gender, date_of_birth = :dob,
                program = :program, year_level = :year_level, status = :status,
                address = :address, guardian_name = :guardian_name, guardian_phone = :guardian_phone
                WHERE id = :id";

        return $this->db->execute($sql, [
            ':id'             => $id,
            ':first_name'     => $data['first_name'],
            ':last_name'      => $data['last_name'],
            ':email'          => $data['email'] ?? null,
            ':phone'          => $data['phone'] ?? null,
            ':gender'         => $data['gender'],
            ':dob'            => $data['date_of_birth'],
            ':program'        => $data['program'],
            ':year_level'     => $data['year_level'],
            ':status'         => $data['status'],
            ':address'        => $data['address'] ?? null,
            ':guardian_name'  => $data['guardian_name'] ?? null,
            ':guardian_phone' => $data['guardian_phone'] ?? null,
        ]);
    }

    /**
     * Delete a student.
     */
    public function delete(int $id): int
    {
        return $this->db->execute(
            "DELETE FROM students WHERE id = :id",
            [':id' => $id]
        );
    }

    /**
     * Get unique programs for filter dropdowns.
     */
    public function getPrograms(): array
    {
        return $this->db->fetchAll(
            "SELECT DISTINCT program FROM students ORDER BY program"
        );
    }

    /**
     * Generate next student ID.
     */
    public function generateStudentId(): string
    {
        $year = date('Y');
        $result = $this->db->fetchOne(
            "SELECT student_id FROM students WHERE student_id LIKE :prefix ORDER BY id DESC LIMIT 1",
            [':prefix' => "ALH-$year-%"]
        );

        if ($result === false) {
            return "ALH-$year-0001";
        }

        $lastNum = (int) substr($result['student_id'], -4);
        return sprintf("ALH-%s-%04d", $year, $lastNum + 1);
    }

    /**
     * Get statistics for dashboard.
     */
    public function getStats(): array
    {
        $total = $this->db->fetchOne("SELECT COUNT(*) as count FROM students")['count'];
        $active = $this->db->fetchOne("SELECT COUNT(*) as count FROM students WHERE status = 'Active'")['count'];

        $byProgram = $this->db->fetchAll(
            "SELECT program, COUNT(*) as count FROM students GROUP BY program ORDER BY count DESC"
        );

        $byGender = $this->db->fetchAll(
            "SELECT gender, COUNT(*) as count FROM students GROUP BY gender"
        );

        $byStatus = $this->db->fetchAll(
            "SELECT status, COUNT(*) as count FROM students GROUP BY status ORDER BY count DESC"
        );

        $byYear = $this->db->fetchAll(
            "SELECT year_level, COUNT(*) as count FROM students WHERE status = 'Active' GROUP BY year_level ORDER BY year_level"
        );

        $enrollmentTrend = $this->db->fetchAll(
            "SELECT DATE_FORMAT(enrollment_date, '%Y-%m') as month, COUNT(*) as count
             FROM students
             GROUP BY month
             ORDER BY month DESC
             LIMIT 12"
        );

        return [
            'total'            => (int) $total,
            'active'           => (int) $active,
            'by_program'       => $byProgram,
            'by_gender'        => $byGender,
            'by_status'        => $byStatus,
            'by_year'          => $byYear,
            'enrollment_trend' => array_reverse($enrollmentTrend),
        ];
    }
}

<?php
/**
 * Al-Huda SIMS - Academic Performance Model
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/Database.php';

final class AcademicPerformance
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Get performance records with pagination and filters.
     */
    public function getAll(
        int $page = 1,
        int $perPage = DEFAULT_PAGE_SIZE,
        string $search = '',
        string $semester = '',
        string $academicYear = '',
        int $studentId = 0
    ): array {
        $sql = "SELECT ap.*, s.student_id AS student_code, s.first_name, s.last_name,
                       sub.subject_code, sub.subject_name
                FROM academic_performance ap
                JOIN students s ON ap.student_id = s.id
                JOIN subjects sub ON ap.subject_id = sub.id
                WHERE 1=1";
        $params = [];

        if ($search !== '') {
            $sql .= " AND (s.student_id LIKE :search OR s.first_name LIKE :search2
                      OR s.last_name LIKE :search3 OR sub.subject_name LIKE :search4)";
            $searchTerm = "%$search%";
            $params[':search'] = $searchTerm;
            $params[':search2'] = $searchTerm;
            $params[':search3'] = $searchTerm;
            $params[':search4'] = $searchTerm;
        }

        if ($semester !== '') {
            $sql .= " AND ap.semester = :semester";
            $params[':semester'] = $semester;
        }

        if ($academicYear !== '') {
            $sql .= " AND ap.academic_year = :year";
            $params[':year'] = $academicYear;
        }

        if ($studentId > 0) {
            $sql .= " AND ap.student_id = :student_id";
            $params[':student_id'] = $studentId;
        }

        $sql .= " ORDER BY ap.created_at DESC";

        return $this->db->paginate($sql, $params, $page, $perPage);
    }

    /**
     * Find by ID.
     */
    public function findById(int $id): array|false
    {
        $sql = "SELECT ap.*, s.student_id AS student_code, s.first_name, s.last_name,
                       sub.subject_code, sub.subject_name
                FROM academic_performance ap
                JOIN students s ON ap.student_id = s.id
                JOIN subjects sub ON ap.subject_id = sub.id
                WHERE ap.id = :id";

        return $this->db->fetchOne($sql, [':id' => $id]);
    }

    /**
     * Create a performance record.
     */
    public function create(array $data): string
    {
        $sql = "INSERT INTO academic_performance
                (student_id, subject_id, semester, academic_year, score, recorded_by)
                VALUES (:student_id, :subject_id, :semester, :academic_year, :score, :recorded_by)";

        return $this->db->insert($sql, [
            ':student_id'    => $data['student_id'],
            ':subject_id'    => $data['subject_id'],
            ':semester'      => $data['semester'],
            ':academic_year' => $data['academic_year'],
            ':score'         => $data['score'],
            ':recorded_by'   => $data['recorded_by'],
        ]);
    }

    /**
     * Update a performance record.
     */
    public function update(int $id, array $data): int
    {
        $sql = "UPDATE academic_performance SET
                score = :score, semester = :semester, academic_year = :academic_year
                WHERE id = :id";

        return $this->db->execute($sql, [
            ':id'            => $id,
            ':score'         => $data['score'],
            ':semester'      => $data['semester'],
            ':academic_year' => $data['academic_year'],
        ]);
    }

    /**
     * Delete a performance record.
     */
    public function delete(int $id): int
    {
        return $this->db->execute(
            "DELETE FROM academic_performance WHERE id = :id",
            [':id' => $id]
        );
    }

    /**
     * Get grade distribution for analytics.
     */
    public function getGradeDistribution(string $academicYear = ''): array
    {
        $sql = "SELECT grade, COUNT(*) as count FROM academic_performance WHERE 1=1";
        $params = [];

        if ($academicYear !== '') {
            $sql .= " AND academic_year = :year";
            $params[':year'] = $academicYear;
        }

        $sql .= " GROUP BY grade ORDER BY grade";

        return $this->db->fetchAll($sql, $params);
    }

    /**
     * Get average score by subject.
     */
    public function getAverageBySubject(string $academicYear = ''): array
    {
        $sql = "SELECT sub.subject_name, ROUND(AVG(ap.score), 2) as avg_score, COUNT(*) as total
                FROM academic_performance ap
                JOIN subjects sub ON ap.subject_id = sub.id
                WHERE 1=1";
        $params = [];

        if ($academicYear !== '') {
            $sql .= " AND ap.academic_year = :year";
            $params[':year'] = $academicYear;
        }

        $sql .= " GROUP BY sub.id, sub.subject_name ORDER BY avg_score DESC";

        return $this->db->fetchAll($sql, $params);
    }

    /**
     * Get performance trend (avg score by semester).
     */
    public function getPerformanceTrend(): array
    {
        $sql = "SELECT academic_year, semester,
                       ROUND(AVG(score), 2) as avg_score,
                       COUNT(*) as total_records
                FROM academic_performance
                GROUP BY academic_year, semester
                ORDER BY academic_year, semester";

        return $this->db->fetchAll($sql);
    }

    /**
     * Get academic years for filter dropdown.
     */
    public function getAcademicYears(): array
    {
        return $this->db->fetchAll(
            "SELECT DISTINCT academic_year FROM academic_performance ORDER BY academic_year DESC"
        );
    }
}

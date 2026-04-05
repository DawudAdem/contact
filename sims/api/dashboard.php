<?php
/**
 * Al-Huda SIMS - Dashboard API
 */

declare(strict_types=1);

require_once __DIR__ . '/../core/Router.php';
require_once __DIR__ . '/../core/Session.php';
require_once __DIR__ . '/../core/RBAC.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../models/Student.php';
require_once __DIR__ . '/../models/Staff.php';
require_once __DIR__ . '/../models/AcademicPerformance.php';

Session::start();
$router = new Router();

// GET /dashboard/stats - Aggregate dashboard statistics
$router->get('/dashboard/stats', function () {
    RBAC::enforce('dashboard.view');

    $studentModel = new Student();
    $staffModel = new Staff();
    $perfModel = new AcademicPerformance();

    $academicYear = Router::getQueryParam('academic_year', '2024-2025');

    $studentStats = $studentModel->getStats();
    $staffStats = $staffModel->getStats();
    $gradeDistribution = $perfModel->getGradeDistribution($academicYear);
    $avgBySubject = $perfModel->getAverageBySubject($academicYear);
    $performanceTrend = $perfModel->getPerformanceTrend();

    Response::json([
        'students'           => $studentStats,
        'staff'              => $staffStats,
        'grade_distribution' => $gradeDistribution,
        'avg_by_subject'     => $avgBySubject,
        'performance_trend'  => $performanceTrend,
    ]);
});

$router->dispatch();

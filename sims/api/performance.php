<?php
/**
 * Al-Huda SIMS - Academic Performance API
 */

declare(strict_types=1);

require_once __DIR__ . '/../core/Router.php';
require_once __DIR__ . '/../core/Session.php';
require_once __DIR__ . '/../core/CSRF.php';
require_once __DIR__ . '/../core/RBAC.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../models/AcademicPerformance.php';

Session::start();
$router = new Router();
$perfModel = new AcademicPerformance();

// GET /performance - List
$router->get('/performance', function () use ($perfModel) {
    RBAC::enforce('performance.view');

    $page = (int) Router::getQueryParam('page', 1);
    $perPage = (int) Router::getQueryParam('per_page', DEFAULT_PAGE_SIZE);
    $search = Router::getQueryParam('search', '');
    $semester = Router::getQueryParam('semester', '');
    $academicYear = Router::getQueryParam('academic_year', '');
    $studentId = (int) Router::getQueryParam('student_id', 0);

    $result = $perfModel->getAll($page, $perPage, $search, $semester, $academicYear, $studentId);
    Response::json($result);
});

// GET /performance/years - Academic years
$router->get('/performance/years', function () use ($perfModel) {
    RBAC::enforce('performance.view');
    Response::json($perfModel->getAcademicYears());
});

// GET /performance/{id}
$router->get('/performance/{id}', function (array $params) use ($perfModel) {
    RBAC::enforce('performance.view');

    $record = $perfModel->findById((int) $params['id']);
    if ($record === false) {
        Response::error('Record not found.', 404);
    }
    Response::json($record);
});

// POST /performance
$router->post('/performance', function () use ($perfModel) {
    RBAC::enforce('performance.create');
    CSRF::enforce();

    $data = Router::getJsonBody();
    $data['recorded_by'] = Session::get('user_id');

    $required = ['student_id', 'subject_id', 'semester', 'academic_year', 'score'];
    $errors = [];
    foreach ($required as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            $errors[] = "$field is required.";
        }
    }

    $score = (float) ($data['score'] ?? 0);
    if ($score < 0 || $score > 100) {
        $errors[] = 'Score must be between 0 and 100.';
    }

    if (!empty($errors)) {
        Response::error('Validation failed.', 422, $errors);
    }

    $id = $perfModel->create($data);
    Response::success('Performance record created successfully.', ['id' => $id], 201);
});

// PUT /performance/{id}
$router->put('/performance/{id}', function (array $params) use ($perfModel) {
    RBAC::enforce('performance.edit');
    CSRF::enforce();

    $data = Router::getJsonBody();
    $id = (int) $params['id'];

    $existing = $perfModel->findById($id);
    if ($existing === false) {
        Response::error('Record not found.', 404);
    }

    $errors = [];
    $required = ['semester', 'academic_year', 'score'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            $errors[] = "$field is required.";
        }
    }

    $score = (float) ($data['score'] ?? 0);
    if ($score < 0 || $score > 100) {
        $errors[] = 'Score must be between 0 and 100.';
    }

    if (!empty($errors)) {
        Response::error('Validation failed.', 422, $errors);
    }

    $perfModel->update($id, $data);
    Response::success('Performance record updated successfully.');
});

// DELETE /performance/{id}
$router->delete('/performance/{id}', function (array $params) use ($perfModel) {
    RBAC::enforce('performance.delete');
    CSRF::enforce();

    $id = (int) $params['id'];
    $perfModel->delete($id);
    Response::success('Performance record deleted successfully.');
});

$router->dispatch();

<?php
/**
 * Al-Huda SIMS - Students API
 */

declare(strict_types=1);

require_once __DIR__ . '/../core/Router.php';
require_once __DIR__ . '/../core/Session.php';
require_once __DIR__ . '/../core/CSRF.php';
require_once __DIR__ . '/../core/RBAC.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../models/Student.php';

Session::start();
$router = new Router();
$studentModel = new Student();

// GET /students - List with pagination
$router->get('/students', function () use ($studentModel) {
    RBAC::enforce('students.view');

    $page = (int) Router::getQueryParam('page', 1);
    $perPage = (int) Router::getQueryParam('per_page', DEFAULT_PAGE_SIZE);
    $search = Router::getQueryParam('search', '');
    $status = Router::getQueryParam('status', '');
    $program = Router::getQueryParam('program', '');
    $sortBy = Router::getQueryParam('sort_by', 'created_at');
    $sortDir = Router::getQueryParam('sort_dir', 'DESC');

    $result = $studentModel->getAll($page, $perPage, $search, $status, $program, $sortBy, $sortDir);
    Response::json($result);
});

// GET /students/stats - Statistics
$router->get('/students/stats', function () use ($studentModel) {
    RBAC::enforce('students.view');
    Response::json($studentModel->getStats());
});

// GET /students/programs - Unique programs
$router->get('/students/programs', function () use ($studentModel) {
    RBAC::enforce('students.view');
    Response::json($studentModel->getPrograms());
});

// GET /students/next-id - Generate next student ID
$router->get('/students/next-id', function () use ($studentModel) {
    RBAC::enforce('students.create');
    Response::json(['student_id' => $studentModel->generateStudentId()]);
});

// GET /students/{id} - Single student
$router->get('/students/{id}', function (array $params) use ($studentModel) {
    RBAC::enforce('students.view');

    $student = $studentModel->findById((int) $params['id']);
    if ($student === false) {
        Response::error('Student not found.', 404);
    }
    Response::json($student);
});

// POST /students - Create
$router->post('/students', function () use ($studentModel) {
    RBAC::enforce('students.create');
    CSRF::enforce();

    $data = Router::getJsonBody();

    // Validation
    $required = ['student_id', 'first_name', 'last_name', 'gender', 'date_of_birth', 'enrollment_date', 'program'];
    $errors = [];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            $errors[] = "$field is required.";
        }
    }
    if (!empty($errors)) {
        Response::error('Validation failed.', 422, $errors);
    }

    $id = $studentModel->create($data);
    Response::success('Student created successfully.', ['id' => $id], 201);
});

// PUT /students/{id} - Update
$router->put('/students/{id}', function (array $params) use ($studentModel) {
    RBAC::enforce('students.edit');
    CSRF::enforce();

    $data = Router::getJsonBody();
    $id = (int) $params['id'];

    $existing = $studentModel->findById($id);
    if ($existing === false) {
        Response::error('Student not found.', 404);
    }

    $studentModel->update($id, $data);
    Response::success('Student updated successfully.');
});

// DELETE /students/{id} - Delete
$router->delete('/students/{id}', function (array $params) use ($studentModel) {
    RBAC::enforce('students.delete');
    CSRF::enforce();

    $id = (int) $params['id'];
    $existing = $studentModel->findById($id);
    if ($existing === false) {
        Response::error('Student not found.', 404);
    }

    $studentModel->delete($id);
    Response::success('Student deleted successfully.');
});

$router->dispatch();

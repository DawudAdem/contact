<?php
/**
 * Al-Huda SIMS - Subjects API
 */

declare(strict_types=1);

require_once __DIR__ . '/../core/Router.php';
require_once __DIR__ . '/../core/Session.php';
require_once __DIR__ . '/../core/CSRF.php';
require_once __DIR__ . '/../core/RBAC.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../models/Subject.php';

Session::start();
$router = new Router();
$subjectModel = new Subject();

// GET /subjects - List
$router->get('/subjects', function () use ($subjectModel) {
    RBAC::enforce('subjects.view');

    $page = (int) Router::getQueryParam('page', 1);
    $perPage = (int) Router::getQueryParam('per_page', DEFAULT_PAGE_SIZE);
    $search = Router::getQueryParam('search', '');
    $department = Router::getQueryParam('department', '');

    $result = $subjectModel->getAll($page, $perPage, $search, $department);
    Response::json($result);
});

// GET /subjects/list - Simple list for dropdowns
$router->get('/subjects/list', function () use ($subjectModel) {
    RBAC::enforce('subjects.view');
    Response::json($subjectModel->listAll());
});

// GET /subjects/{id}
$router->get('/subjects/{id}', function (array $params) use ($subjectModel) {
    RBAC::enforce('subjects.view');

    $subject = $subjectModel->findById((int) $params['id']);
    if ($subject === false) {
        Response::error('Subject not found.', 404);
    }
    Response::json($subject);
});

// POST /subjects
$router->post('/subjects', function () use ($subjectModel) {
    RBAC::enforce('subjects.create');
    CSRF::enforce();

    $data = Router::getJsonBody();

    $required = ['subject_code', 'subject_name', 'department'];
    $errors = [];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            $errors[] = "$field is required.";
        }
    }
    if (!empty($errors)) {
        Response::error('Validation failed.', 422, $errors);
    }

    $id = $subjectModel->create($data);
    Response::success('Subject created successfully.', ['id' => $id], 201);
});

// PUT /subjects/{id}
$router->put('/subjects/{id}', function (array $params) use ($subjectModel) {
    RBAC::enforce('subjects.edit');
    CSRF::enforce();

    $data = Router::getJsonBody();
    $id = (int) $params['id'];

    $existing = $subjectModel->findById($id);
    if ($existing === false) {
        Response::error('Subject not found.', 404);
    }

    $subjectModel->update($id, $data);
    Response::success('Subject updated successfully.');
});

// DELETE /subjects/{id}
$router->delete('/subjects/{id}', function (array $params) use ($subjectModel) {
    RBAC::enforce('subjects.delete');
    CSRF::enforce();

    $id = (int) $params['id'];
    $subjectModel->delete($id);
    Response::success('Subject deleted successfully.');
});

$router->dispatch();

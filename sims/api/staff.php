<?php
/**
 * Al-Huda SIMS - Staff API
 */

declare(strict_types=1);

require_once __DIR__ . '/../core/Router.php';
require_once __DIR__ . '/../core/Session.php';
require_once __DIR__ . '/../core/CSRF.php';
require_once __DIR__ . '/../core/RBAC.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../models/Staff.php';

Session::start();
$router = new Router();
$staffModel = new Staff();

// GET /staff - List with pagination
$router->get('/staff', function () use ($staffModel) {
    RBAC::enforce('staff.view');

    $page = (int) Router::getQueryParam('page', 1);
    $perPage = (int) Router::getQueryParam('per_page', DEFAULT_PAGE_SIZE);
    $search = Router::getQueryParam('search', '');
    $status = Router::getQueryParam('status', '');
    $department = Router::getQueryParam('department', '');
    $sortBy = Router::getQueryParam('sort_by', 'created_at');
    $sortDir = Router::getQueryParam('sort_dir', 'DESC');

    $result = $staffModel->getAll($page, $perPage, $search, $status, $department, $sortBy, $sortDir);
    Response::json($result);
});

// GET /staff/stats - Statistics
$router->get('/staff/stats', function () use ($staffModel) {
    RBAC::enforce('staff.view');
    Response::json($staffModel->getStats());
});

// GET /staff/departments - Unique departments
$router->get('/staff/departments', function () use ($staffModel) {
    RBAC::enforce('staff.view');
    Response::json($staffModel->getDepartments());
});

// GET /staff/next-id - Generate next staff ID
$router->get('/staff/next-id', function () use ($staffModel) {
    RBAC::enforce('staff.create');
    Response::json(['staff_id' => $staffModel->generateStaffId()]);
});

// GET /staff/{id} - Single staff member
$router->get('/staff/{id}', function (array $params) use ($staffModel) {
    RBAC::enforce('staff.view');

    $staff = $staffModel->findById((int) $params['id']);
    if ($staff === false) {
        Response::error('Staff member not found.', 404);
    }
    Response::json($staff);
});

// POST /staff - Create
$router->post('/staff', function () use ($staffModel) {
    RBAC::enforce('staff.create');
    CSRF::enforce();

    $data = Router::getJsonBody();

    $required = ['staff_id', 'first_name', 'last_name', 'gender', 'department', 'position', 'hire_date'];
    $errors = [];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            $errors[] = "$field is required.";
        }
    }
    if (!empty($errors)) {
        Response::error('Validation failed.', 422, $errors);
    }

    $id = $staffModel->create($data);
    Response::success('Staff member created successfully.', ['id' => $id], 201);
});

// PUT /staff/{id} - Update
$router->put('/staff/{id}', function (array $params) use ($staffModel) {
    RBAC::enforce('staff.edit');
    CSRF::enforce();

    $data = Router::getJsonBody();
    $id = (int) $params['id'];

    $existing = $staffModel->findById($id);
    if ($existing === false) {
        Response::error('Staff member not found.', 404);
    }

    $staffModel->update($id, $data);
    Response::success('Staff member updated successfully.');
});

// DELETE /staff/{id} - Delete
$router->delete('/staff/{id}', function (array $params) use ($staffModel) {
    RBAC::enforce('staff.delete');
    CSRF::enforce();

    $id = (int) $params['id'];
    $existing = $staffModel->findById($id);
    if ($existing === false) {
        Response::error('Staff member not found.', 404);
    }

    $staffModel->delete($id);
    Response::success('Staff member deleted successfully.');
});

$router->dispatch();

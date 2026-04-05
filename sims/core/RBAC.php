<?php
/**
 * Al-Huda SIMS - Role-Based Access Control
 */

declare(strict_types=1);

require_once __DIR__ . '/Session.php';
require_once __DIR__ . '/Response.php';

final class RBAC
{
    /**
     * Check if the current user has a specific permission.
     */
    public static function hasPermission(string $permission): bool
    {
        $permissions = Session::get('permissions', []);
        return in_array($permission, $permissions, true);
    }

    /**
     * Check if the current user has any of the given permissions.
     *
     * @param string[] $permissions
     */
    public static function hasAnyPermission(array $permissions): bool
    {
        $userPermissions = Session::get('permissions', []);
        return !empty(array_intersect($permissions, $userPermissions));
    }

    /**
     * Check if the current user has all of the given permissions.
     *
     * @param string[] $permissions
     */
    public static function hasAllPermissions(array $permissions): bool
    {
        $userPermissions = Session::get('permissions', []);
        return empty(array_diff($permissions, $userPermissions));
    }

    /**
     * Enforce a permission - returns 403 if user lacks it.
     */
    public static function enforce(string $permission): void
    {
        if (!Session::isAuthenticated()) {
            Response::error('Authentication required.', 401);
        }

        if (!self::hasPermission($permission)) {
            Response::error('Insufficient permissions.', 403);
        }
    }

    /**
     * Enforce any of the given permissions.
     *
     * @param string[] $permissions
     */
    public static function enforceAny(array $permissions): void
    {
        if (!Session::isAuthenticated()) {
            Response::error('Authentication required.', 401);
        }

        if (!self::hasAnyPermission($permissions)) {
            Response::error('Insufficient permissions.', 403);
        }
    }

    /**
     * Check if the current user has a specific role.
     */
    public static function hasRole(string $role): bool
    {
        return Session::get('role') === $role;
    }

    /**
     * Get the current user's role.
     */
    public static function getRole(): ?string
    {
        return Session::get('role');
    }

    /**
     * Require authentication.
     */
    public static function requireAuth(): void
    {
        if (!Session::isAuthenticated()) {
            Response::error('Authentication required.', 401);
        }
    }
}

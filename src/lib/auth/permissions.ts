/**
 * Permission utilities for role-based access control (RBAC)
 */

/**
 * Check if a user has the required roles or groups
 *
 * @param userRoles - Array of roles the user has
 * @param userGroups - Array of groups the user belongs to
 * @param requiredRoles - Array of required roles (user must have at least one)
 * @param requiredGroups - Array of required groups (user must have at least one)
 * @returns true if user has sufficient permissions
 */
export function hasAccess(
    userRoles: string[] = [],
    userGroups: string[] = [],
    requiredRoles: string[] = [],
    requiredGroups: string[] = [],
): boolean {
    // If no requirements, grant access
    if (requiredRoles.length === 0 && requiredGroups.length === 0) {
        return true;
    }

    // Check roles: user must have at least one required role
    if (requiredRoles.length > 0) {
        const hasRole = requiredRoles.some((role) => userRoles.includes(role));
        if (!hasRole) return false;
    }

    // Check groups: user must have at least one required group
    if (requiredGroups.length > 0) {
        const hasGroup = requiredGroups.some((group) => userGroups.includes(group));
        if (!hasGroup) return false;
    }

    return true;
}

/**
 * Check if user is an admin
 */
export function isAdmin(userRoles: string[] = []): boolean {
    return userRoles.includes("admin");
}

/**
 * Check if user is an instructor
 */
export function isInstructor(userRoles: string[] = []): boolean {
    return userRoles.includes("instructor");
}

/**
 * Check if user is a student
 */
export function isStudent(userRoles: string[] = []): boolean {
    return userRoles.includes("student");
}

/**
 * Check if user belongs to a specific group
 */
export function inGroup(userGroups: string[] = [], groupName: string): boolean {
    return userGroups.includes(groupName);
}

/**
 * Check if user has any admin-level access
 */
export function hasAdminAccess(userRoles: string[] = [], userGroups: string[] = []): boolean {
    return isAdmin(userRoles) || inGroup(userGroups, "administrators");
}

/**
 * Check if user has instructor-level access
 */
export function hasInstructorAccess(userRoles: string[] = [], userGroups: string[] = []): boolean {
    return (
        isInstructor(userRoles) ||
        inGroup(userGroups, "instructors") ||
        hasAdminAccess(userRoles, userGroups)
    );
}

/**
 * Check if user has student-level access
 */
export function hasStudentAccess(userRoles: string[] = [], userGroups: string[] = []): boolean {
    return (
        isStudent(userRoles) ||
        inGroup(userGroups, "students") ||
        hasInstructorAccess(userRoles, userGroups)
    );
}

/**
 * Get the highest privilege level for a user
 * Returns: 'admin' | 'instructor' | 'student' | 'none'
 */
export function getUserPrivilegeLevel(
    userRoles: string[] = [],
    userGroups: string[] = [],
): "admin" | "instructor" | "student" | "none" {
    if (hasAdminAccess(userRoles, userGroups)) return "admin";
    if (hasInstructorAccess(userRoles, userGroups)) return "instructor";
    if (hasStudentAccess(userRoles, userGroups)) return "student";
    return "none";
}

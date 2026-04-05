export type UserType = "STUDENT" | "COACH" | "MANAGER" | "ADMIN";

/**
 * Role-Based Access Control (RBAC) Utility
 * 
 * Verifies if a user has at least one of the required roles OR groups.
 * If no roles or groups are required, access is granted by default (Public Access).
 * 
 * Logic (OR Semantics):
 * 1. If both requiredRoles and requiredGroups are empty, return true.
 * 2. If user satisfies at least one required role, return true.
 * 3. If user satisfies at least one required group, return true.
 * 4. Otherwise, return false.
 * 
 * Used by both the Middleware (Edge) and the AuthGuard (Client).
 */
export function hasAccess(
    userRoles: string[],
    userGroups: string[],
    requiredRoles: string[],
    requiredGroups: string[]
): boolean {
    // 1. If no roles or groups are explicitly required, we grant access
    if (requiredRoles.length === 0 && requiredGroups.length === 0) {
        return true;
    }

    // 2. Check Roles: If required roles provided and user has one, access granted (OR)
    if (requiredRoles.length > 0 && requiredRoles.some(role => userRoles.includes(role))) {
        return true;
    }

    // 3. Check Groups: If required groups provided and user has one, access granted (OR)
    if (requiredGroups.length > 0 && requiredGroups.some(group => userGroups.includes(group))) {
        return true;
    }

    // 4. If requirements are defined but neither was matched, deny access
    return false;
}


export type UserType = "STUDENT" | "COACH" | "MANAGER" | "ADMIN";

/**
 * Role-Based Access Control (RBAC) Utility
 * 
 * Verifies if a user has at least one of the required roles OR groups.
 * Used by both the Middleware (Edge) and the AuthGuard (Client).
 */
export function hasAccess(
    userRoles: string[],
    userGroups: string[],
    requiredRoles: string[],
    requiredGroups: string[]
): boolean {
    if (requiredRoles.length > 0) {
        const hasRole = requiredRoles.some(role => userRoles.includes(role));
        if (!hasRole) return false;
    }

    if (requiredGroups.length > 0) {
        const hasGroup = requiredGroups.some(group => userGroups.includes(group));
        if (!hasGroup) return false;
    }

    return true;
}

enum UserType {
    ADMIN = "admin",
    MANAGER = "manager",
    INSTRUCTOR = "instructor",
    STUDENT = "student",
}

export interface AuthUserClaims {
    roles?: string[];
    groups?: string[];
    permissions?: string[];
}

// Utility function to check if user has any of the required roles
export function hasRequiredRole(userRole: string | undefined, requiredRoles: UserType[]): boolean {
    if (!userRole || requiredRoles.length === 0) return false;
    const normalizedUserRole = userRole.toLowerCase();
    return requiredRoles.some((role) => role.toLowerCase() === normalizedUserRole);
}

// Utility function to check if user has any of the required permissions
export function hasRequiredPermission(
    userPermissions: string[] | undefined,
    requiredPermissions: string[],
): boolean {
    if (!userPermissions || requiredPermissions.length === 0) return false;
    return requiredPermissions.some((permission) => userPermissions.includes(permission));
}

// Wrapper helper for session.user style objects.
export function hasPermission(
    user: AuthUserClaims | null | undefined,
    requiredPermissions: string[],
): boolean {
    return hasRequiredPermission(user?.permissions, requiredPermissions);
}

// Utility function to check if user belongs to any of the required groups
export function belongsToRequiredGroup(
    userGroups: string[] | undefined,
    requiredGroups: string[],
): boolean {
    if (!userGroups || requiredGroups.length === 0) return false;
    return requiredGroups.some((group) => userGroups.includes(group));
}

// Wrapper helper for session.user style objects.
export function belongsToGroup(
    user: AuthUserClaims | null | undefined,
    requiredGroups: string[],
): boolean {
    return belongsToRequiredGroup(user?.groups, requiredGroups);
}

// Combined utility function to check both roles and groups
export function hasAccess(
    userRoles: string[] | undefined,
    userGroups: string[] | undefined,
    requiredRoles: UserType[] = [],
    requiredGroups: string[] = [],
): boolean {
    // If no requirements, grant access
    if (requiredRoles.length === 0 && requiredGroups.length === 0) return true;

    const hasRole =
        requiredRoles.length > 0 &&
        (userRoles?.some((role) => hasRequiredRole(role, requiredRoles)) ?? false);

    const hasGroup =
        requiredGroups.length > 0 && belongsToRequiredGroup(userGroups, requiredGroups);

    // Grant access if user satisfies EITHER role or group requirements
    return hasRole || hasGroup;
}

export { UserType };

import { decodeJwt } from "jose";
import { DecodedJWT, KeycloakToken } from "./types";
import { logger } from "../logger";

export function processDecodedToken(decoded: DecodedJWT | null): {
    roles: string[];
    groups: string[];
    permissions: string[];
} {
    let roles: string[] = [];
    let groups: string[] = [];
    const permissions: string[] = [];

    if (decoded && typeof decoded === "object" && !Array.isArray(decoded)) {
        const decodedJWT = decoded as DecodedJWT;

        // Extract realm roles
        roles = decodedJWT.realm_access?.roles || [];

        // Extract client roles if AUTH_KEYCLOAK_ID is defined
        const clientId = process.env.AUTH_KEYCLOAK_ID;
        if (clientId && decodedJWT.resource_access?.[clientId]?.roles) {
            roles = [...roles, ...(decodedJWT.resource_access[clientId].roles || [])];
        }

        // Extract groups and normalize them (remove leading slash)
        groups = (decodedJWT.groups || []).map((group: string) => group.replace(/^\//, ""));

        // IMPORTANT: Many setups use groups as roles. Merge groups into roles for easier RBAC.
        roles = [...roles, ...groups];

        // Deduplicate roles
        roles = Array.from(new Set(roles));
    }

    return { roles, groups, permissions };
}

export async function refreshKeycloakAccessToken(
    token: KeycloakToken,
): Promise<KeycloakToken | null> {
    try {
        logger.info("Attempting to refresh Keycloak access token...");

        // Ensure environment variables are defined. specific error handling might be better
        // but for now we trust they are present as per existing logic, or throw if not.
        if (
            !process.env.AUTH_KEYCLOAK_ISSUER ||
            !process.env.AUTH_KEYCLOAK_ID ||
            !process.env.AUTH_KEYCLOAK_SECRET
        ) {
            throw new Error("Missing Keycloak environment variables");
        }

        const response = await fetch(
            `${process.env.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    grant_type: "refresh_token",
                    refresh_token: token.refresh_token!,
                    client_id: process.env.AUTH_KEYCLOAK_ID,
                    client_secret: process.env.AUTH_KEYCLOAK_SECRET,
                }),
            },
        );

        const refreshedTokens = await response.json();
        if (!response.ok) {
            // If session is not active, return null to invalidate the session gracefully
            if (
                refreshedTokens.error === "invalid_grant" &&
                refreshedTokens.error_description === "Session not active"
            ) {
                logger.info("Session has expired, invalidating session");
                return null;
            }

            logger.error("Failed to refresh access token", {
                status: response.status,
                statusText: response.statusText,
                error: refreshedTokens,
            });
            throw new Error(
                `Token refresh failed: ${
                    refreshedTokens.error_description || refreshedTokens.error || "Unknown error"
                }`,
            );
        }

        const decoded = decodeJwt(refreshedTokens.access_token);
        const { roles, groups, permissions } = processDecodedToken(decoded as DecodedJWT);

        logger.info("Successfully refreshed access token");
        return {
            ...token,
            access_token: refreshedTokens.access_token,
            refresh_token: refreshedTokens.refresh_token ?? token.refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
            roles: roles,
            groups: groups,
            permissions: permissions,
            id_token: refreshedTokens.id_token ?? token.id_token,
            error: undefined,
        };
    } catch (error: unknown) {
        logger.error("Error refreshing access token", { err: error });

        let errorMessage = "RefreshAccessTokenError";
        if (error instanceof Error) {
            errorMessage = `RefreshAccessTokenError: ${error.message}`;
        }

        return {
            ...token,
            error: errorMessage,
        };
    }
}

import NextAuth, { type Account, type User } from "next-auth";
import { type JWT } from "next-auth/jwt";
import KeycloakProvider from "next-auth/providers/keycloak";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * NextAuth Configuration
 * 
 * Supports two modes:
 * 1. Development: Uses CredentialsProvider for a one-click bypass.
 * 2. Production: Keycloak-based OIDC.
 */
const isDev = process.env.NEXT_PUBLIC_APP_MODE === "Development";
const authSecret = process.env.AUTH_SECRET;

if (!authSecret) {
    if (isDev) {
        console.warn("⚠️ [SECURITY] AUTH_SECRET is missing. Session persistence and security are compromised. Please set AUTH_SECRET in .env.local.");
    } else {
        throw new Error("❌ [FATAL] AUTH_SECRET is missing in Production environment. Application cannot start safely.");
    }
}


/**
 * Helper to refresh an expired access token using Keycloak's token endpoint.
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
        if (!token.refreshToken) {
            throw new Error("No refresh token available");
        }

        const response = await fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: process.env.KEYCLOAK_CLIENT_ID || "",
                client_secret: process.env.KEYCLOAK_CLIENT_SECRET || "",
                grant_type: "refresh_token",
                refresh_token: token.refreshToken as string,
            }),
        });

        const tokens = await response.json();

        if (!response.ok) {
            throw tokens;
        }

        return {
            ...token,
            accessToken: tokens.access_token,
            expiresAt: Math.floor(Date.now() / 1000 + tokens.expires_in),
            // Fallback to old refresh token if a new one isn't provided
            refreshToken: tokens.refresh_token ?? token.refreshToken,
        };
    } catch (error) {
        console.error("Error refreshing access token", error);
        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        // Load Keycloak only if configured or not in Dev bypass mode
        ...((process.env.KEYCLOAK_ISSUER && !isDev) ? [
            KeycloakProvider({
                clientId: process.env.KEYCLOAK_CLIENT_ID || "",
                clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
                issuer: process.env.KEYCLOAK_ISSUER || "",
            })
        ] : []),
        // Add mock provider only in Development
        ...(isDev ? [
            CredentialsProvider({
                name: "Development Sandbox",
                credentials: {
                    username: { label: "Username", type: "text", placeholder: "admin" },
                    password: { label: "Password", type: "password" }
                },
                async authorize(credentials, req) {
                    return { 
                        id: "dev-mock-id", 
                        name: "Developer", 
                        email: "dev@amrita.edu" 
                    };
                }
            })
        ] : [])
    ],
    callbacks: {
        async jwt({ token, account, profile, trigger, session }) {
            // Initial sign in (Handles both Keycloak and Credentials)
            if (account) {
                // Type safe Keycloak profile extraction
                const keycloakProfile = profile as { 
                    realm_access?: { roles?: string[] };
                    groups?: string[];
                } | undefined;

                return {
                    ...token,
                    accessToken: account.access_token || "mocked-dev-access-token",
                    refreshToken: account.refresh_token || null,
                    expiresAt: account.expires_at || Math.floor(Date.now() / 1000) + 86400, // +1 day mock
                    roles: isDev 
                           ? [(process.env.NEXT_PUBLIC_DEV_USER_ROLE || "ADMIN")] 
                           : (keycloakProfile?.realm_access?.roles || []),
                    groups: keycloakProfile?.groups || [],
                    provider: account.provider,
                } as JWT;
            }

            // Handle manual session updates (if any)
            if (trigger === "update" && session) {
                // Return previous token if session content is invalid
                if (typeof session !== "object" || session === null) return token;

                // Explicitly whitelist non-auth fields that are safe to update from the client
                const updatedToken: JWT = { ...token };
                if (session.name) updatedToken.name = session.name;
                if (session.email) updatedToken.email = session.email;
                if (session.picture) updatedToken.picture = session.picture;
                if (session.user && typeof session.user === "object") {
                    if (session.user.name) updatedToken.name = session.user.name;
                    if (session.user.email) updatedToken.email = session.user.email;
                    if (session.user.image) updatedToken.picture = session.user.image;
                }

                return updatedToken;
            }

            // Fallback for Development Mode (Mocking expiry)
            if (isDev) {
                return token;
            }

            // Return previous token if the access token has not expired yet
            if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000) {
                return token;
            }

            // Access token has expired, try to update it
            return refreshAccessToken(token);
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string;
            // CRITICAL: refreshToken is NOT exposed to the client for security.
            session.error = token.error as string | undefined;

            if (session.user) {
                // If in Development Mode, use the hardcoded role from ENV or default to ADMIN
                session.user.roles = isDev 
                    ? [(process.env.NEXT_PUBLIC_DEV_USER_ROLE || "ADMIN")]
                    : (token.roles as string[]);
                session.user.groups = (token.groups as string[]) || [];
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/login",
    }
});

import NextAuth, { type Account, type User } from "next-auth";
import { type JWT } from "next-auth/jwt";
import KeycloakProvider from "next-auth/providers/keycloak";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * NextAuth Configuration
 * 
 * Supports two modes:
 * 1. Development: Uses CredentialsProvider for a one-click bypass.
 * 2. Production: Uses KeycloakProvider for official OIDC authentication.
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
                async authorize() {
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
                // Determine if we are logging in via Dev Bypass (Credentials)
                const isCredentials = account.provider === "credentials";

                return {
                    ...token,
                    accessToken: account.access_token || "mocked-dev-access-token",
                    refreshToken: account.refresh_token || null,
                    expiresAt: account.expires_at || Math.floor(Date.now() / 1000) + 86400, // +1 day mock
                    roles: isDev 
                           ? [(process.env.NEXT_PUBLIC_DEV_USER_ROLE || "ADMIN")] 
                           : ((profile as any)?.realm_access?.roles || []),
                    groups: (profile as any)?.groups || [],
                    provider: account.provider,
                };
            }

            // Handle manual session updates (if any)
            if (trigger === "update" && session) {
                return { ...token, ...session };
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

import NextAuth from "next-auth";
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

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        KeycloakProvider({
            clientId: process.env.KEYCLOAK_CLIENT_ID || "",
            clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
            issuer: process.env.KEYCLOAK_ISSUER || "",
        }),
        // Add mock provider only in Development
        ...(isDev ? [
            CredentialsProvider({
                name: "Development Bypass",
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
        async jwt({ token, account, profile }) {
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.roles = (profile as any)?.realm_access?.roles || [];
                token.groups = (profile as any)?.groups || [];
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string;
            session.refreshToken = token.refreshToken as string;
            if (session.user) {
                // If in Development Mode, use the hardcoded role from ENV or default to ADMIN
                session.user.roles = isDev 
                    ? [(process.env.NEXT_PUBLIC_DEV_USER_ROLE || "ADMIN") as any]
                    : (token.roles as string[]);
                session.user.groups = token.groups as string[];
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

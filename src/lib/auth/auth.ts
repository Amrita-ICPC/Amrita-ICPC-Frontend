import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import CredentialsProvider from "next-auth/providers/credentials";
import { decodeJwt } from "jose";
import { KeycloakToken, DecodedJWT } from "./types";
import { processDecodedToken, refreshKeycloakAccessToken } from "./utils";
import { logger } from "../logger";
import { env } from "../env";

// Mock credentials for development
const MOCK_USERS = {
    admin: { password: "1234", roles: ["admin"], groups: ["administrators"] },
    instructor: { password: "1234", roles: ["instructor"], groups: ["instructors"] },
    student: { password: "1234", roles: ["student"], groups: ["students"] },
};

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "admin" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const user = MOCK_USERS[credentials.username as keyof typeof MOCK_USERS];
                if (!user || user.password !== credentials.password) {
                    throw new Error("Invalid credentials");
                }

                return {
                    id: credentials.username as string,
                    name: credentials.username as string,
                    email: `${credentials.username}@amrita-icpc.local`,
                    roles: user.roles,
                    groups: user.groups,
                };
            },
        }),
        Keycloak({
            clientId: env.AUTH_KEYCLOAK_ID,
            clientSecret: env.AUTH_KEYCLOAK_SECRET,
            issuer: env.AUTH_KEYCLOAK_ISSUER,
            authorization: {
                params: {
                    prompt: "login",
                    max_age: "0",
                },
            },
        }),
    ],
    pages: {
        signIn: "/auth/login",
    },
    session: {
        strategy: "jwt",
    },
    trustHost: true,
    secret: env.NEXTAUTH_SECRET,
    callbacks: {
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            else if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        },
        async jwt({ token, account, user }) {
            // Handle Credentials provider (mock user)
            if (user && !account) {
                const credentialUser = user as { id: string; roles?: string[]; groups?: string[] };
                return {
                    ...token,
                    id: credentialUser.id,
                    roles: credentialUser.roles || ["student"],
                    groups: credentialUser.groups || ["students"],
                    access_token: `mock-token-${credentialUser.id}`,
                };
            }

            // Initial sign-in with Keycloak
            if (account && user) {
                const decoded = decodeJwt(account.access_token!);
                const { roles, groups } = processDecodedToken(decoded as DecodedJWT);
                // Calculate session expiry based on Keycloak's refresh token expiry
                const refreshExpiresIn =
                    typeof account.refresh_expires_in === "number"
                        ? account.refresh_expires_in
                        : 600;
                const sessionExpiresAt = Math.floor(Date.now() / 1000) + refreshExpiresIn;
                return {
                    ...token,
                    access_token: account.access_token,
                    refresh_token: account.refresh_token,
                    id_token: account.id_token,
                    expires_at: account.expires_at,
                    session_expires_at: sessionExpiresAt,
                    roles: roles,
                    groups: groups,
                    id: account.providerAccountId,
                };
            }
            if (
                token.session_expires_at &&
                typeof token.session_expires_at === "number" &&
                Date.now() > token.session_expires_at * 1000
            ) {
                logger.info("Session has expired based on Keycloak refresh token expiry");
                return null;
            }

            // Token still valid (Credentials or Keycloak)
            if (token.access_token?.startsWith("mock-token-")) {
                return token; // Mock token never expires in dev
            }

            if (token.expires_at && Date.now() < token.expires_at * 1000 - 15 * 1000) {
                return token;
            }

            // Try to refresh Keycloak token
            if (token.refresh_token) {
                const refreshedToken = await refreshKeycloakAccessToken(token as KeycloakToken);
                // If refresh returns null (session expired), invalidate the session
                if (!refreshedToken) {
                    return null;
                }
                return refreshedToken;
            }

            // No refresh token or refresh failed — invalidate session
            return null;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.roles = token.roles as string[];
                session.user.groups = token.groups as string[];
                session.access_token = token.access_token as string;
                if (token.error) {
                    session.error = token.error as string;
                }
            }
            return session;
        },
    },
    events: {
        async signOut(message) {
            if ("token" in message && message.token?.id_token) {
                try {
                    const issuerUrl = env.AUTH_KEYCLOAK_ISSUER;
                    const logoutUrl = new URL(`${issuerUrl}/protocol/openid-connect/logout`);
                    logoutUrl.searchParams.set("id_token_hint", message.token.id_token as string);
                    logoutUrl.searchParams.set("client_id", env.AUTH_KEYCLOAK_ID);

                    const response = await fetch(logoutUrl, { method: "GET" });
                    if (response.ok) {
                        logger.info("Keycloak session terminated successfully");
                    } else {
                        logger.error(
                            {
                                status: response.status,
                                statusText: response.statusText,
                            },
                            "Keycloak logout failed",
                        );
                    }
                    logger.info("Keycloak session terminated successfully");
                } catch (error) {
                    logger.error({ err: error }, "Error terminating Keycloak session");
                }
            }
        },
    },
});

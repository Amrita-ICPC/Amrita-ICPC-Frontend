import { decodeJwt } from "jose";
import NextAuth, { type Account, type NextAuthOptions, type User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { getServerSession } from "next-auth/next";
import Keycloak from "next-auth/providers/keycloak";

import { env } from "@/lib/env";

import { logger } from "../logger";
import type { DecodedJWT, KeycloakToken } from "./types";
import { processDecodedToken, refreshKeycloakAccessToken } from "./utils";

export const authOptions: NextAuthOptions = {
    providers: [
        Keycloak({
            clientId: env.AUTH_KEYCLOAK_ID,
            clientSecret: env.AUTH_KEYCLOAK_SECRET,
            issuer: env.AUTH_KEYCLOAK_ISSUER,
            authorization: {
                params: {
                    prompt: "login",
                    max_age: 0,
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
    secret: env.NEXTAUTH_SECRET,
    callbacks: {
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            else if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        },
        async jwt({
            token,
            account,
            user,
        }: {
            token: JWT;
            account: Account | null;
            user: User | null;
        }) {
            // Initial sign-in
            if (account && user) {
                const decoded = decodeJwt(account.access_token!);
                const { groups, permissions } = processDecodedToken(decoded as DecodedJWT);
                const keycloakAccount = account as Account & {
                    refresh_expires_in?: number;
                };
                const refreshExpiresIn =
                    typeof keycloakAccount.refresh_expires_in === "number"
                        ? keycloakAccount.refresh_expires_in
                        : 600;
                const sessionExpiresAt = Math.floor(Date.now() / 1000) + refreshExpiresIn;
                return {
                    ...token,
                    access_token: account.access_token,
                    refresh_token: account.refresh_token,
                    id_token: account.id_token,
                    expires_at: account.expires_at,
                    session_expires_at: sessionExpiresAt,
                    groups,
                    roles: permissions,
                    id: account.providerAccountId,
                };
            }

            // Session lifetime exceeded
            if (
                token.session_expires_at &&
                typeof token.session_expires_at === "number" &&
                Date.now() > token.session_expires_at * 1000
            ) {
                logger.info("Session has expired based on Keycloak refresh token expiry");
                return {
                    ...token,
                    error: "SessionExpired",
                };
            }

            // Access token still valid
            if (token.expires_at && Date.now() < (token.expires_at as number) * 1000 - 15 * 1000) {
                return token;
            }

            // Try to refresh
            if (token.refresh_token) {
                const refreshed = await refreshKeycloakAccessToken(token as KeycloakToken);
                if (!refreshed) {
                    return {
                        ...token,
                        error: "RefreshAccessTokenError",
                    };
                }
                return refreshed as JWT;
            }

            return token;
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
        async signOut(message: { token: JWT; [key: string]: unknown }) {
            const token = message.token;
            if (token?.id_token) {
                try {
                    const logoutUrl = new URL(
                        `${env.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/logout`,
                    );
                    logoutUrl.searchParams.set("id_token_hint", token.id_token as string);
                    logoutUrl.searchParams.set("client_id", env.AUTH_KEYCLOAK_ID);

                    const response = await fetch(logoutUrl, { method: "GET" });
                    if (response.ok) {
                        logger.info("Keycloak session terminated successfully");
                    } else {
                        logger.error("Keycloak logout failed", {
                            status: response.status,
                            statusText: response.statusText,
                        });
                    }
                } catch (error) {
                    logger.error("Error terminating Keycloak session", { err: error });
                }
            }
        },
    },
};

export async function auth() {
    return getServerSession(authOptions);
}

const handler = NextAuth(authOptions);

export const handlers = {
    GET: handler,
    POST: handler,
};

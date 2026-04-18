/**
 * Environment variable validation using @t3-oss/env-nextjs (which re-exports
 * @t3-oss/env-core's createEnv). We use the core API directly so we can pass
 * `runtimeEnv` — the validation and type-safety benefit is identical.
 */
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    /**
     * Server-side environment variables.
     * Never bundled into the client — Next.js strips these at build time.
     */
    server: {
        NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
        NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
        NEXTAUTH_URL: z.string().url().optional(),
        AUTH_KEYCLOAK_ID: z.string().min(1, "AUTH_KEYCLOAK_ID is required"),
        AUTH_KEYCLOAK_SECRET: z.string().min(1, "AUTH_KEYCLOAK_SECRET is required"),
        AUTH_KEYCLOAK_ISSUER: z.string().url("AUTH_KEYCLOAK_ISSUER must be a valid URL"),
        FEATURE_FLAGS: z.string().optional(),
    },

    /**
     * Public client-side environment variables.
     * Next.js inlines NEXT_PUBLIC_* at build time — safe to access in the browser.
     */
    clientPrefix: "NEXT_PUBLIC_",
    client: {
        NEXT_PUBLIC_API_URL: z.string().url("NEXT_PUBLIC_API_URL must be a valid URL"),
        NEXT_PUBLIC_FEATURE_FLAGS: z.string().optional(),
    },

    /**
     * Explicit mapping of process.env values required by @t3-oss/env-core.
     */
    runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        AUTH_KEYCLOAK_ID: process.env.AUTH_KEYCLOAK_ID,
        AUTH_KEYCLOAK_SECRET: process.env.AUTH_KEYCLOAK_SECRET,
        AUTH_KEYCLOAK_ISSUER: process.env.AUTH_KEYCLOAK_ISSUER,
        FEATURE_FLAGS: process.env.FEATURE_FLAGS,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_FEATURE_FLAGS: process.env.NEXT_PUBLIC_FEATURE_FLAGS,
    },
});

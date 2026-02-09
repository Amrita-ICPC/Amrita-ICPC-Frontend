import "server-only";
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
    NEXTAUTH_URL: z.string().url().optional(),
    AUTH_KEYCLOAK_ID: z.string().min(1, "AUTH_KEYCLOAK_ID is required"),
    AUTH_KEYCLOAK_SECRET: z.string().min(1, "AUTH_KEYCLOAK_SECRET is required"),
    AUTH_KEYCLOAK_ISSUER: z.string().url("AUTH_KEYCLOAK_ISSUER must be a valid URL"),
    FEATURE_FLAGS: z.string().optional(),
    NEXT_PUBLIC_FEATURE_FLAGS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("Invalid environment variables:\n", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
}

export const env = parsed.data;

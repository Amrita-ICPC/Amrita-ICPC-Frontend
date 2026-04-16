import { z } from "zod";

const publicEnvSchema = z.object({
    NEXT_PUBLIC_API_URL: z.string().url("NEXT_PUBLIC_API_URL must be a valid URL"),
});

const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

if (!parsed.success) {
    console.error("Invalid public environment variables:\n", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid public environment variables");
}

export const publicEnv = parsed.data;

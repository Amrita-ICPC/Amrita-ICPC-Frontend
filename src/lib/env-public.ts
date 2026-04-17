import { z } from "zod";

const publicEnvSchema = z.object({
    NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:8000"),
    NEXT_PUBLIC_FEATURE_FLAGS: z.string().optional(),
});

// Access process.env directly on the client, or via publicRuntimeConfig if configured
const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_FEATURE_FLAGS: process.env.NEXT_PUBLIC_FEATURE_FLAGS,
});

if (!parsed.success) {
    console.error("Invalid public environment variables:\n", parsed.error.flatten().fieldErrors);
    // On client side, we might not want to throw and crash the whole app if one public env is missing,
    // but for consistency with existing env.ts, we'll follow similar logic if critical.
    // throw new Error('Invalid public environment variables');
}

export const publicEnv = parsed.success
    ? parsed.data
    : {
          NEXT_PUBLIC_API_URL: "http://localhost:8000",
          NEXT_PUBLIC_FEATURE_FLAGS: "",
      };

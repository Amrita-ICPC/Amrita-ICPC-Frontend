import "server-only";

import axios, { AxiosHeaders, type AxiosInstance } from "axios";

import { auth } from "@/lib/auth/auth";
import { env } from "@/lib/env";

/**
 * Server-side Axios client factory.
 * Creates a fresh instance per call to avoid leaking auth headers across requests.
 */
export async function getServerApiClient(): Promise<AxiosInstance> {
    const session = await auth();

    if (!session?.access_token) {
        throw new Error("Unauthorized");
    }

    const headers = new AxiosHeaders({
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
    });

    return axios.create({
        baseURL: env.NEXT_PUBLIC_API_URL,
        headers,
    });
}

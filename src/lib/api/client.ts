"use client";

import axios, {
    AxiosError,
    AxiosHeaders,
    AxiosRequestConfig,
    AxiosResponse,
    type InternalAxiosRequestConfig,
} from "axios";
import { getSession, signOut } from "next-auth/react";
import { env } from "@/lib/env";

export const api = axios.create({
    baseURL: env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const session = await getSession();
    const accessToken = session?.access_token;

    if (accessToken) {
        const headers =
            config.headers instanceof AxiosHeaders
                ? config.headers
                : AxiosHeaders.from(config.headers);
        headers.set("Authorization", `Bearer ${accessToken}`);
        config.headers = headers;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        // `error.config` can be undefined in Axios v1 (e.g. for network errors before
        // a request is dispatched), so guard before accessing it.
        if (!error.config) {
            return Promise.reject(error);
        }

        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // next-auth v5 beta automatically handles token refresh in the jwt callback
            // when we call getSession(), it triggers the jwt callback if the token is expired.
            const session = await getSession();

            if (session?.access_token) {
                // Use AxiosHeaders API to safely set the Authorization header; Axios v1
                // uses AxiosHeaders instances internally and direct assignment can fail.
                const headers = AxiosHeaders.from(
                    originalRequest.headers as Record<string, string> | undefined,
                );
                headers.set("Authorization", `Bearer ${session.access_token}`);
                originalRequest.headers = headers;
                return api(originalRequest);
            } else {
                // If we still don't have a token, the refresh failed or session is dead.
                await signOut({ callbackUrl: "/auth/login" });
            }
        }

        return Promise.reject(error);
    },
);

export const axiosWithAuth = <T>(config: AxiosRequestConfig): Promise<T> => {
    return api(config).then((response: AxiosResponse<T>) => response.data);
};

export default axiosWithAuth;

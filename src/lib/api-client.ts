import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { getSession, signOut } from "next-auth/react";
import { env } from "@/lib/env";

export const axiosInstance = axios.create({
    baseURL: env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    async (config) => {
        const session = await getSession();
        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // next-auth v5 beta automatically handles token refresh in the jwt callback
            // when we call getSession(), it triggers the jwt callback if the token is expired.
            const session = await getSession();

            if (session?.access_token) {
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
                }
                return axiosInstance(originalRequest);
            } else {
                // If we still don't have a token, the refresh failed or session is dead.
                await signOut({ callbackUrl: "/auth/login" });
            }
        }

        return Promise.reject(error);
    },
);

export const axiosWithAuth = <T>(config: AxiosRequestConfig): Promise<T> => {
    return axiosInstance(config).then((response: AxiosResponse<T>) => response.data);
};

export default axiosWithAuth;

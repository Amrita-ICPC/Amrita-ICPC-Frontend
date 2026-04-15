"use client";

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";

// Create axios instance with base config
const createAxiosInstance = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL || "http://10.10.10.23:8000",
        timeout: 30000,
        headers: {
            "Content-Type": "application/json",
        },
    });

    // Request interceptor: add auth token
    instance.interceptors.request.use(
        async (config) => {
            const session = await getSession();
            if (session?.access_token) {
                config.headers.Authorization = `Bearer ${session.access_token}`;
                console.debug({ url: config.url }, "Adding auth token to request");
            }
            return config;
        },
        (error) => {
            console.error({ error }, "Request interceptor error");
            return Promise.reject(error);
        },
    );

    // Response interceptor: handle errors
    instance.interceptors.response.use(
        (response) => {
            // Log successful API calls
            console.debug(
                { url: response.config.url, status: response.status },
                "API call successful",
            );
            return response;
        },
        (error: AxiosError) => {
            const { response, config } = error;

            if (response?.status === 401) {
                console.warn(
                    { url: config?.url },
                    "Unauthorized (401) - user session may have expired",
                );
                // Optionally trigger re-login flow here
            } else if (response?.status === 403) {
                console.warn({ url: config?.url }, "Forbidden (403) - user lacks permissions");
            } else if (response?.status === 404) {
                console.debug({ url: config?.url }, "Resource not found (404)");
            } else if (response?.status && response.status >= 500) {
                console.error({ url: config?.url, status: response.status }, "Server error");
            }

            return Promise.reject(error);
        },
    );

    return instance;
};

// Export singleton instance
export const apiClient = createAxiosInstance();

/**
 * Wrapper for API calls with automatic error handling
 * Logs all API interactions for debugging
 */
export const api = {
    get: async <T = unknown>(url: string, config?: AxiosRequestConfig) => {
        try {
            console.info({ url, method: "GET" }, "API request");
            const response = await apiClient.get<T>(url, config);
            return response.data;
        } catch (error) {
            console.error({ url, error, method: "GET" }, "API request failed");
            throw error;
        }
    },

    post: async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
        try {
            console.info({ url, method: "POST" }, "API request");
            const response = await apiClient.post<T>(url, data, config);
            return response.data;
        } catch (error) {
            console.error({ url, error, method: "POST" }, "API request failed");
            throw error;
        }
    },

    patch: async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
        try {
            console.info({ url, method: "PATCH" }, "API request");
            const response = await apiClient.patch<T>(url, data, config);
            return response.data;
        } catch (error) {
            console.error({ url, error, method: "PATCH" }, "API request failed");
            throw error;
        }
    },

    put: async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
        try {
            console.info({ url, method: "PUT" }, "API request");
            const response = await apiClient.put<T>(url, data, config);
            return response.data;
        } catch (error) {
            console.error({ url, error, method: "PUT" }, "API request failed");
            throw error;
        }
    },

    delete: async <T = unknown>(url: string, config?: AxiosRequestConfig) => {
        try {
            console.info({ url, method: "DELETE" }, "API request");
            const response = await apiClient.delete<T>(url, config);
            return response.data;
        } catch (error) {
            console.error({ url, error, method: "DELETE" }, "API request failed");
            throw error;
        }
    },
};

export default apiClient;

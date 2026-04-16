"use client";

import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";
import { publicEnv } from "../public-env";

export const apiClient = axios.create({
    baseURL: publicEnv.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
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

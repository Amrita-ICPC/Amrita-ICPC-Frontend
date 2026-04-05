import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { getSession, signIn } from 'next-auth/react';

/**
 * Global Axios Instance
 * Handles JWT injection and automatic 401 token refresh.
 */
const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const session = await getSession();

        if (session && session.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        console.error('[Axios Error Global Hook]', error.message, error.response?.data);
        return Promise.reject(error);
    }
);

const refreshAuthLogic = async (failedRequest: any) => {
    try {
        const session = await getSession();
        const refreshToken = session?.refreshToken;

        if (!refreshToken) {
            throw new Error("No refresh token available");
        }

        const tokenRefreshResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/refresh`, {
            refresh_token: refreshToken
        });

        const newAccessToken = tokenRefreshResponse.data.access_token;

        failedRequest.response.config.headers.Authorization = `Bearer ${newAccessToken}`;

        return Promise.resolve();
    } catch (err) {
        console.error("Token refresh failed. Redirecting to login.", err);
        if (typeof window !== 'undefined') {
            signIn('keycloak');
        }
        return Promise.reject(err);
    }
};

createAuthRefreshInterceptor(axiosInstance, refreshAuthLogic, {
    statusCodes: [401],
});

export const axiosWithAuth = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
    const source = axios.CancelToken.source();

    const promise = axiosInstance({
        ...config,
        ...options,
        cancelToken: source.token,
    }).then(({ data }) => data);

    // Allow Orval to cancel requests if needed
    // @ts-ignore
    promise.cancel = () => {
        source.cancel('Query was cancelled');
    };

    return promise;
};

export default axiosInstance;

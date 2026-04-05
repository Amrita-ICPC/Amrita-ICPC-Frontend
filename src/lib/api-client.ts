import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { getSession, signIn } from 'next-auth/react';

/**
 * Global Axios Instance
 */
const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Passive token storage set by AxiosAuthProvider
let currentToken: string | null = null;

export const setAxiosToken = (token: string | null) => {
    currentToken = token;
};

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Use passively stored token to avoid N+1 /api/auth/session requests
        if (currentToken) {
            config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const isDev = process.env.NEXT_PUBLIC_APP_MODE === "Development";
        
        if (isDev) {
            console.error('[Axios Error Global Hook]', error.message, error.response?.data);
        } else {
            // Production: Sanitize logs to avoid PII or token leakage
            console.error('[Axios Error]', error.message, { 
                status: error.response?.status,
                endpoint: error.config?.url 
            });
        }
        return Promise.reject(error);
    }
);


/**
 * Refresh Authentication Logic
 */
const refreshAuthLogic = async (failedRequest: { response: { config: { headers: { Authorization: string } } } }) => {
    try {
        // Explicitly fetch the session for token rotation only when 401 occurs
        const session = await getSession();
        
        if (!session?.accessToken || session.error === "RefreshAccessTokenError") {
            throw new Error("Session expired or refresh failed");
        }

        // Update local memory and the failed request
        setAxiosToken(session.accessToken);
        failedRequest.response.config.headers.Authorization = `Bearer ${session.accessToken}`;
        
        return Promise.resolve();
    } catch (err) {
        console.error("[Axios] Token refresh failed. Triggering re-auth.", err);
        
        if (typeof window !== 'undefined') {
            const isDev = process.env.NEXT_PUBLIC_APP_MODE === "Development";
            signIn(isDev ? 'credentials' : 'keycloak');
        }
        return Promise.reject(err);
    }
};

createAuthRefreshInterceptor(axiosInstance, refreshAuthLogic, {
    statusCodes: [401],
});

export const axiosWithAuth = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
    const abortController = new AbortController();

    // Preserve caller's signal (from Orval/React Query) or fallback to internal controller
    const signal = config.signal ?? options?.signal ?? abortController.signal;

    const promise = axiosInstance({
        ...config,
        ...options,
        signal,
    }).then(({ data }) => data) as Promise<T> & { cancel?: () => void };

    // Internal cancellation helper
    promise.cancel = () => {
        abortController.abort('Query was cancelled');
    };

    return promise;
};

export default axiosInstance;

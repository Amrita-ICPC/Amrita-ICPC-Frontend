"use client";

import { apiClient } from "./api/client";
import { type AxiosRequestConfig } from "axios";

/**
 * Custom mutator for Orval generated API clients.
 * Wraps the base apiClient to provide the expected interface for Orval.
 * 
 * @param config Axios request configuration
 * @returns Promise resolving to the response data
 */
export const axiosWithAuth = <T>(config: AxiosRequestConfig): Promise<T> => {
    return apiClient(config).then((response) => response.data);
};

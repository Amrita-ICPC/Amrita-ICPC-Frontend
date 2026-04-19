// This file is intentionally kept as a stable Orval mutator entry.
// Orval expects a concrete named export (not just a re-export).

import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { api } from "./api/client";

export const axiosWithAuth = <T>(config: AxiosRequestConfig): Promise<T> => {
    return api(config).then((response: AxiosResponse<T>) => response.data);
};

export default axiosWithAuth;

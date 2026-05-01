import { AxiosError } from "axios";
import { ApiError, ApiErrorResponse } from "./api-error";

/**
 * Normalizes any error into a standard ApiError instance.
 * Handles Axios errors, standard backend error responses, and generic JS errors.
 */
export function handleApiError(error: unknown): ApiError {
    // If it's already an ApiError, just return it
    if (error instanceof ApiError) {
        return error;
    }

    // Handle Axios errors (most common for API calls)
    if (error instanceof AxiosError) {
        const data = error.response?.data;

        // If the response matches our standard backend error structure or has meta/error fields
        if (
            data &&
            typeof data === "object" &&
            (typeof data.success === "boolean" || data.meta || data.error)
        ) {
            return new ApiError(data as ApiErrorResponse);
        }

        // Fallback for non-standard Axios errors (e.g., Network Error, Timeout, 500 without body)
        const headerRequestId =
            error.response?.headers?.["x-request-id"] ||
            error.response?.headers?.["X-Request-ID"] ||
            error.config?.headers?.["X-Request-ID"] ||
            error.config?.headers?.["x-request-id"];

        return new ApiError({
            success: false,
            status: error.response?.status ?? 500,
            message: error.message || "An unexpected network error occurred",
            error: {
                code: error.code || "NETWORK_ERROR",
                details: [error.message],
            },
            meta: {
                // Try to extract request_id even from non-standard responses if it exists
                request_id:
                    (data as any)?.meta?.request_id ||
                    (data as any)?.request_id ||
                    headerRequestId ||
                    "N/A",
                timestamp: (data as any)?.meta?.timestamp || new Date().toISOString(),
            },
        });
    }

    // Handle generic JavaScript Errors
    if (error instanceof Error) {
        return new ApiError({
            success: false,
            status: 500,
            message: error.message,
            error: {
                code: "CLIENT_ERROR",
                details: [error.message],
            },
            meta: {
                request_id: "CLIENT",
                timestamp: new Date().toISOString(),
            },
        });
    }

    // Ultimate fallback for anything else
    return new ApiError({
        success: false,
        status: 500,
        message: "An unknown error occurred",
        error: {
            code: "UNKNOWN",
            details: [],
        },
        meta: {
            request_id: "UNKNOWN",
            timestamp: new Date().toISOString(),
        },
    });
}

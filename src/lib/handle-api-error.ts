import axios from "axios";

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
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        const normalized = normalizeErrorResponse(data, error.response?.status);
        if (normalized) return new ApiError(normalized);

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

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function humanizeField(field: string) {
    return field
        .replace(/\[(\d+)\]/g, " $1 ")
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
        .trim();
}

function formatApiMessage(message: string) {
    const formatted = message
        .replace(/\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/gi, (identifier) =>
            identifier.replaceAll("_", " "),
        )
        .replace(/\s+/g, " ")
        .trim();

    if (!formatted) return "Request failed";
    const sentence = formatted[0].toUpperCase() + formatted.slice(1);
    return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
}

function normalizeDetail(detail: unknown): ApiErrorResponse["error"]["details"] {
    if (isRecord(detail) && !("loc" in detail) && !("msg" in detail)) {
        return Object.entries(detail).flatMap(([field, value]) => {
            const messages = Array.isArray(value) ? value : [value];
            return messages.map((message) => ({
                loc: [field],
                msg: `${humanizeField(field)}: ${formatApiMessage(String(message))}`,
            }));
        });
    }
    if (!Array.isArray(detail)) {
        if (detail == null) return [];
        return [typeof detail === "string" ? formatApiMessage(detail) : detail];
    }

    return detail.map((item) => {
        if (!isRecord(item)) return item;

        const location = Array.isArray(item.loc)
            ? item.loc.filter((part) => !["body", "query", "path"].includes(String(part)))
            : [];
        const field = location.map(String).join(".");
        const message =
            (typeof item.msg === "string" && item.msg) ||
            (typeof item.message === "string" && item.message) ||
            "Invalid value";

        return {
            ...item,
            loc: location,
            msg: field
                ? `${humanizeField(field)}: ${formatApiMessage(message)}`
                : formatApiMessage(message),
        };
    });
}

function normalizeErrorResponse(data: unknown, responseStatus?: number): ApiErrorResponse | null {
    if (typeof data === "string" && data.trim()) {
        return createErrorResponse(data.trim(), responseStatus);
    }
    if (!isRecord(data)) return null;

    const nestedError = isRecord(data.error) ? data.error : null;
    const detail = data.detail ?? data.errors ?? nestedError?.details;
    const details = normalizeDetail(detail);
    const firstDetail = details[0];
    const firstDetailMessage =
        typeof firstDetail === "string"
            ? firstDetail
            : isRecord(firstDetail) && typeof firstDetail.msg === "string"
              ? firstDetail.msg
              : undefined;
    const rawMessage =
        (typeof data.message === "string" && data.message) ||
        (typeof data.detail === "string" && data.detail) ||
        (typeof data.error === "string" && data.error) ||
        (nestedError && typeof nestedError.message === "string" && nestedError.message) ||
        firstDetailMessage ||
        "Request failed";
    const message = formatApiMessage(rawMessage);
    const meta = isRecord(data.meta) ? data.meta : null;

    return {
        success: false,
        status: typeof data.status === "number" ? data.status : (responseStatus ?? 500),
        message,
        error: {
            code:
                (nestedError && typeof nestedError.code === "string" && nestedError.code) ||
                (typeof data.code === "string" && data.code) ||
                "REQUEST_ERROR",
            details,
        },
        meta: {
            request_id:
                (meta && typeof meta.request_id === "string" && meta.request_id) ||
                (typeof data.request_id === "string" && data.request_id) ||
                "N/A",
            timestamp:
                (meta && typeof meta.timestamp === "string" && meta.timestamp) ||
                new Date().toISOString(),
        },
    };
}

function createErrorResponse(message: string, status = 500): ApiErrorResponse {
    const formattedMessage = formatApiMessage(message);
    return {
        success: false,
        status,
        message: formattedMessage,
        error: { code: "REQUEST_ERROR", details: [formattedMessage] },
        meta: { request_id: "N/A", timestamp: new Date().toISOString() },
    };
}

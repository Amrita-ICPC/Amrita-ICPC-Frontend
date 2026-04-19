import axios from "axios";

export class ApiError extends Error {
    status?: number;
    detail?: string;

    constructor(message: string, options?: { status?: number; detail?: string }) {
        super(message);
        this.name = "ApiError";
        this.status = options?.status;
        this.detail = options?.detail;
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export function toApiError(error: unknown): ApiError {
    if (error instanceof ApiError) return error;

    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;

        if (isRecord(data)) {
            const message =
                (typeof data.message === "string" && data.message) ||
                (typeof data.detail === "string" && data.detail) ||
                error.message ||
                "Request failed";

            const detail = typeof data.detail === "string" ? data.detail : undefined;
            return new ApiError(message, { status, detail });
        }

        return new ApiError(error.message || "Request failed", { status });
    }

    if (error instanceof Error) {
        return new ApiError(error.message || "Request failed");
    }

    return new ApiError("Request failed");
}

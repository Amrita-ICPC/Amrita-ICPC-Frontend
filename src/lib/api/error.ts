import { handleApiError } from "@/lib/handle-api-error";

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

export function toApiError(error: unknown): ApiError {
    if (error instanceof ApiError) return error;
    const normalized = handleApiError(error);
    return new ApiError(normalized.message, {
        status: normalized.status,
        detail: normalized.errors[0]?.message,
    });
}

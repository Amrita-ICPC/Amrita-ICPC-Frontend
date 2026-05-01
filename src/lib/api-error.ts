export interface ApiErrorDetail {
    field?: string;
    message: string;
    code?: string;
    raw?: any;
}

export interface ApiErrorResponse {
    success: boolean;
    status: number;
    message: string;
    error: {
        code: string;
        details: any[];
    };
    meta: {
        request_id: string;
        timestamp: string;
    };
}

export class ApiError extends Error {
    public status: number;
    public code: string;
    public errors: ApiErrorDetail[];
    public requestId?: string;
    public raw: any;

    constructor(response: Partial<ApiErrorResponse> & { message: string; status: number }) {
        super(response.message);
        this.name = "ApiError";
        this.status = response.status;
        this.code = response.error?.code || "UNKNOWN_ERROR";
        this.requestId =
            response.meta?.request_id ||
            (response as any).request_id ||
            (response as any).requestId;
        this.raw = response;

        // Process details into flattened errors
        const details = response.error?.details || [];
        this.errors = details.map((detail) => {
            if (typeof detail === "string") {
                return { message: detail };
            }

            // Handle Pydantic/FastAPI validation error objects
            if (detail && typeof detail === "object" && ("loc" in detail || "msg" in detail)) {
                const loc = (detail as any).loc;
                const field = Array.isArray(loc)
                    ? loc.filter((l: any) => !["body", "query", "path"].includes(l)).join(".")
                    : undefined;

                return {
                    field: field || "general",
                    message: (detail as any).msg || "Invalid value",
                    code: (detail as any).type,
                    raw: detail,
                };
            }

            return {
                message: typeof detail === "object" ? JSON.stringify(detail) : String(detail),
                raw: detail,
            };
        });
    }

    /**
     * Helper to get a specific field error message
     */
    getFieldError(field: string): string | undefined {
        return this.errors.find((e) => e.field === field)?.message;
    }
}

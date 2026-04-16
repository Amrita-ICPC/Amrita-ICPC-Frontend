// Generic API wrapper
export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T;
    pagination?: Pagination;
    meta?: Meta;
}

// Pagination
export interface Pagination {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

// Meta
export interface Meta {
    request_id: string;
    timestamp: string;
}

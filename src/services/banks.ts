/**
 * Banks service - handles all question bank-related API calls
 * Provides CRUD operations for question bank management
 */

import { api } from "@/lib/api-client";

export interface Bank {
    id: string;
    name: string;
    description?: string;
    created_by?: string;
    created_at?: string;
    updated_at?: string;
    question_count?: number;
    shared_with?: number;
    is_public?: boolean;
}

export interface CreateBankPayload {
    name: string;
    description?: string;
}

export interface UpdateBankPayload {
    name?: string;
    description?: string;
}

/**
 * Create new question bank (instructor only)
 */
export async function createBank(payload: CreateBankPayload): Promise<Bank> {
    return api.post("/api/v1/banks", payload);
}

/**
 * Get all banks (with pagination)
 * Returns paginated results with summary stats
 */
export async function getAllBanks(
    page = 1,
    page_size = 10,
): Promise<{ data: Bank[]; total: number }> {
    return api.get(`/api/v1/banks?page=${page}&page_size=${page_size}`);
}

/**
 * Get single bank by ID with full metadata
 */
export async function getBankById(id: string): Promise<Bank> {
    return api.get(`/api/v1/banks/${id}`);
}

/**
 * Update existing bank metadata
 */
export async function updateBank(id: string, payload: UpdateBankPayload): Promise<Bank> {
    return api.patch(`/api/v1/banks/${id}`, payload);
}

/**
 * Delete bank (instructor only)
 */
export async function deleteBank(id: string): Promise<void> {
    return api.delete(`/api/v1/banks/${id}`);
}

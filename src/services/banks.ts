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

/**
 * Question types and interfaces
 */
export interface Question {
    id: string;
    bank_id?: string;
    title: string;
    statement?: string;
    difficulty?: "easy" | "medium" | "hard";
    language?: string;
    time_limit?: number;
    memory_limit?: number;
    created_at?: string;
    updated_at?: string;
    author?: string;
}

export interface BankQuestion extends Question {
    order?: number;
}

export interface AddQuestionPayload {
    question_id: string;
}

/**
 * Get all questions in a bank
 */
export async function getBankQuestions(
    bankId: string,
    page = 1,
    page_size = 10,
): Promise<{
    data: BankQuestion[];
    total: number;
}> {
    return api.get(`/api/v1/banks/${bankId}/questions?page=${page}&page_size=${page_size}`);
}

/**
 * Get single question from bank
 */
export async function getBankQuestion(bankId: string, questionId: string): Promise<BankQuestion> {
    return api.get(`/api/v1/banks/${bankId}/questions/${questionId}`);
}

/**
 * Add question to bank
 */
export async function addQuestionToBank(
    bankId: string,
    payload: AddQuestionPayload,
): Promise<BankQuestion> {
    return api.post(`/api/v1/banks/${bankId}/questions`, payload);
}

/**
 * Remove question from bank
 */
export async function removeQuestionFromBank(bankId: string, questionId: string): Promise<void> {
    return api.delete(`/api/v1/banks/${bankId}/questions/${questionId}`);
}

/**
 * Bank sharing types
 */
export interface SharedUser {
    user_id: string;
    name?: string;
    email?: string;
    shared_at?: string;
}

export interface ShareBankPayload {
    user_id: string;
}

/**
 * Get users a bank is shared with
 */
export async function getBankSharedUsers(bankId: string): Promise<SharedUser[]> {
    return api.get(`/api/v1/banks/${bankId}/shared-users`);
}

/**
 * Share bank with a user
 */
export async function shareBankWithUser(
    bankId: string,
    payload: ShareBankPayload,
): Promise<SharedUser> {
    return api.post(`/api/v1/banks/${bankId}/share`, payload);
}

/**
 * Unshare bank from a user
 */
export async function unshareBankFromUser(bankId: string, userId: string): Promise<void> {
    return api.post(`/api/v1/banks/${bankId}/unshare`, { user_id: userId });
}

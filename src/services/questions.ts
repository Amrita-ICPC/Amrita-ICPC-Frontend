/**
 * Questions service - handles all global question-related API calls
 * Provides CRUD operations for question management
 */

import { api } from "@/lib/api-client";

export interface CreateQuestionPayload {
    title: string;
    statement?: string;
    difficulty?: "easy" | "medium" | "hard";
    language?: string;
    time_limit?: number;
    memory_limit?: number;
}

export interface UpdateQuestionPayload {
    title?: string;
    statement?: string;
    difficulty?: "easy" | "medium" | "hard";
    language?: string;
    time_limit?: number;
    memory_limit?: number;
}

export interface ProgrammingLanguage {
    id: string;
    name: string;
    version?: string;
}

/**
 * Get platform-supported programming languages
 */
export async function getPlatformLanguages(): Promise<ProgrammingLanguage[]> {
    return api.get("/api/v1/questions/languages/platform");
}

/**
 * Get Judge0-supported programming languages
 */
export async function getJudge0Languages(): Promise<ProgrammingLanguage[]> {
    return api.get("/api/v1/questions/languages/judge0");
}

/**
 * Create new question (instructor only)
 */
export async function createQuestion(payload: CreateQuestionPayload) {
    return api.post("/api/v1/questions", payload);
}

/**
 * Get question by ID
 */
export async function getQuestionById(id: string) {
    return api.get(`/api/v1/questions/${id}`);
}

/**
 * Update question
 */
export async function updateQuestion(id: string, payload: UpdateQuestionPayload) {
    return api.patch(`/api/v1/questions/${id}`, payload);
}

/**
 * Delete question
 */
export async function deleteQuestion(id: string): Promise<void> {
    return api.delete(`/api/v1/questions/${id}`);
}

/**
 * Questions service - handles all global question-related API calls
 * Provides CRUD operations for question management
 */

import { api } from "@/lib/api-client";

export interface TestCase {
    input: string;
    output: string;
    is_hidden?: boolean;
    weight?: number;
    order?: number;
}

export interface ProgrammingTemplate {
    starter_code?: string;
    driver_code?: string;
    solution_code?: string;
}

export interface CreateQuestionPayload {
    title: string;
    statement?: string;
    difficulty?: "easy" | "medium" | "hard";
    language?: string;
    time_limit?: number;
    memory_limit?: number;
    allowed_languages?: string[];
    tag_ids?: string[];
    test_cases?: TestCase[];
    templates?: Record<string, ProgrammingTemplate>;
}

export interface UpdateQuestionPayload {
    title?: string;
    statement?: string;
    difficulty?: "easy" | "medium" | "hard";
    language?: string;
    time_limit?: number;
    memory_limit?: number;
    allowed_languages?: string[];
    tag_ids?: string[];
    test_cases?: TestCase[];
    templates?: Record<string, ProgrammingTemplate>;
}

export interface ProgrammingLanguage {
    id: string;
    name: string;
    version?: string;
}

export interface Question {
    id: string;
    title: string;
    statement?: string;
    difficulty?: "easy" | "medium" | "hard";
    language?: string;
    time_limit?: number;
    memory_limit?: number;
    allowed_languages?: string[];
    tag_ids?: string[];
    test_cases?: TestCase[];
    templates?: Record<string, ProgrammingTemplate>;
    author?: string;
    created_at?: string;
    updated_at?: string;
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
export async function createQuestion(payload: CreateQuestionPayload): Promise<Question> {
    return api.post("/api/v1/questions", payload);
}

/**
 * Get question by ID
 */
export async function getQuestionById(id: string): Promise<Question> {
    return api.get(`/api/v1/questions/${id}`);
}

/**
 * Update question
 */
export async function updateQuestion(
    id: string,
    payload: UpdateQuestionPayload,
): Promise<Question> {
    return api.patch(`/api/v1/questions/${id}`, payload);
}

/**
 * Delete question
 */
export async function deleteQuestion(id: string): Promise<void> {
    return api.delete(`/api/v1/questions/${id}`);
}

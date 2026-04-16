/**
 * Submissions service - handles all submission-related API calls
 * Provides CRUD operations and submission management
 */

import { api } from "@/lib/api-client";

export interface SubmissionLanguage {
    language: string;
    version?: string;
}

export interface Submission {
    id: string;
    contest_id: string;
    question_id: string;
    user_id: string;
    user_name?: string;
    code: string;
    language: string;
    status:
        | "pending"
        | "accepted"
        | "rejected"
        | "runtime_error"
        | "time_limit_exceeded"
        | "compilation_error";
    score?: number;
    execution_time?: number;
    memory_used?: number;
    error_message?: string;
    created_at?: string;
    updated_at?: string;
}

export interface SubmissionPayload {
    code: string;
    language: string;
}

export interface SubmissionsListResponse {
    items: Submission[];
    total: number;
    page: number;
    per_page: number;
}

/**
 * Submit code for a question
 */
export async function submitCode(
    contestId: string,
    questionId: string,
    payload: SubmissionPayload,
): Promise<Submission> {
    return api.post(`/api/v1/contests/${contestId}/questions/${questionId}/submissions`, payload);
}

/**
 * Get list of submissions for a question
 */
export async function getSubmissionsList(
    contestId: string,
    questionId: string,
    page = 1,
    perPage = 20,
): Promise<SubmissionsListResponse> {
    return api.get(
        `/api/v1/contests/${contestId}/questions/${questionId}/submissions?page=${page}&per_page=${perPage}`,
    );
}

/**
 * Get submission details
 */
export async function getSubmissionById(
    contestId: string,
    questionId: string,
    submissionId: string,
): Promise<Submission> {
    return api.get(
        `/api/v1/contests/${contestId}/questions/${questionId}/submissions/${submissionId}`,
    );
}

/**
 * Get user's submissions for a specific question
 */
export async function getUserSubmissions(
    contestId: string,
    questionId: string,
    page = 1,
    perPage = 10,
): Promise<SubmissionsListResponse> {
    return api.get(
        `/api/v1/contests/${contestId}/questions/${questionId}/submissions/user?page=${page}&per_page=${perPage}`,
    );
}

/**
 * Get all user submissions across all questions in a contest
 */
export async function getAllUserSubmissions(
    contestId: string,
    page = 1,
    perPage = 20,
): Promise<SubmissionsListResponse> {
    return api.get(`/api/v1/contests/${contestId}/submissions?page=${page}&per_page=${perPage}`);
}

/**
 * Delete a submission (admin/access control on backend)
 */
export async function deleteSubmission(
    contestId: string,
    questionId: string,
    submissionId: string,
): Promise<void> {
    return api.delete(
        `/api/v1/contests/${contestId}/questions/${questionId}/submissions/${submissionId}`,
    );
}

/**
 * Rejudge a submission (admin only)
 */
export async function rejudgeSubmission(
    contestId: string,
    questionId: string,
    submissionId: string,
): Promise<Submission> {
    return api.post(
        `/api/v1/contests/${contestId}/questions/${questionId}/submissions/${submissionId}/rejudge`,
    );
}

/**
 * Get submission languages available
 */
export async function getSubmissionLanguages(): Promise<SubmissionLanguage[]> {
    return api.get("/api/v1/submissions/languages");
}

/**
 * Admin controls service - administrative operations on contests and submissions
 */

import { api } from "@/lib/api-client";

export interface ContestLock {
    question_id: string;
    locked: boolean;
    locked_by?: string;
    locked_at?: string;
}

export interface ClarificationRequest {
    id: string;
    question_id?: string;
    user_id: string;
    user_name?: string;
    query: string;
    answer?: string;
    answered: boolean;
    created_at?: string;
    answered_at?: string;
}

/**
 * Lock/unlock a question during contest
 */
export async function toggleQuestionLock(
    contestId: string,
    questionId: string,
    locked: boolean,
): Promise<ContestLock> {
    return api.patch(`/api/v1/contests/${contestId}/questions/${questionId}/lock`, {
        locked,
    });
}

/**
 * Get clarification requests
 */
export async function getClarifications(
    contestId: string,
    answered?: boolean,
): Promise<ClarificationRequest[]> {
    const params = answered !== undefined ? `?answered=${answered}` : "";
    return api.get(`/api/v1/contests/${contestId}/clarifications${params}`);
}

/**
 * Answer a clarification request
 */
export async function answerClarification(
    contestId: string,
    clarificationId: string,
    answer: string,
): Promise<ClarificationRequest> {
    return api.post(`/api/v1/contests/${contestId}/clarifications/${clarificationId}/answer`, {
        answer,
    });
}

/**
 * Announce message to all contestants
 */
export async function sendAnnouncement(
    contestId: string,
    message: string,
): Promise<{ announcement_id: string }> {
    return api.post(`/api/v1/contests/${contestId}/announcements`, {
        message,
    });
}

/**
 * Disable submission for a contestant (rule violation)
 */
export async function disableContestantSubmission(
    contestId: string,
    userId: string,
    reason: string,
): Promise<void> {
    return api.post(`/api/v1/contests/${contestId}/contestants/${userId}/disable-submission`, {
        reason,
    });
}

/**
 * Re-judge all submissions for a question
 */
export async function reJudgeQuestion(contestId: string, questionId: string): Promise<void> {
    return api.post(`/api/v1/contests/${contestId}/questions/${questionId}/rejudge-all`);
}

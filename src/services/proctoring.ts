/**
 * Proctoring service - proctor monitoring and session management
 */

import { api } from "@/lib/api-client";

export interface ProctoringSession {
    session_id: string;
    contestant_id: string;
    contestant_name?: string;
    start_time: string;
    end_time?: string;
    ip_address?: string;
    device_info?: string;
    webcam_enabled?: boolean;
    flags?: Array<{ reason: string; timestamp: string }>;
}

export interface FlagReason {
    code: string;
    description: string;
}

/**
 * Get proctoring sessions for a contest
 */
export async function getProctoringSession(
    contestId: string,
    userId: string,
): Promise<ProctoringSession> {
    return api.get(`/api/v1/contests/${contestId}/proctoring/sessions/${userId}`);
}

/**
 * Flag suspicious activity
 */
export async function flagActivity(
    contestId: string,
    userId: string,
    reason: string,
): Promise<void> {
    return api.post(`/api/v1/contests/${contestId}/proctoring/flag`, {
        user_id: userId,
        reason,
    });
}

/**
 * Get flag reasons/templates
 */
export async function getFlagReasons(): Promise<FlagReason[]> {
    return api.get("/api/v1/proctoring/flag-reasons");
}

/**
 * Verify contestant before contest start
 */
export async function verifyContestant(
    contestId: string,
    userId: string,
): Promise<{ verified: boolean }> {
    return api.post(`/api/v1/contests/${contestId}/proctoring/verify`, {
        user_id: userId,
    });
}

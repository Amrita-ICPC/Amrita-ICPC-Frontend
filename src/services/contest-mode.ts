/**
 * Contest mode service - handles in-contest operations
 * Provides contestant access and submission during active contests
 */

import { api } from "@/lib/api-client";

export interface ContestantAccess {
    contest_id: string;
    user_id: string;
    role: "participant" | "proctor" | "admin";
    access_granted: boolean;
    access_start?: string;
    access_end?: string;
}

export interface ContestQuestion {
    id: string;
    title: string;
    points: number;
    time_limit: number;
    memory_limit: number;
}

export interface ContestCountdown {
    start_time: string;
    end_time: string;
    time_remaining: number; // in seconds
    is_running: boolean;
}

/**
 * Get contestant access status for a contest
 */
export async function getContestantAccess(contestId: string): Promise<ContestantAccess> {
    return api.get(`/api/v1/contests/${contestId}/access`);
}

/**
 * Get contest questions visible to current user
 */
export async function getContestQuestions(contestId: string): Promise<ContestQuestion[]> {
    return api.get(`/api/v1/contests/${contestId}/questions/accessible`);
}

/**
 * Get contest countdown/timer information
 */
export async function getContestCountdown(contestId: string): Promise<ContestCountdown> {
    return api.get(`/api/v1/contests/${contestId}/countdown`);
}

/**
 * Submit code during contest (with timer validation)
 */
export async function submitDuringContest(
    contestId: string,
    questionId: string,
    code: string,
    language: string,
): Promise<{ submission_id: string; status: string }> {
    return api.post(`/api/v1/contests/${contestId}/submit`, {
        question_id: questionId,
        code,
        language,
    });
}

/**
 * Get contest scoreboard (real-time standings)
 */
export async function getContestScoreboard(
    contestId: string,
): Promise<{ standings: Array<{ rank: number; user_name: string; score: number; time: number }> }> {
    return api.get(`/api/v1/contests/${contestId}/scoreboard`);
}

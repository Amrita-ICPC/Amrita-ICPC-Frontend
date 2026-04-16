/**
 * Leaderboard service - handles leaderboard and rankings
 */

import { api } from "@/lib/api-client";

export interface LeaderboardEntry {
    rank: number;
    user_id: string;
    user_name: string;
    score: number;
    problems_solved: number;
    total_time: number; // penalty time
    last_submission?: string;
}

export interface ContestLeaderboard {
    contest_id: string;
    standings: LeaderboardEntry[];
    refresh_time?: string;
}

/**
 * Get contest leaderboard
 */
export async function getContestLeaderboard(contestId: string): Promise<ContestLeaderboard> {
    return api.get(`/api/v1/contests/${contestId}/leaderboard`);
}

/**
 * Get user's ranking in a contest
 */
export async function getUserRanking(contestId: string, userId: string): Promise<LeaderboardEntry> {
    return api.get(`/api/v1/contests/${contestId}/leaderboard/user/${userId}`);
}

/**
 * Get detailed contest statistics
 */
export async function getContestStats(contestId: string): Promise<{
    total_participants: number;
    total_submissions: number;
    avg_score: number;
    highest_score: number;
    problems_attempted: number[];
}> {
    return api.get(`/api/v1/contests/${contestId}/stats`);
}

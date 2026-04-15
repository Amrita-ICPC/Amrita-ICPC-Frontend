/**
 * Contests service - handles all contest-related API calls
 * Provides CRUD operations for contest management
 */

import { api } from "@/lib/api-client";

export interface Contest {
    id: string;
    name: string;
    description?: string;
    start_time: string;
    end_time: string;
    duration_minutes?: number;
    max_teams?: number;
    status: "draft" | "scheduled" | "in_progress" | "completed";
    created_by?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateContestPayload {
    name: string;
    description?: string;
    start_time: string;
    end_time: string;
    max_teams?: number;
}

export interface UpdateContestPayload {
    name?: string;
    description?: string;
    start_time?: string;
    end_time?: string;
    max_teams?: number;
}

/**
 * Get all contests (with optional filtering)
 * Returns paginated results
 */
export async function getAllContests(
    page = 1,
    page_size = 10,
): Promise<{ data: Contest[]; total: number }> {
    return api.get(`/api/v1/contests?page=${page}&page_size=${page_size}`);
}

/**
 * Get single contest by ID
 */
export async function getContestById(id: string): Promise<Contest> {
    return api.get(`/api/v1/contests/${id}`);
}

/**
 * Create new contest (instructor only)
 */
export async function createContest(payload: CreateContestPayload): Promise<Contest> {
    return api.post("/api/v1/contests", payload);
}

/**
 * Update existing contest (instructor only)
 */
export async function updateContest(id: string, payload: UpdateContestPayload): Promise<Contest> {
    return api.patch(`/api/v1/contests/${id}`, payload);
}

/**
 * Delete contest (instructor only)
 */
export async function deleteContest(id: string): Promise<void> {
    return api.delete(`/api/v1/contests/${id}`);
}

/**
 * Get contest problems/questions
 */
export async function getContestProblems(
    contestId: string,
): Promise<Array<{ id: string; title: string; difficulty: string }>> {
    return api.get(`/api/v1/contests/${contestId}/problems`);
}

/**
 * Get contest standings/leaderboard
 */
export async function getContestStandings(
    contestId: string,
): Promise<Array<{ team_id: string; rank: number; score: number; time_penalty: number }>> {
    return api.get(`/api/v1/contests/${contestId}/standings`);
}

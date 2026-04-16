/**
 * Teams service - handles all team-related API calls
 * Provides CRUD operations for team management within contests
 */

import { api } from "@/lib/api-client";

export interface CreateTeamPayload {
    name: string;
    description?: string;
}

export interface UpdateTeamPayload {
    name?: string;
    description?: string;
}

export interface TeamMemberPayload {
    user_id: string;
}

export interface Team {
    id: string;
    contest_id: string;
    name: string;
    description?: string;
    created_by?: string;
    approved?: boolean;
    member_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface TeamMember {
    id: string;
    team_id: string;
    user_id: string;
    user_name?: string;
    joined_at?: string;
}

export interface TeamsListResponse {
    items: Team[];
    total: number;
    page: number;
    per_page: number;
}

/**
 * Create new team in a contest
 */
export async function createTeam(contestId: string, payload: CreateTeamPayload): Promise<Team> {
    return api.post(`/api/v1/contests/${contestId}/teams`, payload);
}

/**
 * Get list of teams in a contest
 */
export async function getTeamsList(
    contestId: string,
    page = 1,
    perPage = 20,
): Promise<TeamsListResponse> {
    return api.get(`/api/v1/contests/${contestId}/teams?page=${page}&per_page=${perPage}`);
}

/**
 * Get team details
 */
export async function getTeamById(contestId: string, teamId: string): Promise<Team> {
    return api.get(`/api/v1/contests/${contestId}/teams/${teamId}`);
}

/**
 * Update team
 */
export async function updateTeam(
    contestId: string,
    teamId: string,
    payload: UpdateTeamPayload,
): Promise<Team> {
    return api.patch(`/api/v1/contests/${contestId}/teams/${teamId}`, payload);
}

/**
 * Delete team
 */
export async function deleteTeam(contestId: string, teamId: string): Promise<void> {
    return api.delete(`/api/v1/contests/${contestId}/teams/${teamId}`);
}

/**
 * Approve team
 */
export async function approveTeam(contestId: string, teamId: string): Promise<Team> {
    return api.patch(`/api/v1/contests/${contestId}/teams/${teamId}/approve`);
}

/**
 * Get team members
 */
export async function getTeamMembers(contestId: string, teamId: string): Promise<TeamMember[]> {
    return api.get(`/api/v1/contests/${contestId}/teams/${teamId}/members`);
}

/**
 * Add member to team
 */
export async function addTeamMember(
    contestId: string,
    teamId: string,
    payload: TeamMemberPayload,
): Promise<TeamMember> {
    return api.post(`/api/v1/contests/${contestId}/teams/${teamId}/members`, payload);
}

/**
 * Remove member from team
 */
export async function removeTeamMember(
    contestId: string,
    teamId: string,
    memberId: string,
): Promise<void> {
    return api.delete(`/api/v1/contests/${contestId}/teams/${teamId}/members/${memberId}`);
}

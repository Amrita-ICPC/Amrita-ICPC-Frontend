import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getTeams } from "@/api/generated/teams/teams";
import type {
    GetContestTeamsApiV1ContestsContestIdTeamsGetParams,
    GetTeamMembersApiV1ContestsContestIdTeamsTeamIdMembersGetParams,
    ContestTeamResponse,
    TeamMemberResponse,
} from "@/api/generated/model";
import type { ApiResponse } from "@/types/api";
import { ApiError } from "@/lib/api/error";

const teamsApi = getTeams();

export const teamKeys = {
    all: ["teams"] as const,
    contestTeams: (contestId: string) => [...teamKeys.all, "contest", contestId] as const,
    contestTeamsList: (
        contestId: string,
        params: GetContestTeamsApiV1ContestsContestIdTeamsGetParams = {},
    ) => [...teamKeys.contestTeams(contestId), "list", params] as const,
    details: (contestId: string) => [...teamKeys.all, "contest", contestId, "detail"] as const,
    detail: (contestId: string, teamId: string) =>
        [...teamKeys.details(contestId), teamId] as const,
    members: (contestId: string, teamId: string) =>
        [...teamKeys.detail(contestId, teamId), "members"] as const,
    membersList: (
        contestId: string,
        teamId: string,
        params: GetTeamMembersApiV1ContestsContestIdTeamsTeamIdMembersGetParams = {},
    ) => [...teamKeys.members(contestId, teamId), "list", params] as const,
};

/**
 * Fetches a paginated list of teams for a specific contest.
 *
 * @param contestId The unique identifier of the contest.
 * @param params Filtering and pagination parameters.
 * @return A promise resolving to an ApiResponse containing the contest teams.
 * @throws {ApiError} If the request fails or returns success: false.
 */
async function fetchContestTeams(
    contestId: string,
    params: GetContestTeamsApiV1ContestsContestIdTeamsGetParams = {},
): Promise<ApiResponse<ContestTeamResponse[]>> {
    const response = await teamsApi.getContestTeamsApiV1ContestsContestIdTeamsGet(
        contestId,
        params,
    );

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to load contest teams", {
            status: response.status,
        });
    }

    return {
        success: response.success ?? true,
        status: response.status ?? 200,
        message: response.message ?? "",
        data: (response.data ?? []) as ContestTeamResponse[],
        pagination: response.pagination ?? undefined,
        meta: response.meta ?? undefined,
    };
}

/**
 * TanStack Query hook for fetching contest teams.
 *
 * @param contestId The unique identifier of the contest.
 * @param params Filtering and pagination parameters.
 * @return The query result for the contest teams list.
 */
export function useContestTeams(
    contestId: string,
    params: GetContestTeamsApiV1ContestsContestIdTeamsGetParams = {},
) {
    return useQuery({
        queryKey: teamKeys.contestTeamsList(contestId, params),
        queryFn: () => fetchContestTeams(contestId, params),
        enabled: !!contestId,
        placeholderData: keepPreviousData,
        retry: false,
    });
}

/**
 * Fetches detailed information about a specific team.
 *
 * @param contestId The unique identifier of the contest.
 * @param teamId The unique identifier of the team.
 * @return A promise resolving to the team details.
 * @throws {ApiError} If the team is not found or the request fails.
 */
async function fetchTeamDetail(contestId: string, teamId: string): Promise<ContestTeamResponse> {
    const response = await teamsApi.getTeamApiV1ContestsContestIdTeamsTeamIdGet(contestId, teamId);

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to load team details", {
            status: response.status,
        });
    }

    if (!response?.data) {
        throw new ApiError("Team details not found", {
            status: 404,
        });
    }

    return response.data as ContestTeamResponse;
}

/**
 * TanStack Query hook for fetching team details.
 *
 * @param contestId The unique identifier of the contest.
 * @param teamId The unique identifier of the team.
 * @return The query result for the team details.
 */
export function useTeam(contestId: string | undefined, teamId: string | undefined) {
    return useQuery({
        queryKey: contestId && teamId ? teamKeys.detail(contestId, teamId) : teamKeys.all,
        queryFn: () => fetchTeamDetail(contestId!, teamId!),
        enabled: !!contestId && !!teamId,
        retry: false,
    });
}

/**
 * Fetches a paginated list of members for a specific team.
 *
 * @param contestId The unique identifier of the contest.
 * @param teamId The unique identifier of the team.
 * @param params Filtering and pagination parameters.
 * @return A promise resolving to an ApiResponse containing the team members.
 * @throws {ApiError} If the request fails or returns success: false.
 */
async function fetchTeamMembers(
    contestId: string,
    teamId: string,
    params: GetTeamMembersApiV1ContestsContestIdTeamsTeamIdMembersGetParams = {},
): Promise<ApiResponse<TeamMemberResponse[]>> {
    const response = await teamsApi.getTeamMembersApiV1ContestsContestIdTeamsTeamIdMembersGet(
        contestId,
        teamId,
        params,
    );

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to load team members", {
            status: response.status,
        });
    }

    return {
        success: response.success ?? true,
        status: response.status ?? 200,
        message: response.message ?? "",
        data: (response.data ?? []) as TeamMemberResponse[],
        pagination: response.pagination ?? undefined,
        meta: response.meta ?? undefined,
    };
}

/**
 * TanStack Query hook for fetching team members.
 *
 * @param contestId The unique identifier of the contest.
 * @param teamId The unique identifier of the team.
 * @param params Filtering and pagination parameters.
 * @param options Optional useQuery options.
 * @return The query result for the team members list.
 */
export function useTeamMembers(
    contestId: string,
    teamId: string,
    params: GetTeamMembersApiV1ContestsContestIdTeamsTeamIdMembersGetParams = {},
    options: Omit<UseQueryOptions<ApiResponse<TeamMemberResponse[]>>, "queryKey" | "queryFn"> = {},
) {
    return useQuery({
        queryKey: teamKeys.membersList(contestId, teamId, params),
        queryFn: () => fetchTeamMembers(contestId, teamId, params),
        enabled: !!contestId && !!teamId,
        placeholderData: keepPreviousData,
        retry: false,
        ...options,
    });
}

/**
 * Custom hook to fetch all members of all teams in a contest.
 * This is useful for identifying users who are already in a team.
 *
 * @param contestId The unique identifier of the contest.
 * @return Query result containing a Map of userId to Team info.
 */
export function useAllContestMembers(contestId: string) {
    return useQuery({
        queryKey: [...teamKeys.contestTeams(contestId), "all-members"],
        queryFn: async () => {
            // 1. Fetch all teams (up to 100 for now)
            const teamsResponse = await fetchContestTeams(contestId, { page_size: 100 });
            const teams = teamsResponse.data;

            // 2. Fetch members for each team in parallel
            const memberPromises = teams.map(async (team) => {
                const membersResp = await fetchTeamMembers(contestId, team.id, { page_size: 100 });
                return {
                    team,
                    members: membersResp.data,
                };
            });

            const results = await Promise.all(memberPromises);

            // 3. Create a map of userId -> Team info
            const memberMap = new Map<string, ContestTeamResponse>();
            results.forEach(({ team, members }) => {
                members.forEach((member) => {
                    memberMap.set(member.user_id, team);
                });
            });

            return memberMap;
        },
        enabled: !!contestId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

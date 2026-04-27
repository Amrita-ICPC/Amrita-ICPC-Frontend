import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getTeams } from "@/api/generated/teams/teams";
import { teamKeys } from "@/query/team-query";
import type {
    TeamCreate,
    TeamUpdate,
    TeamMemberAdd,
    TeamMemberRemove,
} from "@/api/generated/model";
import { ApiError } from "@/lib/api/error";

const teamsApi = getTeams();

/**
 * Creates a new team in a specific contest.
 *
 * @param input Object containing contestId and the team creation payload.
 * @return A promise resolving to the API response.
 * @throws {ApiError} If the creation fails.
 */
async function createTeam(input: { contestId: string; payload: TeamCreate }) {
    const response = await teamsApi.createTeamApiV1ContestsContestIdTeamsPost(
        input.contestId,
        input.payload,
    );

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to create team", {
            status: response.status,
        });
    }

    return response;
}

/**
 * TanStack Mutation hook for creating a new team.
 * Invalidates the contest teams list upon success.
 *
 * @return The mutation hook for creating a team.
 */
export function useCreateTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTeam,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: teamKeys.contestTeams(variables.contestId) });
        },
    });
}

/**
 * Updates an existing team in a contest.
 *
 * @param input Object containing contestId, teamId, and the update payload.
 * @return A promise resolving to the API response.
 * @throws {ApiError} If the update fails.
 */
async function updateTeam(input: { contestId: string; teamId: string; payload: TeamUpdate }) {
    const response = await teamsApi.updateTeamApiV1ContestsContestIdTeamsTeamIdPatch(
        input.contestId,
        input.teamId,
        input.payload,
    );

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to update team", {
            status: response.status,
        });
    }

    return response;
}

/**
 * TanStack Mutation hook for updating a team.
 * Invalidates relevant team queries upon success.
 *
 * @return The mutation hook for updating a team.
 */
export function useUpdateTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateTeam,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: teamKeys.contestTeams(variables.contestId) });
            queryClient.invalidateQueries({
                queryKey: teamKeys.detail(variables.contestId, variables.teamId),
            });
        },
    });
}

/**
 * Approves a contest team.
 *
 * @param input Object containing contestId and teamId.
 * @return A promise resolving to the API response.
 * @throws {ApiError} If the approval fails.
 */
async function approveTeam(input: { contestId: string; teamId: string }) {
    const response = await teamsApi.approveTeamApiV1ContestsContestIdTeamsTeamIdApprovePatch(
        input.contestId,
        input.teamId,
    );

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to approve team", {
            status: response.status,
        });
    }

    return response;
}

/**
 * TanStack Mutation hook for approving a team.
 * Invalidates relevant team queries upon success.
 *
 * @return The mutation hook for approving a team.
 */
export function useApproveTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: approveTeam,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: teamKeys.contestTeams(variables.contestId) });
            queryClient.invalidateQueries({
                queryKey: teamKeys.detail(variables.contestId, variables.teamId),
            });
        },
    });
}

/**
 * Adds members to an existing team.
 *
 * @param input Object containing contestId, teamId, and the member addition payload.
 * @return A promise resolving to the API response.
 * @throws {ApiError} If the operation fails.
 */
async function addTeamMembers(input: {
    contestId: string;
    teamId: string;
    payload: TeamMemberAdd;
}) {
    const response = await teamsApi.addTeamMembersApiV1ContestsContestIdTeamsTeamIdMembersPost(
        input.contestId,
        input.teamId,
        input.payload,
    );

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to add team members", {
            status: response.status,
        });
    }

    return response;
}

/**
 * TanStack Mutation hook for adding members to a team.
 * Invalidates relevant team and member queries upon success.
 *
 * @return The mutation hook for adding team members.
 */
export function useAddTeamMembers() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addTeamMembers,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: teamKeys.members(variables.contestId, variables.teamId),
            });
            queryClient.invalidateQueries({
                queryKey: teamKeys.detail(variables.contestId, variables.teamId),
            });
        },
    });
}

/**
 * Deletes a team from a contest.
 *
 * @param input Object containing contestId and teamId.
 * @return A promise resolving to the API response.
 * @throws {ApiError} If the deletion fails.
 */
async function deleteTeam(input: { contestId: string; teamId: string }) {
    const response = await teamsApi.deleteTeamApiV1ContestsContestIdTeamsTeamIdDelete(
        input.contestId,
        input.teamId,
    );

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to delete team", {
            status: response.status,
        });
    }

    return response;
}

/**
 * TanStack Mutation hook for deleting a team.
 * Invalidates the contest teams list upon success.
 *
 * @return The mutation hook for deleting a team.
 */
export function useDeleteTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteTeam,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: teamKeys.contestTeams(variables.contestId) });
        },
    });
}

/**
 * Removes members from an existing team.
 *
 * @param input Object containing contestId, teamId, and the member removal payload.
 * @return A promise resolving to the API response.
 * @throws {ApiError} If the operation fails.
 */
async function removeTeamMembers(input: {
    contestId: string;
    teamId: string;
    payload: TeamMemberRemove;
}) {
    const response = await teamsApi.removeTeamMemberApiV1ContestsContestIdTeamsTeamIdMembersDelete(
        input.contestId,
        input.teamId,
        input.payload,
    );

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to remove team members", {
            status: response.status,
        });
    }

    return response;
}

/**
 * TanStack Mutation hook for removing members from a team.
 * Invalidates relevant team and member queries upon success.
 *
 * @return The mutation hook for removing team members.
 */
export function useRemoveTeamMembers() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeTeamMembers,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: teamKeys.members(variables.contestId, variables.teamId),
            });
            queryClient.invalidateQueries({
                queryKey: teamKeys.detail(variables.contestId, variables.teamId),
            });
        },
    });
}

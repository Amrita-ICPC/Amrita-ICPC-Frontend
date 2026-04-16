/**
 * React Query hooks for teams management
 * Provides data fetching, caching, and mutations for team operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    createTeam,
    getTeamsList,
    getTeamById,
    updateTeam,
    deleteTeam,
    approveTeam,
    getTeamMembers,
    addTeamMember,
    removeTeamMember,
    type CreateTeamPayload,
    type UpdateTeamPayload,
    type TeamMemberPayload,
} from "@/services/teams";
import { toast } from "sonner";

export const TEAMS_QUERY_KEY = ["teams"] as const;
export const TEAM_DETAIL_QUERY_KEY = ["team"] as const;
export const TEAM_MEMBERS_QUERY_KEY = ["team-members"] as const;

/**
 * Fetch list of teams in a contest
 */
export function useTeamsList(contestId: string, page = 1, perPage = 20) {
    return useQuery({
        queryKey: [...TEAMS_QUERY_KEY, contestId, page, perPage],
        queryFn: () => getTeamsList(contestId, page, perPage),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

/**
 * Fetch team details
 */
export function useTeam(contestId: string, teamId: string | null) {
    return useQuery({
        queryKey: [...TEAM_DETAIL_QUERY_KEY, contestId, teamId],
        queryFn: () => getTeamById(contestId, teamId!),
        enabled: !!teamId,
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Fetch team members
 */
export function useTeamMembers(contestId: string, teamId: string | null) {
    return useQuery({
        queryKey: [...TEAM_MEMBERS_QUERY_KEY, contestId, teamId],
        queryFn: () => getTeamMembers(contestId, teamId!),
        enabled: !!teamId,
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Create team
 */
export function useCreateTeam(contestId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateTeamPayload) => createTeam(contestId, payload),
        onSuccess: () => {
            toast.success("Team created successfully");
            queryClient.invalidateQueries({
                queryKey: [...TEAMS_QUERY_KEY, contestId],
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to create team: ${error.message}`);
        },
    });
}

/**
 * Update team
 */
export function useUpdateTeam(contestId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ teamId, payload }: { teamId: string; payload: UpdateTeamPayload }) =>
            updateTeam(contestId, teamId, payload),
        onSuccess: (_, variables) => {
            toast.success("Team updated successfully");
            queryClient.invalidateQueries({
                queryKey: [...TEAM_DETAIL_QUERY_KEY, contestId, variables.teamId],
            });
            queryClient.invalidateQueries({
                queryKey: [...TEAMS_QUERY_KEY, contestId],
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to update team: ${error.message}`);
        },
    });
}

/**
 * Delete team
 */
export function useDeleteTeam(contestId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (teamId: string) => deleteTeam(contestId, teamId),
        onSuccess: () => {
            toast.success("Team deleted successfully");
            queryClient.invalidateQueries({
                queryKey: [...TEAMS_QUERY_KEY, contestId],
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete team: ${error.message}`);
        },
    });
}

/**
 * Approve team
 */
export function useApproveTeam(contestId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (teamId: string) => approveTeam(contestId, teamId),
        onSuccess: (_, teamId) => {
            toast.success("Team approved successfully");
            queryClient.invalidateQueries({
                queryKey: [...TEAM_DETAIL_QUERY_KEY, contestId, teamId],
            });
            queryClient.invalidateQueries({
                queryKey: [...TEAMS_QUERY_KEY, contestId],
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to approve team: ${error.message}`);
        },
    });
}

/**
 * Add team member
 */
export function useAddTeamMember(contestId: string, teamId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: TeamMemberPayload) => addTeamMember(contestId, teamId, payload),
        onSuccess: () => {
            toast.success("Member added successfully");
            queryClient.invalidateQueries({
                queryKey: [...TEAM_MEMBERS_QUERY_KEY, contestId, teamId],
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to add member: ${error.message}`);
        },
    });
}

/**
 * Remove team member
 */
export function useRemoveTeamMember(contestId: string, teamId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (memberId: string) => removeTeamMember(contestId, teamId, memberId),
        onSuccess: () => {
            toast.success("Member removed successfully");
            queryClient.invalidateQueries({
                queryKey: [...TEAM_MEMBERS_QUERY_KEY, contestId, teamId],
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to remove member: ${error.message}`);
        },
    });
}

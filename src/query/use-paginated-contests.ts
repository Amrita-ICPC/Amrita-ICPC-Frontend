/**
 * React Query hooks for contests management
 * Provides data fetching, caching, and mutations for instructor contest operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllContests,
    getContestById,
    createContest,
    updateContest,
    deleteContest,
    type CreateContestPayload,
    type UpdateContestPayload,
} from "@/services/contests";
import { toast } from "sonner";

export const CONTESTS_QUERY_KEY = ["contests"] as const;
export const PAGINATED_CONTESTS_QUERY_KEY = ["contests", "paginated"] as const;
export const CONTEST_DETAIL_QUERY_KEY = ["contest"] as const;

export interface PaginationState {
    pageIndex: number;
    pageSize: number;
}

/**
 * Fetch single contest by ID
 */
export function useContest(contestId: string | null) {
    return useQuery({
        queryKey: [...CONTEST_DETAIL_QUERY_KEY, contestId],
        queryFn: () => getContestById(contestId!),
        enabled: !!contestId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Fetch paginated contests list
 * Cache invalidates on manual refresh or after mutations
 */
export function usePaginatedContests(pagination: PaginationState) {
    return useQuery({
        queryKey: [...PAGINATED_CONTESTS_QUERY_KEY, pagination.pageIndex, pagination.pageSize],
        queryFn: async () => {
            return getAllContests(pagination.pageIndex + 1, pagination.pageSize);
        },
        staleTime: 3 * 60 * 1000, // 3 minutes (shorter for contests since they're time-sensitive)
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Create new contest
 * Invalidates contests list cache after success
 */
export function useCreateContest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateContestPayload) => createContest(payload),
        onSuccess: () => {
            toast.success("Contest created successfully");
            // Invalidate all paginated contests queries
            queryClient.invalidateQueries({
                queryKey: PAGINATED_CONTESTS_QUERY_KEY,
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to create contest: ${error.message}`);
        },
    });
}

/**
 * Update existing contest
 * Invalidates contests list and individual contest cache
 */
export function useUpdateContest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateContestPayload }) =>
            updateContest(id, data),
        onSuccess: (_, variables) => {
            toast.success("Contest updated successfully");
            // Invalidate paginated list
            queryClient.invalidateQueries({
                queryKey: PAGINATED_CONTESTS_QUERY_KEY,
            });
            // Invalidate individual contest cache if exists
            queryClient.invalidateQueries({
                queryKey: ["contest", variables.id],
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to update contest: ${error.message}`);
        },
    });
}

/**
 * Delete contest
 * Invalidates contests list cache after success
 */
export function useDeleteContest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (contestId: string) => deleteContest(contestId),
        onSuccess: () => {
            toast.success("Contest deleted successfully");
            // Invalidate paginated list
            queryClient.invalidateQueries({
                queryKey: PAGINATED_CONTESTS_QUERY_KEY,
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete contest: ${error.message}`);
        },
    });
}

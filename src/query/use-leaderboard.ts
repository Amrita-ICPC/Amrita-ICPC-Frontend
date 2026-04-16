/**
 * React Query hooks for leaderboard
 */

import { useQuery } from "@tanstack/react-query";
import { getContestLeaderboard, getUserRanking, getContestStats } from "@/services/leaderboard";

export const LEADERBOARD_QUERY_KEY = ["leaderboard"] as const;

/**
 * Get contest leaderboard
 */
export function useContestLeaderboard(contestId: string | null) {
    return useQuery({
        queryKey: [...LEADERBOARD_QUERY_KEY, "contest", contestId],
        queryFn: () => getContestLeaderboard(contestId!),
        enabled: !!contestId,
        refetchInterval: 10000, // Update every 10 seconds
        staleTime: 5000,
    });
}

/**
 * Get user's ranking
 */
export function useUserRanking(contestId: string | null, userId: string | null) {
    return useQuery({
        queryKey: [...LEADERBOARD_QUERY_KEY, "user", contestId, userId],
        queryFn: () => getUserRanking(contestId!, userId!),
        enabled: !!contestId && !!userId,
        refetchInterval: 10000,
        staleTime: 5000,
    });
}

/**
 * Get contest statistics
 */
export function useContestStats(contestId: string | null) {
    return useQuery({
        queryKey: [...LEADERBOARD_QUERY_KEY, "stats", contestId],
        queryFn: () => getContestStats(contestId!),
        enabled: !!contestId,
        refetchInterval: 30000, // Every 30 seconds
        staleTime: 15000,
    });
}

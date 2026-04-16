/**
 * React Query hooks for contest mode
 */

import { useQuery } from "@tanstack/react-query";
import {
    getContestantAccess,
    getContestQuestions,
    getContestCountdown,
    getContestScoreboard,
} from "@/services/contest-mode";

export const CONTEST_MODE_QUERY_KEY = ["contest-mode"] as const;

/**
 * Check if contestant has access to contest
 */
export function useContestantAccess(contestId: string | null) {
    return useQuery({
        queryKey: [...CONTEST_MODE_QUERY_KEY, "access", contestId],
        queryFn: () => getContestantAccess(contestId!),
        enabled: !!contestId,
        staleTime: 30 * 1000,
    });
}

/**
 * Get accessible questions for this contest
 */
export function useContestQuestions(contestId: string | null) {
    return useQuery({
        queryKey: [...CONTEST_MODE_QUERY_KEY, "questions", contestId],
        queryFn: () => getContestQuestions(contestId!),
        enabled: !!contestId,
        staleTime: 60 * 1000,
    });
}

/**
 * Get real-time contest countdown
 */
export function useContestCountdown(contestId: string | null, enabled = true) {
    return useQuery({
        queryKey: [...CONTEST_MODE_QUERY_KEY, "countdown", contestId],
        queryFn: () => getContestCountdown(contestId!),
        enabled: enabled && !!contestId,
        refetchInterval: 1000, // Update every second
        staleTime: 0,
    });
}

/**
 * Get live contest scoreboard
 */
export function useContestScoreboard(contestId: string | null) {
    return useQuery({
        queryKey: [...CONTEST_MODE_QUERY_KEY, "scoreboard", contestId],
        queryFn: () => getContestScoreboard(contestId!),
        enabled: !!contestId,
        refetchInterval: 5000, // Update every 5 seconds
        staleTime: 0,
    });
}

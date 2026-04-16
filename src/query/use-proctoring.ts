/**
 * React Query hooks for proctoring
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import {
    getProctoringSession,
    flagActivity,
    getFlagReasons,
    verifyContestant,
} from "@/services/proctoring";
import { toast } from "sonner";

export const PROCTORING_QUERY_KEY = ["proctoring"] as const;

/**
 * Get proctoring session for a contestant
 */
export function useProctoringSession(contestId: string | null, userId: string | null) {
    return useQuery({
        queryKey: [...PROCTORING_QUERY_KEY, "session", contestId, userId],
        queryFn: () => getProctoringSession(contestId!, userId!),
        enabled: !!contestId && !!userId,
        refetchInterval: 30000,
    });
}

/**
 * Get flag reasons
 */
export function useFlagReasons() {
    return useQuery({
        queryKey: [...PROCTORING_QUERY_KEY, "flag-reasons"],
        queryFn: getFlagReasons,
        staleTime: 60 * 60 * 1000,
    });
}

/**
 * Flag suspicious activity
 */
export function useFlagActivity(contestId: string) {
    return useMutation({
        mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
            flagActivity(contestId, userId, reason),
        onSuccess: () => {
            toast.success("Activity flagged");
        },
        onError: (error: Error) => {
            toast.error(`Failed: ${error.message}`);
        },
    });
}

/**
 * Verify contestant
 */
export function useVerifyContestant(contestId: string) {
    return useMutation({
        mutationFn: (userId: string) => verifyContestant(contestId, userId),
        onSuccess: () => {
            toast.success("Contestant verified");
        },
        onError: (error: Error) => {
            toast.error(`Failed: ${error.message}`);
        },
    });
}

/**
 * React Query hooks for admin controls
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getClarifications,
    answerClarification,
    sendAnnouncement,
    disableContestantSubmission,
    reJudgeQuestion,
} from "@/services/admin-controls";
import { toast } from "sonner";

export const ADMIN_CONTROLS_QUERY_KEY = ["admin-controls"] as const;

/**
 * Get clarification requests
 */
export function useClarifications(contestId: string | null, answered?: boolean) {
    return useQuery({
        queryKey: [...ADMIN_CONTROLS_QUERY_KEY, "clarifications", contestId, answered],
        queryFn: () => getClarifications(contestId!, answered),
        enabled: !!contestId,
        refetchInterval: 10000,
    });
}

/**
 * Answer clarification
 */
export function useAnswerClarification(contestId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ clarificationId, answer }: { clarificationId: string; answer: string }) =>
            answerClarification(contestId, clarificationId, answer),
        onSuccess: () => {
            toast.success("Clarification answered");
            queryClient.invalidateQueries({
                queryKey: [...ADMIN_CONTROLS_QUERY_KEY, "clarifications", contestId],
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed: ${error.message}`);
        },
    });
}

/**
 * Send announcement
 */
export function useSendAnnouncement(contestId: string) {
    return useMutation({
        mutationFn: (message: string) => sendAnnouncement(contestId, message),
        onSuccess: () => {
            toast.success("Announcement sent");
        },
        onError: (error: Error) => {
            toast.error(`Failed: ${error.message}`);
        },
    });
}

/**
 * Disable contestant submission
 */
export function useDisableContestantSubmission(contestId: string) {
    return useMutation({
        mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
            disableContestantSubmission(contestId, userId, reason),
        onSuccess: () => {
            toast.success("Contestant submission disabled");
        },
        onError: (error: Error) => {
            toast.error(`Failed: ${error.message}`);
        },
    });
}

/**
 * Re-judge all submissions for a question
 */
export function useReJudgeQuestion(contestId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (questionId: string) => reJudgeQuestion(contestId, questionId),
        onSuccess: () => {
            toast.success("Re-judging started");
            queryClient.invalidateQueries({
                queryKey: [...ADMIN_CONTROLS_QUERY_KEY, "submissions"],
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed: ${error.message}`);
        },
    });
}

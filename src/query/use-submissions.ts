/**
 * React Query hooks for submissions management
 * Provides data fetching, caching, and mutations for submission operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    submitCode,
    getSubmissionsList,
    getSubmissionById,
    getUserSubmissions,
    getAllUserSubmissions,
    deleteSubmission,
    rejudgeSubmission,
    getSubmissionLanguages,
    type SubmissionPayload,
} from "@/services/submissions";
import { toast } from "sonner";

export const SUBMISSIONS_QUERY_KEY = ["submissions"] as const;
export const SUBMISSION_DETAIL_QUERY_KEY = ["submission"] as const;
export const SUBMISSION_LANGUAGES_QUERY_KEY = ["submission-languages"] as const;

/**
 * Fetch list of submissions for a question
 */
export function useSubmissionsList(contestId: string, questionId: string, page = 1, perPage = 20) {
    return useQuery({
        queryKey: [...SUBMISSIONS_QUERY_KEY, contestId, questionId, page, perPage],
        queryFn: () => getSubmissionsList(contestId, questionId, page, perPage),
        staleTime: 30 * 1000, // 30 seconds for submission lists
    });
}

/**
 * Fetch user's submissions for a specific question
 */
export function useUserSubmissions(contestId: string, questionId: string, page = 1, perPage = 10) {
    return useQuery({
        queryKey: [...SUBMISSIONS_QUERY_KEY, "user", contestId, questionId, page, perPage],
        queryFn: () => getUserSubmissions(contestId, questionId, page, perPage),
        staleTime: 30 * 1000,
    });
}

/**
 * Fetch all user submissions in a contest
 */
export function useAllUserSubmissions(contestId: string, page = 1, perPage = 20) {
    return useQuery({
        queryKey: [...SUBMISSIONS_QUERY_KEY, "user-all", contestId, page, perPage],
        queryFn: () => getAllUserSubmissions(contestId, page, perPage),
        staleTime: 30 * 1000,
    });
}

/**
 * Fetch submission details
 */
export function useSubmission(contestId: string, questionId: string, submissionId: string | null) {
    return useQuery({
        queryKey: [...SUBMISSION_DETAIL_QUERY_KEY, contestId, questionId, submissionId],
        queryFn: () => getSubmissionById(contestId, questionId, submissionId!),
        enabled: !!submissionId,
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Fetch available submission languages
 */
export function useSubmissionLanguages() {
    return useQuery({
        queryKey: SUBMISSION_LANGUAGES_QUERY_KEY,
        queryFn: getSubmissionLanguages,
        staleTime: 60 * 60 * 1000, // 1 hour
    });
}

/**
 * Submit code for a question
 */
export function useSubmitCode(contestId: string, questionId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: SubmissionPayload) => submitCode(contestId, questionId, payload),
        onSuccess: () => {
            toast.success("Code submitted successfully!");
            queryClient.invalidateQueries({
                queryKey: [...SUBMISSIONS_QUERY_KEY, "user", contestId, questionId],
            });
            queryClient.invalidateQueries({
                queryKey: [...SUBMISSIONS_QUERY_KEY, "user-all", contestId],
            });
        },
        onError: (error: Error) => {
            toast.error(`Submission failed: ${error.message}`);
        },
    });
}

/**
 * Delete submission
 */
export function useDeleteSubmission(contestId: string, questionId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (submissionId: string) => deleteSubmission(contestId, questionId, submissionId),
        onSuccess: () => {
            toast.success("Submission deleted successfully");
            queryClient.invalidateQueries({
                queryKey: [...SUBMISSIONS_QUERY_KEY, contestId, questionId],
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete submission: ${error.message}`);
        },
    });
}

/**
 * Rejudge submission
 */
export function useRejudgeSubmission(contestId: string, questionId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (submissionId: string) =>
            rejudgeSubmission(contestId, questionId, submissionId),
        onSuccess: (_, submissionId) => {
            toast.success("Submission rejudged");
            queryClient.invalidateQueries({
                queryKey: [...SUBMISSION_DETAIL_QUERY_KEY, contestId, questionId, submissionId],
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to rejudge: ${error.message}`);
        },
    });
}

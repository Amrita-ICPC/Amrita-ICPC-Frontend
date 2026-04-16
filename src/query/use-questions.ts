/**
 * React Query hooks for questions management
 * Provides data fetching, caching, and mutations for global question operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    createQuestion,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    getPlatformLanguages,
    getJudge0Languages,
    type CreateQuestionPayload,
    type UpdateQuestionPayload,
} from "@/services/questions";
import { toast } from "sonner";

export const QUESTIONS_QUERY_KEY = ["questions"] as const;
export const QUESTION_DETAIL_QUERY_KEY = ["question"] as const;
export const LANGUAGES_QUERY_KEY = ["languages"] as const;

/**
 * Fetch a single question by ID
 */
export function useQuestion(questionId: string | null) {
    return useQuery({
        queryKey: [...QUESTION_DETAIL_QUERY_KEY, questionId],
        queryFn: () => getQuestionById(questionId!),
        enabled: !!questionId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Fetch platform-supported languages
 */
export function usePlatformLanguages() {
    return useQuery({
        queryKey: [...LANGUAGES_QUERY_KEY, "platform"],
        queryFn: getPlatformLanguages,
        staleTime: 60 * 60 * 1000, // 1 hour - rarely changes
    });
}

/**
 * Fetch Judge0-supported languages
 */
export function useJudge0Languages() {
    return useQuery({
        queryKey: [...LANGUAGES_QUERY_KEY, "judge0"],
        queryFn: getJudge0Languages,
        staleTime: 60 * 60 * 1000, // 1 hour - rarely changes
    });
}

/**
 * Create new question
 */
export function useCreateQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateQuestionPayload) => createQuestion(payload),
        onSuccess: () => {
            toast.success("Question created successfully");
            // Invalidate relevant caches
            queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY });
        },
        onError: (error: Error) => {
            toast.error(`Failed to create question: ${error.message}`);
        },
    });
}

/**
 * Update question
 */
export function useUpdateQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateQuestionPayload }) =>
            updateQuestion(id, payload),
        onSuccess: (_, variables) => {
            toast.success("Question updated successfully");
            // Invalidate both detail and list caches
            queryClient.invalidateQueries({
                queryKey: [...QUESTION_DETAIL_QUERY_KEY, variables.id],
            });
            queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY });
        },
        onError: (error: Error) => {
            toast.error(`Failed to update question: ${error.message}`);
        },
    });
}

/**
 * Delete question
 */
export function useDeleteQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteQuestion(id),
        onSuccess: () => {
            toast.success("Question deleted successfully");
            // Invalidate question lists
            queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY });
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete question: ${error.message}`);
        },
    });
}

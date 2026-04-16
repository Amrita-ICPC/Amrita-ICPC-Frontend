/**
 * React Query hooks for banks management
 * Provides data fetching, caching, and mutations for question bank operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    createBank,
    getAllBanks,
    getBankById,
    updateBank,
    deleteBank,
    getBankQuestions,
    getBankQuestion,
    addQuestionToBank,
    removeQuestionFromBank,
    getBankSharedUsers,
    shareBankWithUser,
    unshareBankFromUser,
    type CreateBankPayload,
    type UpdateBankPayload,
    type AddQuestionPayload,
    type ShareBankPayload,
} from "@/services/banks";
import { toast } from "sonner";

export const BANKS_QUERY_KEY = ["banks"] as const;
export const PAGINATED_BANKS_QUERY_KEY = ["banks", "paginated"] as const;
export const BANK_DETAIL_QUERY_KEY = ["bank"] as const;
export const BANK_QUESTIONS_QUERY_KEY = ["bank-questions"] as const;
export const BANK_SHARED_USERS_QUERY_KEY = ["bank-shared-users"] as const;

export interface PaginationState {
    pageIndex: number;
    pageSize: number;
}

/**
 * Fetch single bank by ID
 */
export function useBank(bankId: string | null) {
    return useQuery({
        queryKey: [...BANK_DETAIL_QUERY_KEY, bankId],
        queryFn: () => getBankById(bankId!),
        enabled: !!bankId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Fetch paginated banks list
 * Cache invalidates on manual refresh or after mutations
 */
export function usePaginatedBanks(pagination: PaginationState) {
    return useQuery({
        queryKey: [...PAGINATED_BANKS_QUERY_KEY, pagination.pageIndex, pagination.pageSize],
        queryFn: async () => {
            return getAllBanks(pagination.pageIndex + 1, pagination.pageSize);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Create new bank
 * Invalidates banks list cache after success
 */
export function useCreateBank() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateBankPayload) => createBank(payload),
        onSuccess: () => {
            toast.success("Question bank created successfully");
            // Invalidate paginated list
            queryClient.invalidateQueries({
                queryKey: PAGINATED_BANKS_QUERY_KEY,
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to create bank: ${error.message}`);
        },
    });
}

/**
 * Update bank metadata
 * Invalidates both list and detail caches after success
 */
export function useUpdateBank() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ bankId, payload }: { bankId: string; payload: UpdateBankPayload }) =>
            updateBank(bankId, payload),
        onSuccess: (_, variables) => {
            toast.success("Question bank updated successfully");
            // Invalidate both list and detail caches
            queryClient.invalidateQueries({ queryKey: PAGINATED_BANKS_QUERY_KEY });
            queryClient.invalidateQueries({
                queryKey: [...BANK_DETAIL_QUERY_KEY, variables.bankId],
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to update bank: ${error.message}`);
        },
    });
}

/**
 * Delete bank
 * Invalidates banks list cache after success
 */
export function useDeleteBank() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (bankId: string) => deleteBank(bankId),
        onSuccess: () => {
            toast.success("Question bank deleted successfully");
            // Invalidate paginated list
            queryClient.invalidateQueries({
                queryKey: PAGINATED_BANKS_QUERY_KEY,
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete bank: ${error.message}`);
        },
    });
}

/**
 * Fetch paginated questions in a bank
 */
export function useBankQuestions(bankId: string | null, pagination: PaginationState) {
    return useQuery({
        queryKey: [...BANK_QUESTIONS_QUERY_KEY, bankId, pagination.pageIndex, pagination.pageSize],
        queryFn: () => getBankQuestions(bankId!, pagination.pageIndex + 1, pagination.pageSize),
        enabled: !!bankId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Fetch single question from bank
 */
export function useBankQuestion(bankId: string | null, questionId: string | null) {
    return useQuery({
        queryKey: [...BANK_QUESTIONS_QUERY_KEY, bankId, questionId],
        queryFn: () => getBankQuestion(bankId!, questionId!),
        enabled: !!bankId && !!questionId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Add question to bank
 */
export function useAddQuestionToBank() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ bankId, payload }: { bankId: string; payload: AddQuestionPayload }) =>
            addQuestionToBank(bankId, payload),
        onSuccess: (_, variables) => {
            toast.success("Question added to bank successfully");
            // Invalidate questions list cache
            queryClient.invalidateQueries({
                queryKey: [...BANK_QUESTIONS_QUERY_KEY, variables.bankId],
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to add question: ${error.message}`);
        },
    });
}

/**
 * Remove question from bank
 */
export function useRemoveQuestionFromBank() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ bankId, questionId }: { bankId: string; questionId: string }) =>
            removeQuestionFromBank(bankId, questionId),
        onSuccess: (_, variables) => {
            toast.success("Question removed from bank");
            // Invalidate questions list cache
            queryClient.invalidateQueries({
                queryKey: [...BANK_QUESTIONS_QUERY_KEY, variables.bankId],
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to remove question: ${error.message}`);
        },
    });
}

/**
 * Fetch users a bank is shared with
 */
export function useBankSharedUsers(bankId: string | null) {
    return useQuery({
        queryKey: [...BANK_SHARED_USERS_QUERY_KEY, bankId],
        queryFn: () => getBankSharedUsers(bankId!),
        enabled: !!bankId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Share bank with user
 */
export function useShareBankWithUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ bankId, payload }: { bankId: string; payload: ShareBankPayload }) =>
            shareBankWithUser(bankId, payload),
        onSuccess: (_, variables) => {
            toast.success("Bank shared successfully");
            // Invalidate shared users list cache
            queryClient.invalidateQueries({
                queryKey: [...BANK_SHARED_USERS_QUERY_KEY, variables.bankId],
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to share bank: ${error.message}`);
        },
    });
}

/**
 * Unshare bank from user
 */
export function useUnshareBankFromUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ bankId, userId }: { bankId: string; userId: string }) =>
            unshareBankFromUser(bankId, userId),
        onSuccess: (_, variables) => {
            toast.success("Bank access removed");
            // Invalidate shared users list cache
            queryClient.invalidateQueries({
                queryKey: [...BANK_SHARED_USERS_QUERY_KEY, variables.bankId],
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to remove access: ${error.message}`);
        },
    });
}

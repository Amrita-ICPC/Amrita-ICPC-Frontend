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
    type CreateBankPayload,
    type UpdateBankPayload,
} from "@/services/banks";
import { toast } from "sonner";

export const BANKS_QUERY_KEY = ["banks"] as const;
export const PAGINATED_BANKS_QUERY_KEY = ["banks", "paginated"] as const;
export const BANK_DETAIL_QUERY_KEY = ["bank"] as const;

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

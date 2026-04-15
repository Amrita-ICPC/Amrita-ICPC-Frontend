/**
 * React Query hooks for paginated users list
 * Provides data fetching, caching, and mutations for user management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    type UserProfile,
    type CreateUserPayload,
} from "@/services/users";
import { toast } from "sonner";

export const PAGINATED_USERS_QUERY_KEY = ["users", "paginated"] as const;

export interface PaginationState {
    pageIndex: number;
    pageSize: number;
}

/**
 * Fetch paginated users list
 * Cache invalidates on manual refresh or after mutations
 */
export function usePaginatedUsers(pagination: PaginationState) {
    return useQuery({
        queryKey: [...PAGINATED_USERS_QUERY_KEY, pagination.pageIndex, pagination.pageSize],
        queryFn: async () => {
            return getAllUsers(pagination.pageIndex + 1, pagination.pageSize);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    });
}

/**
 * Create new user
 * Invalidates users list cache after success
 */
export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateUserPayload) => createUser(payload),
        onSuccess: () => {
            toast.success("User created successfully");
            // Invalidate all paginated users queries
            queryClient.invalidateQueries({
                queryKey: PAGINATED_USERS_QUERY_KEY,
            });
        },
        onError: (error: Error) => {
            console.error("Failed to create user", error);
            toast.error(`Failed to create user: ${error.message}`);
        },
    });
}

/**
 * Update existing user
 * Invalidates users list and individual user cache
 */
export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<UserProfile> }) =>
            updateUser(id, data),
        onSuccess: (_, variables) => {
            toast.success("User updated successfully");
            // Invalidate paginated list
            queryClient.invalidateQueries({
                queryKey: PAGINATED_USERS_QUERY_KEY,
            });
            // Invalidate individual user cache if exists
            queryClient.invalidateQueries({
                queryKey: ["user", variables.id],
            });
        },
        onError: (error: Error) => {
            console.error("Failed to update user", error);
            toast.error(`Failed to update user: ${error.message}`);
        },
    });
}

/**
 * Delete user
 * Invalidates users list cache after success
 */
export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => deleteUser(userId),
        onSuccess: () => {
            toast.success("User deleted successfully");
            // Invalidate paginated list
            queryClient.invalidateQueries({
                queryKey: PAGINATED_USERS_QUERY_KEY,
            });
        },
        onError: (error: Error) => {
            console.error("Failed to delete user", error);
            toast.error(`Failed to delete user: ${error.message}`);
        },
    });
}

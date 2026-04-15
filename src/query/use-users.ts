"use client";

/**
 * TanStack Query hooks for user queries
 * Pattern for creating hooks that use services with React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getCurrentUser,
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    type CreateUserPayload,
} from "@/services/users";
import { logger } from "@/lib/logger";
import { toast } from "@/lib/hooks/use-toast";

// Query keys for invalidation
export const userQueryKeys = {
    all: ["users"] as const,
    lists: () => [...userQueryKeys.all, "list"] as const,
    list: (page: number, page_size: number) =>
        [...userQueryKeys.lists(), { page, page_size }] as const,
    details: () => [...userQueryKeys.all, "detail"] as const,
    detail: (id: string) => [...userQueryKeys.details(), id] as const,
    current: () => [...userQueryKeys.all, "current"] as const,
};

/**
 * Hook to fetch current user profile
 */
export function useCurrentUser() {
    return useQuery({
        queryKey: userQueryKeys.current(),
        queryFn: getCurrentUser,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
}

/**
 * Hook to fetch all users (admin only)
 */
export function useAllUsers(page = 1, page_size = 10) {
    return useQuery({
        queryKey: userQueryKeys.list(page, page_size),
        queryFn: () => getAllUsers(page, page_size),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

/**
 * Hook to fetch user by ID
 */
export function useUser(userId: string) {
    return useQuery({
        queryKey: userQueryKeys.detail(userId),
        queryFn: () => getUserById(userId),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook for creating a new user
 */
export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUser,
        onSuccess: (newUser) => {
            logger.info({ userId: newUser.id }, "User created successfully");
            // Invalidate user lists to refetch
            queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
            // Add new user to cache
            queryClient.setQueryData(userQueryKeys.detail(newUser.id), newUser);
            toast.success(`User ${newUser.email} created successfully`);
        },
        onError: (error) => {
            logger.error({ error }, "Failed to create user");
            toast.error("Failed to create user");
        },
    });
}

/**
 * Hook for updating a user
 */
export function useUpdateUser(userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: Partial<CreateUserPayload>) => updateUser(userId, payload),
        onSuccess: (updatedUser) => {
            logger.info({ userId }, "User updated successfully");
            // Update cache
            queryClient.setQueryData(userQueryKeys.detail(userId), updatedUser);
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
            toast.success("User updated successfully");
        },
        onError: (error) => {
            logger.error({ error, userId }, "Failed to update user");
            toast.error("Failed to update user");
        },
    });
}

/**
 * Hook for deleting a user
 */
export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteUser,
        onSuccess: (_, userId) => {
            logger.info({ userId }, "User deleted successfully");
            // Remove from cache
            queryClient.removeQueries({ queryKey: userQueryKeys.detail(userId) });
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
            toast.success("User deleted successfully");
        },
        onError: (error) => {
            logger.error({ error }, "Failed to delete user");
            toast.error("Failed to delete user");
        },
    });
}

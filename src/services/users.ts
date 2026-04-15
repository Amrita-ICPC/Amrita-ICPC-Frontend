/**
 * Users service - handles all user-related API calls
 * Pattern for creating services that consume the API
 */

import { api } from "@/lib/api-client";
import { logger } from "@/lib/logger";

export interface UserProfile {
    id: string;
    email: string;
    name?: string;
    roles?: string[];
    groups?: string[];
    created_at?: string;
    updated_at?: string;
}

export interface CreateUserPayload {
    email: string;
    name?: string;
    password: string;
    roles?: string[];
}

/**
 * Get current logged-in user profile
 */
export async function getCurrentUser(): Promise<UserProfile> {
    try {
        logger.info("Fetching current user profile");
        return await api.get<UserProfile>("/api/v1/users/me");
    } catch (error) {
        logger.error({ error }, "Failed to fetch current user");
        throw error;
    }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(
    page = 1,
    page_size = 10,
): Promise<{ data: UserProfile[]; total: number }> {
    try {
        logger.info({ page, page_size }, "Fetching all users");
        return await api.get(`/api/v1/users?page=${page}&page_size=${page_size}`);
    } catch (error) {
        logger.error({ error }, "Failed to fetch users");
        throw error;
    }
}

/**
 * Create a new user (admin only)
 */
export async function createUser(payload: CreateUserPayload): Promise<UserProfile> {
    try {
        logger.info({ email: payload.email }, "Creating new user");
        return await api.post<UserProfile>("/api/v1/users", payload);
    } catch (error) {
        logger.error({ error, email: payload.email }, "Failed to create user");
        throw error;
    }
}

/**
 * Get user by ID (admin/self access)
 */
export async function getUserById(userId: string): Promise<UserProfile> {
    try {
        logger.info({ userId }, "Fetching user by ID");
        return await api.get<UserProfile>(`/api/v1/users/${userId}`);
    } catch (error) {
        logger.error({ error, userId }, "Failed to fetch user");
        throw error;
    }
}

/**
 * Update user profile
 */
export async function updateUser(
    userId: string,
    payload: Partial<CreateUserPayload>,
): Promise<UserProfile> {
    try {
        logger.info({ userId }, "Updating user");
        return await api.patch<UserProfile>(`/api/v1/users/${userId}`, payload);
    } catch (error) {
        logger.error({ error, userId }, "Failed to update user");
        throw error;
    }
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(userId: string): Promise<void> {
    try {
        logger.info({ userId }, "Deleting user");
        await api.delete(`/api/v1/users/${userId}`);
    } catch (error) {
        logger.error({ error, userId }, "Failed to delete user");
        throw error;
    }
}

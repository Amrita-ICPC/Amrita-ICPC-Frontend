import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiResponse } from "@/types/api";
import type {
    UserResponse,
    ListUsersApiV1UsersGetParams,
    AudienceBriefResponse,
    ListUserAudiencesApiV1AudiencesMyGetParams,
} from "@/api/generated/model";
import { getUsers } from "@/api/generated/users/users";
import { ApiError } from "@/lib/api/error";
import { getAudiences } from "@/api/generated/audiences/audiences";

const usersApi = getUsers();
const audienceApi = getAudiences();

export const userKeys = {
    all: ["users"] as const,
    lists: () => [...userKeys.all, "list"] as const,
    list: (params: ListUsersApiV1UsersGetParams) => [...userKeys.lists(), params] as const,
};

/**
 * Fetches a paginated list of users based on the provided filters.
 *
 * @param params Filtering and pagination parameters.
 * @return A promise resolving to an ApiResponse containing the user list.
 * @throws {ApiError} If the request fails or returns success: false.
 */
async function fetchUsers(
    params: ListUsersApiV1UsersGetParams,
): Promise<ApiResponse<UserResponse[]>> {
    const response = await usersApi.listUsersApiV1UsersGet({
        page: params.page,
        page_size: params.page_size,
        role: params.role,
        q: params.q,
    });

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to load users", {
            status: response.status,
        });
    }

    const items = (response.data ?? []) as UserResponse[];

    return {
        success: response.success ?? true,
        status: response.status ?? 200,
        message: response.message ?? "",
        data: items,
        pagination: response.pagination ?? undefined,
        meta: response.meta,
    };
}

/**
 * TanStack Query hook for fetching a paginated list of users.
 *
 * @param params Filtering and pagination parameters.
 * @return The query result for the user list.
 */
export function useUsers(params: ListUsersApiV1UsersGetParams = {}) {
    return useQuery({
        queryKey: userKeys.list(params),
        queryFn: () => fetchUsers(params),
        placeholderData: keepPreviousData,
        retry: false,
    });
}

/**
 * Fetches the list of audiences associated with the current user.
 *
 * @param params Pagination and search parameters.
 * @return A promise resolving to an ApiResponse containing the user's audiences.
 * @throws {ApiError} If the request fails or returns success: false.
 */
async function fetchUserAudiences(
    params?: ListUserAudiencesApiV1AudiencesMyGetParams,
): Promise<ApiResponse<AudienceBriefResponse[]>> {
    const response = await audienceApi.listUserAudiencesApiV1AudiencesMyGet({
        page: params?.page,
        page_size: params?.page_size,
        q: params?.q,
    });

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to load user audiences", {
            status: response.status,
        });
    }

    const items = (response.data ?? []) as AudienceBriefResponse[];
    return {
        success: response.success ?? true,
        status: response.status ?? 200,
        message: response.message ?? "",
        data: items,
        pagination: response.pagination ?? undefined,
        meta: response.meta,
    };
}

/**
 * TanStack Query hook for fetching the current user's audiences.
 *
 * @param params Pagination and search parameters.
 * @return The query result for the user's audiences list.
 */
export function useUserAudiences(params?: ListUserAudiencesApiV1AudiencesMyGetParams) {
    return useQuery({
        queryKey: ["userAudiences", params?.page, params?.page_size, params?.q] as const,
        queryFn: () => fetchUserAudiences(params),
        placeholderData: keepPreviousData,
        retry: false,
    });
}

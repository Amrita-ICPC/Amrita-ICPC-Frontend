import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiResponse } from "@/types/api";
import type { UserResponse, ListUsersApiV1UsersGetParams } from "@/api/generated/model";
import { getUsers } from "@/api/generated/users/users";
import { ApiError } from "@/lib/api/error";

const usersApi = getUsers();

export const userKeys = {
    all: ["users"] as const,
    lists: () => [...userKeys.all, "list"] as const,
    list: (params: ListUsersApiV1UsersGetParams) => [...userKeys.lists(), params] as const,
};

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

export function useUsers(params: ListUsersApiV1UsersGetParams = {}) {
    return useQuery({
        queryKey: userKeys.list(params),
        queryFn: () => fetchUsers(params),
        placeholderData: keepPreviousData,
        retry: false,
    });
}

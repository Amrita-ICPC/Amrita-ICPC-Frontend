import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getAudiences } from "@/api/generated/audiences/audiences";
import type {
    AudienceResponse,
    AudienceType,
    AudienceUsersResponse,
    ListAudienceUsersApiV1AudiencesAudienceIdUsersGetParams,
    ListAudiencesApiV1AudiencesGetParams,
} from "@/api/generated/model";
import type { ApiResponse } from "@/types/api";
import { ApiError } from "@/lib/api/error";

/**
 * @fileoverview Audience query and mutation hooks.
 *
 * This module provides a thin TanStack Query wrapper around the Orval-generated
 * audiences axios client. It exposes list/detail queries and CRUD/membership
 * mutations for the `/api/v1/audiences` routes.
 *
 * Conventions:
 * - Query functions throw `ApiError` when the backend returns `success: false`.
 *   This allows UI to surface `status` + `message` consistently.
 * - Query keys are stable primitives derived from request params (page, pageSize,
 *   search query, etc) to ensure correct caching and invalidation.
 */

const audiencesApi = getAudiences();

type AudienceListParams = ListAudiencesApiV1AudiencesGetParams & {
    audience_type?: AudienceType | null;
};

const audienceKeys = {
    all: ["audiences"] as const,
    lists: () => [...audienceKeys.all, "list"] as const,
    list: (params: ListAudiencesApiV1AudiencesGetParams = {}) =>
        // Note: `audience_type` isn't currently present in the generated params type,
        // but the backend may still accept it. We include it in the cache key when present.
        [
            ...audienceKeys.lists(),
            params.page,
            params.page_size,
            params.q,
            (params as AudienceListParams).audience_type,
        ] as const,
    details: () => [...audienceKeys.all, "detail"] as const,
    detail: (audienceId: string) => [...audienceKeys.details(), audienceId] as const,
    users: (
        audienceId: string,
        params: ListAudienceUsersApiV1AudiencesAudienceIdUsersGetParams = {},
    ) => [...audienceKeys.detail(audienceId), "users", "list", params] as const,
};

/**
 * Fetches a paginated list of audiences based on the provided filters.
 *
 * @param params Filtering and pagination parameters.
 * @return A promise resolving to an ApiResponse containing the audience list.
 * @throws {ApiError} If the API request fails or returns success: false.
 */
async function fetchAudiences(
    params: AudienceListParams = {},
): Promise<ApiResponse<AudienceResponse[]>> {
    const response = await audiencesApi.listAudiencesApiV1AudiencesGet(
        params as ListAudiencesApiV1AudiencesGetParams,
    );

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to load audiences", {
            status: response.status,
        });
    }

    return {
        success: response.success ?? true,
        status: response.status ?? 200,
        message: response.message ?? "",
        data: (response.data ?? []) as AudienceResponse[],
        pagination: response.pagination ?? undefined,
        meta: response.meta ?? undefined,
    };
}

/**
 * TanStack Query hook for fetching a paginated list of audiences.
 *
 * @param params Filtering and pagination parameters.
 * @return The query result for the audience list.
 */
export function useAudiences(params: AudienceListParams = {}) {
    return useQuery({
        queryKey: audienceKeys.list(params),
        queryFn: () => fetchAudiences(params),
        placeholderData: keepPreviousData,
        retry: false,
    });
}

/**
 * Fetches the details of a specific audience.
 *
 * @param audienceId The unique identifier of the audience.
 * @return A promise resolving to the audience response data.
 * @throws {ApiError} If the audience is not found or the request fails.
 */
async function fetchAudience(audienceId: string): Promise<AudienceResponse> {
    const response = await audiencesApi.getAudienceApiV1AudiencesAudienceIdGet(audienceId);

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to load audience", {
            status: response.status,
        });
    }

    if (!response?.data) {
        throw new ApiError("Audience request succeeded but no data was returned", {
            status: response?.status,
        });
    }

    return response.data as AudienceResponse;
}

/**
 * TanStack Query hook for fetching audience details.
 *
 * @param audienceId The unique identifier of the audience.
 * @return The query result for the audience details.
 */
export function useAudience(audienceId: string | null | undefined) {
    return useQuery({
        queryKey: audienceId ? audienceKeys.detail(audienceId) : audienceKeys.details(),
        queryFn: () => fetchAudience(audienceId as string),
        enabled: !!audienceId,
        retry: false,
    });
}

/**
 * Fetches the list of users associated with a specific audience.
 *
 * @param audienceId The unique identifier of the audience.
 * @param params Pagination and filtering parameters for users.
 * @return A promise resolving to an ApiResponse containing the audience users.
 * @throws {ApiError} If the request fails or returns success: false.
 */
async function fetchAudienceUsers(
    audienceId: string,
    params: ListAudienceUsersApiV1AudiencesAudienceIdUsersGetParams = {},
): Promise<ApiResponse<AudienceUsersResponse>> {
    const response = await audiencesApi.listAudienceUsersApiV1AudiencesAudienceIdUsersGet(
        audienceId,
        params,
    );

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to load audience users", {
            status: response.status,
        });
    }

    if (!response?.data) {
        throw new ApiError("Audience users request succeeded but no data was returned", {
            status: response?.status,
        });
    }

    return {
        success: response.success ?? true,
        status: response.status ?? 200,
        message: response.message ?? "",
        data: response.data as AudienceUsersResponse,
        pagination: response.pagination ?? undefined,
        meta: response.meta ?? undefined,
    };
}

/**
 * TanStack Query hook for fetching audience users.
 *
 * @param audienceId The unique identifier of the audience.
 * @param params Pagination and filtering parameters.
 * @return The query result for the audience users list.
 */
export function useAudienceUsers(
    audienceId: string | null | undefined,
    params: ListAudienceUsersApiV1AudiencesAudienceIdUsersGetParams = {},
) {
    return useQuery({
        queryKey: audienceId ? audienceKeys.users(audienceId, params) : audienceKeys.all,
        queryFn: () => fetchAudienceUsers(audienceId as string, params),
        enabled: !!audienceId,
        placeholderData: keepPreviousData,
        retry: false,
    });
}

export { audienceKeys };

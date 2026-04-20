import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userKeys } from "./user-query";

import { getAudiences } from "@/api/generated/audiences/audiences";
import type {
    AudienceCreate,
    AudienceResponse,
    AudienceType,
    AudienceUpdate,
    AudienceUserBulkDataEmail,
    AudienceUsersBulkRequest,
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

export function useAudiences(params: AudienceListParams = {}) {
    return useQuery({
        queryKey: audienceKeys.list(params),
        queryFn: () => fetchAudiences(params),
        placeholderData: keepPreviousData,
        retry: false,
    });
}

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

export function useAudience(audienceId: string | null | undefined) {
    return useQuery({
        queryKey: audienceId ? audienceKeys.detail(audienceId) : audienceKeys.details(),
        queryFn: () => fetchAudience(audienceId as string),
        enabled: !!audienceId,
        retry: false,
    });
}

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

async function createAudience(payload: AudienceCreate) {
    const response = await audiencesApi.createAudienceApiV1AudiencesPost(payload);

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to create audience", {
            status: response.status,
        });
    }

    return response;
}

export function useCreateAudience() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAudience,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: audienceKeys.all });
        },
    });
}

async function updateAudience(input: { audienceId: string; payload: AudienceUpdate }) {
    const response = await audiencesApi.updateAudienceApiV1AudiencesAudienceIdPatch(
        input.audienceId,
        input.payload,
    );

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to update audience", {
            status: response.status,
        });
    }

    return response;
}

export function useUpdateAudience() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateAudience,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: audienceKeys.all });
            queryClient.invalidateQueries({ queryKey: audienceKeys.detail(variables.audienceId) });
        },
    });
}

async function deleteAudience(audienceId: string) {
    const response = await audiencesApi.deleteAudienceApiV1AudiencesAudienceIdDelete(audienceId);

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to delete audience", {
            status: response.status,
        });
    }

    return response;
}

export function useDeleteAudience() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAudience,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: audienceKeys.all });
        },
    });
}

async function addUsersToAudience(input: {
    audienceId: string;
    payload: AudienceUsersBulkRequest;
}) {
    const response = await audiencesApi.addUsersToAudienceApiV1AudiencesAudienceIdUsersPost(
        input.audienceId,
        input.payload,
    );

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to add users to audience", {
            status: response.status,
        });
    }

    return response;
}

export function useAddAudienceUsers() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addUsersToAudience,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: [...audienceKeys.detail(variables.audienceId), "users"],
            });
            queryClient.invalidateQueries({ queryKey: audienceKeys.detail(variables.audienceId) });
            queryClient.refetchQueries({ queryKey: userKeys.all });
        },
    });
}

async function removeUsersFromAudience(input: {
    audienceId: string;
    payload: AudienceUsersBulkRequest;
}) {
    const response = await audiencesApi.removeUsersFromAudienceApiV1AudiencesAudienceIdUsersDelete(
        input.audienceId,
        input.payload,
    );

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to remove users from audience", {
            status: response.status,
        });
    }

    return response;
}

export function useRemoveAudienceUsers() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeUsersFromAudience,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: [...audienceKeys.detail(variables.audienceId), "users"],
            });
            queryClient.invalidateQueries({ queryKey: audienceKeys.detail(variables.audienceId) });
            queryClient.refetchQueries({ queryKey: userKeys.all });
        },
    });
}

async function addUsersToAudienceByEmail(input: {
    audienceId: string;
    payload: AudienceUserBulkDataEmail;
}) {
    const response =
        await audiencesApi.addUsersToAudienceByEmailApiV1AudiencesAudienceIdUsersEmailPost(
            input.audienceId,
            input.payload,
        );

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to add users by email", {
            status: response.status,
        });
    }

    return response;
}

export function useAddAudienceUsersByEmail() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addUsersToAudienceByEmail,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: [...audienceKeys.detail(variables.audienceId), "users"],
            });
            queryClient.invalidateQueries({ queryKey: audienceKeys.detail(variables.audienceId) });
            queryClient.refetchQueries({ queryKey: userKeys.all });
        },
    });
}

export { audienceKeys };

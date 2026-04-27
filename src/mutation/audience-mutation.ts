import { useMutation, useQueryClient } from "@tanstack/react-query";
import { audienceKeys } from "@/query/audience-query";
import { userKeys } from "@/query/user-query";
import { getAudiences } from "@/api/generated/audiences/audiences";
import type {
    AudienceCreate,
    AudienceUpdate,
    AudienceUserBulkDataEmail,
    AudienceUsersBulkRequest,
} from "@/api/generated/model";
import { ApiError } from "@/lib/api/error";

const audiencesApi = getAudiences();

/**
 * Creates a new audience.
 *
 * @param payload The data for the audience to be created.
 * @return A promise resolving to the created audience response.
 * @throws {ApiError} If the creation fails.
 */
async function createAudience(payload: AudienceCreate) {
    const response = await audiencesApi.createAudienceApiV1AudiencesPost(payload);

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to create audience", {
            status: response.status,
        });
    }

    return response;
}

/**
 * TanStack Mutation hook for creating a new audience.
 * Invalidates the audience list upon success.
 *
 * @return The mutation hook for creating an audience.
 */
export function useCreateAudience() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAudience,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: audienceKeys.all });
        },
    });
}

/**
 * Updates an existing audience.
 *
 * @param input An object containing the audienceId and the update payload.
 * @return A promise resolving to the updated audience response.
 * @throws {ApiError} If the update fails.
 */
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

/**
 * TanStack Mutation hook for updating an audience.
 * Invalidates the audience list and detail queries upon success.
 *
 * @return The mutation hook for updating an audience.
 */
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

/**
 * Deletes an audience.
 *
 * @param audienceId The unique identifier of the audience to delete.
 * @return A promise resolving to the deletion response.
 * @throws {ApiError} If the deletion fails.
 */
async function deleteAudience(audienceId: string) {
    const response = await audiencesApi.deleteAudienceApiV1AudiencesAudienceIdDelete(audienceId);

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to delete audience", {
            status: response.status,
        });
    }

    return response;
}

/**
 * TanStack Mutation hook for deleting an audience.
 * Invalidates the audience list and detail queries upon success.
 *
 * @return The mutation hook for deleting an audience.
 */
export function useDeleteAudience() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAudience,
        onSuccess: (_data, audienceId) => {
            queryClient.invalidateQueries({ queryKey: audienceKeys.all });
            queryClient.invalidateQueries({ queryKey: audienceKeys.detail(audienceId) });
        },
    });
}

/**
 * Adds multiple users to an audience by their user IDs.
 *
 * @param input Object containing the audienceId and user IDs payload.
 * @return A promise resolving to the operation response.
 * @throws {ApiError} If the operation fails.
 */
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

/**
 * TanStack Mutation hook for adding users to an audience.
 * Invalidates related users and audience queries upon success.
 *
 * @return The mutation hook for adding audience users.
 */
export function useAddAudienceUsers() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addUsersToAudience,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: [...audienceKeys.detail(variables.audienceId), "users"],
            });
            queryClient.invalidateQueries({ queryKey: audienceKeys.detail(variables.audienceId) });
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
    });
}

/**
 * Removes multiple users from an audience by their user IDs.
 *
 * @param input Object containing the audienceId and user IDs payload.
 * @return A promise resolving to the operation response.
 * @throws {ApiError} If the operation fails.
 */
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

/**
 * TanStack Mutation hook for removing users from an audience.
 * Invalidates related users and audience queries upon success.
 *
 * @return The mutation hook for removing audience users.
 */
export function useRemoveAudienceUsers() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeUsersFromAudience,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: [...audienceKeys.detail(variables.audienceId), "users"],
            });
            queryClient.invalidateQueries({ queryKey: audienceKeys.detail(variables.audienceId) });
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
    });
}

/**
 * Adds multiple users to an audience by their email addresses.
 *
 * @param input Object containing the audienceId and email list payload.
 * @return A promise resolving to the operation response.
 * @throws {ApiError} If the operation fails.
 */
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

/**
 * TanStack Mutation hook for adding users to an audience by email.
 * Invalidates related users and audience queries upon success.
 *
 * @return The mutation hook for adding audience users by email.
 */
export function useAddAudienceUsersByEmail() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addUsersToAudienceByEmail,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: [...audienceKeys.detail(variables.audienceId), "users"],
            });
            queryClient.invalidateQueries({ queryKey: audienceKeys.detail(variables.audienceId) });
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
    });
}

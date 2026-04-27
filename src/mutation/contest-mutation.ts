import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contestKeys } from "@/query/contest-query";
import { getContests } from "@/api/generated/contests/contests";
import { getImages } from "@/api/generated/images/images";
import {
    type ContestAudienceManageRequest,
    type ContestCreate,
    type ContestUpdate,
    type ImageUploadResponse,
    type InstructorManageRequest,
} from "@/api/generated/model";
import { ApiError } from "@/lib/api/error";

const contestsApi = getContests();
const imagesApi = getImages();

/**
 * TanStack Mutation hook for assigning audiences to a contest.
 * Invalidates the contest audiences query upon success.
 *
 * @param contestId The unique identifier of the contest.
 * @return The mutation hook for assigning audiences.
 */
export function useAssignAudiences(contestId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: ContestAudienceManageRequest) =>
            contestsApi.assignAudiencesToContestApiV1ContestsContestIdAudiencesPost(
                contestId,
                payload,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [...contestKeys.detail(contestId), "audiences"],
            });
        },
    });
}

/**
 * TanStack Mutation hook for removing audiences from a contest.
 * Invalidates the contest audiences query upon success.
 *
 * @param contestId The unique identifier of the contest.
 * @return The mutation hook for removing audiences.
 */
export function useRemoveAudiences(contestId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: ContestAudienceManageRequest) =>
            contestsApi.removeAudiencesFromContestApiV1ContestsContestIdAudiencesDelete(
                contestId,
                payload,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [...contestKeys.detail(contestId), "audiences"],
            });
        },
    });
}

/**
 * TanStack Mutation hook for assigning instructors to a contest.
 * Invalidates the contest instructors query upon success.
 *
 * @param contestId The unique identifier of the contest.
 * @return The mutation hook for assigning instructors.
 */
export function useAssignInstructors(contestId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: InstructorManageRequest) =>
            contestsApi.assignInstructorsToContestApiV1ContestsContestIdInstructorsPost(
                contestId,
                payload,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [...contestKeys.detail(contestId), "instructors"],
            });
        },
    });
}

/**
 * TanStack Mutation hook for removing instructors from a contest.
 * Invalidates the contest instructors query upon success.
 *
 * @param contestId The unique identifier of the contest.
 * @return The mutation hook for removing instructors.
 */
export function useRemoveInstructors(contestId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: InstructorManageRequest) =>
            contestsApi.removeInstructorsFromContestApiV1ContestsContestIdInstructorsDelete(
                contestId,
                payload,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [...contestKeys.detail(contestId), "instructors"],
            });
        },
    });
}

/**
 * Creates a new contest.
 *
 * @param contestData The data for the contest to be created.
 * @return A promise resolving to the created contest response.
 * @throws {ApiError} If the creation fails.
 */
async function createContest(contestData: ContestCreate) {
    const response = await contestsApi.createContestApiV1ContestsPost(contestData);

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to create contest", {
            status: response.status,
        });
    }

    return response;
}

/**
 * TanStack Mutation hook for creating a new contest.
 * Invalidates the contest list upon success.
 *
 * @return The mutation hook for creating a contest.
 */
export function useCreateContest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createContest,
        onSuccess: () => {
            // Invalidate contests list to refetch updated data after creating a contest
            queryClient.invalidateQueries({ queryKey: contestKeys.all });
        },
    });
}

/**
 * Updates an existing contest.
 *
 * @param input Object containing contestId and the updated contest data.
 * @return A promise resolving to the updated contest response.
 * @throws {ApiError} If the update fails.
 */
async function updateContest(input: { contestId: string; contestData: ContestUpdate }) {
    const response = await contestsApi.updateContestApiV1ContestsContestIdPatch(
        input.contestId,
        input.contestData,
    );

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to update contest", {
            status: response.status,
        });
    }

    return response;
}

/**
 * TanStack Mutation hook for updating a contest.
 * Updates local cache or invalidates queries upon success.
 *
 * @return The mutation hook for updating a contest.
 */
export function useUpdateContest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateContest,
        onSuccess: (response, variables) => {
            // The list invalidation works, so we keep it.
            queryClient.invalidateQueries({ queryKey: contestKeys.lists() });

            const updatedContest = response?.data;
            if (updatedContest) {
                queryClient.setQueryData(contestKeys.detail(variables.contestId), updatedContest);
            } else {
                // If the mutation response doesn't have data, fall back to invalidation.
                queryClient.invalidateQueries({
                    queryKey: contestKeys.detail(variables.contestId),
                });
            }
        },
    });
}

/**
 * Uploads an image for a contest.
 *
 * @param file The image file to upload.
 * @return A promise resolving to the image upload response.
 * @throws {ApiError} If the upload fails.
 */
async function uploadContestImage(file: File): Promise<ImageUploadResponse> {
    const response = await imagesApi.uploadImageApiV1UploadPost({ file });

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Image upload failed", {
            status: response.status,
        });
    }

    if (!response?.data) {
        throw new ApiError("Image upload succeeded but no data was returned", {
            status: response?.status,
        });
    }

    return response.data;
}

/**
 * TanStack Mutation hook for uploading a contest image.
 *
 * @return The mutation hook for uploading an image.
 */
export function useUploadContestImage() {
    return useMutation({
        mutationFn: uploadContestImage,
    });
}

/**
 * Soft deletes a contest.
 *
 * @param contestId The unique identifier of the contest to delete.
 * @return A promise resolving to the deletion response.
 * @throws {ApiError} If the deletion fails.
 */
async function softDeleteContest(contestId: string) {
    const response =
        await contestsApi.softDeleteContestApiV1ContestsContestIdSoftDeleteDelete(contestId);

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to delete contest", {
            status: response.status,
        });
    }

    return response;
}

/**
 * TanStack Mutation hook for soft deleting a contest.
 * Invalidates the contest list upon success.
 *
 * @return The mutation hook for deleting a contest.
 */
export function useSoftDeleteContest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: softDeleteContest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contestKeys.all });
        },
    });
}

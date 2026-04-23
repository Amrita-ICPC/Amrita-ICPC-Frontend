import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiResponse } from "@/types/api";
import type { GetContestsParams } from "@/types/contest";
import {
    type ContestAudienceManageRequest,
    type ContestAudienceResponse,
    ContestCreate,
    type ContestDetailResponse,
    type ContestSummaryResponse,
    type ImageUploadResponse,
    type InstructorManageRequest,
    type InstructorResponse,
} from "@/api/generated/model";
import { getContests } from "@/api/generated/contests/contests";
import { getImages } from "@/api/generated/images/images";
import { ApiError } from "@/lib/api/error";

const contestsApi = getContests();
const imagesApi = getImages();

const contestKeys = {
    all: ["contests"] as const,
    lists: () => [...contestKeys.all, "list"] as const,
    list: (params: GetContestsParams) =>
        [
            "contests",
            params.page,
            params.page_size,
            params.search,
            params.contest_status,
            params.is_public,
        ] as const,
    details: () => [...contestKeys.all, "detail"] as const,
    detail: (id: string) => [...contestKeys.details(), id] as const,
};

async function fetchContestDetail(id: string): Promise<ContestDetailResponse> {
    const response = await contestsApi.getContestApiV1ContestsContestIdGet(id);

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to load contest details", {
            status: response.status,
        });
    }

    if (!response?.data) {
        throw new ApiError("Contest details not found", {
            status: 404,
        });
    }

    return response.data;
}

export function useContestDetail(id: string) {
    return useQuery({
        queryKey: contestKeys.detail(id),
        queryFn: () => fetchContestDetail(id),
        enabled: !!id,
    });
}

export function useContestAudiences(contestId: string) {
    return useQuery({
        queryKey: [...contestKeys.detail(contestId), "audiences"],
        queryFn: async () => {
            const response =
                await contestsApi.getContestAudiencesApiV1ContestsContestIdAudiencesGet(contestId);
            if (response.success === false) {
                throw new ApiError(response.message ?? "Failed to load audiences", {
                    status: response.status,
                });
            }
            return response.data as ContestAudienceResponse[];
        },
        enabled: !!contestId,
    });
}

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

export function useContestInstructors(contestId: string) {
    return useQuery({
        queryKey: [...contestKeys.detail(contestId), "instructors"],
        queryFn: async () => {
            const response =
                await contestsApi.getContestInstructorsApiV1ContestsContestIdInstructorsGet(
                    contestId,
                );
            if (response.success === false) {
                throw new ApiError(response.message ?? "Failed to load instructors", {
                    status: response.status,
                });
            }
            return response.data as InstructorResponse[];
        },
        enabled: !!contestId,
    });
}

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

async function fetchContests(
    params: GetContestsParams,
): Promise<ApiResponse<ContestSummaryResponse[]>> {
    const response = await contestsApi.getAllContestsApiV1ContestsGet({
        page: params.page,
        page_size: params.page_size,
        search: params.search,
        contest_status: params.contest_status as never,
        is_public: params.is_public,
    });

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to load contests", {
            status: response.status,
        });
    }

    const items = (response.data ?? []) as ContestSummaryResponse[];

    return {
        success: response.success ?? true,
        status: response.status ?? 200,
        message: response.message ?? "",
        data: items,
        pagination: response.pagination ?? undefined,
        meta: response.meta ?? undefined,
    };
}

export function useContests(params: GetContestsParams = {}) {
    return useQuery({
        queryKey: contestKeys.list(params),
        queryFn: () => fetchContests(params),
        placeholderData: keepPreviousData,
        retry: false,
    });
}

//create contest mutation
async function createContest(contestData: ContestCreate) {
    const response = await contestsApi.createContestApiV1ContestsPost(contestData);

    if (response?.success === false) {
        throw new ApiError(response.message ?? "Failed to create contest", {
            status: response.status,
        });
    }

    return response;
}

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

//upload image
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

export function useUploadContestImage() {
    return useMutation({
        mutationFn: uploadContestImage,
    });
}

// soft delete contest
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

export function useSoftDeleteContest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: softDeleteContest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contestKeys.all });
        },
    });
}

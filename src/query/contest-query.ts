import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiResponse } from "@/types/api";
import type { GetContestsParams } from "@/types/contest";
import {
    type ContestAudienceResponse,
    type ContestDetailResponse,
    type ContestSummaryResponse,
    type InstructorResponse,
} from "@/api/generated/model";
import { getContests } from "@/api/generated/contests/contests";
import { ApiError } from "@/lib/api/error";

const contestsApi = getContests();

export const contestKeys = {
    all: ["contests"] as const,
    lists: () => [...contestKeys.all, "list"] as const,
    list: (params: GetContestsParams) =>
        [
            ...contestKeys.lists(),
            params.page,
            params.page_size,
            params.search,
            params.contest_status,
            params.is_public,
        ] as const,
    details: () => [...contestKeys.all, "detail"] as const,
    detail: (id: string) => [...contestKeys.details(), id] as const,
};

/**
 * Fetches the details of a specific contest.
 *
 * @param id The unique identifier of the contest.
 * @return A promise resolving to the contest detail response.
 * @throws {ApiError} If the contest is not found or the request fails.
 */
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

/**
 * TanStack Query hook for fetching contest details.
 *
 * @param id The unique identifier of the contest.
 * @return The query result for the contest details.
 */
export function useContestDetail(id: string) {
    return useQuery({
        queryKey: contestKeys.detail(id),
        queryFn: () => fetchContestDetail(id),
        enabled: !!id,
    });
}

/**
 * TanStack Query hook for fetching audiences assigned to a contest.
 *
 * @param contestId The unique identifier of the contest.
 * @return The query result for the contest audiences list.
 */
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

/**
 * TanStack Query hook for fetching instructors assigned to a contest.
 *
 * @param contestId The unique identifier of the contest.
 * @return The query result for the contest instructors list.
 */
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

/**
 * Fetches a paginated list of contests based on the provided filters.
 *
 * @param params Filtering and pagination parameters.
 * @return A promise resolving to an ApiResponse containing the contest summary list.
 * @throws {ApiError} If the request fails or returns success: false.
 */
async function fetchContests(
    params: GetContestsParams,
): Promise<ApiResponse<ContestSummaryResponse[]>> {
    const response = await contestsApi.getAllContestsApiV1ContestsGet({
        page: params.page,
        page_size: params.page_size,
        search: params.search,
        contest_status: params.contest_status,
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

/**
 * TanStack Query hook for fetching a paginated list of contests.
 *
 * @param params Filtering and pagination parameters.
 * @return The query result for the contest list.
 */
export function useContests(params: GetContestsParams = {}) {
    return useQuery({
        queryKey: contestKeys.list(params),
        queryFn: () => fetchContests(params),
        placeholderData: keepPreviousData,
        retry: false,
    });
}

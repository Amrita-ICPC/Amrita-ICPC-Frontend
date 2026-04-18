import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiResponse } from "@/types/api";
import type { Contest, GetContestsParams } from "@/types/contest";
import { api } from "@/lib/api/client";

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
};

async function fetchContests(params: GetContestsParams): Promise<ApiResponse<Contest[]>> {
    const queryParams: Record<string, string> = {};

    if (params.page) queryParams.page = String(params.page);
    if (params.page_size) queryParams.page_size = String(params.page_size);
    if (params.search) queryParams.search = params.search;
    if (params.contest_status) queryParams.contest_status = String(params.contest_status);
    if (typeof params.is_public === "boolean") queryParams.is_public = String(params.is_public);

    const response = await api.get<ApiResponse<Contest[]>>("/contests", { params: queryParams });

    return response.data;
}

export function useContests(params: GetContestsParams = {}) {
    return useQuery({
        queryKey: contestKeys.list(params),
        queryFn: () => fetchContests(params),
        placeholderData: keepPreviousData,
        retry: false,
    });
}

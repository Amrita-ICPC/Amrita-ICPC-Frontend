import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiResponse } from "@/types/api";
import type { Contest, GetContestsParams } from "@/types/contest";

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
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set("page", String(params.page));
    if (params.page_size) searchParams.set("page_size", String(params.page_size));
    if (params.search) searchParams.set("search", params.search);
    if (params.contest_status) searchParams.set("contest_status", String(params.contest_status));
    if (typeof params.is_public === "boolean")
        searchParams.set("is_public", String(params.is_public));

    const url = `/api/contests${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

    const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store", // Bypass browser HTTP caching
    });

    const json = (await res.json()) as unknown;

    if (!res.ok) {
        const message =
            typeof json === "object" && json !== null && "message" in json
                ? String((json as { message: unknown }).message)
                : "Failed to load contests";
        throw new Error(message);
    }

    return json as ApiResponse<Contest[]>;
}

export function useContests(params: GetContestsParams = {}) {
    return useQuery({
        queryKey: contestKeys.list(params),
        queryFn: () => fetchContests(params),
        placeholderData: keepPreviousData,
        retry: false,
    });
}

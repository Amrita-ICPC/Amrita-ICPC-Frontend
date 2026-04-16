import "server-only";

import type { ApiResponse } from "@/types/api";
import type { Contest } from "@/types/contest";
import { getServerApiClient } from "@/lib/api/server";

export type GetContestsServerParams = {
    page?: number;
    page_size?: number;
    contest_status?: string;
    search?: string;
    is_public?: boolean;
};

export async function getContestsServer(
    params: GetContestsServerParams = {},
): Promise<ApiResponse<Contest[]>> {
    const api = await getServerApiClient();
    const response = await api.get<ApiResponse<Contest[]>>("/contests", { params });
    return response.data;
}

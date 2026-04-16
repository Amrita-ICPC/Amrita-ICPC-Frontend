"use client";

import { useContests } from "@/query/contest-query";
import type { GetContestsParams } from "@/types/contest";

export function ContestQueryJson({ params }: { params: GetContestsParams }) {
    const contestsQuery = useContests(params);

    return (
        <pre className="overflow-x-auto rounded-lg bg-black/30 p-4 text-sm text-white/90">
            {JSON.stringify(
                {
                    status: contestsQuery.status,
                    fetchStatus: contestsQuery.fetchStatus,
                    error: contestsQuery.error ? String(contestsQuery.error) : null,
                    data: contestsQuery.data,
                },
                null,
                2,
            )}
        </pre>
    );
}

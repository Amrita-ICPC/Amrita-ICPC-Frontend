"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useGetStudentContestsApiV1StudentsContestsGet } from "@/api/generated/students/students";
import type {
    ContestRunStatus,
    GetStudentContestsApiV1StudentsContestsGetParams,
} from "@/api/generated/model";
import { StudentContestFilters } from "./student-contest-filters";
import { StudentContestCard, StudentContestCardData } from "./student-contest-card";
import { StudentContestSkeleton } from "./student-contest-skeleton";
import { AppPagination } from "@/components/shared/app-pagination";
import { AsyncStateHandler } from "@/components/shared/async-state-handler";

interface StudentContestClientProps {
    initialParams: GetStudentContestsApiV1StudentsContestsGetParams;
}

export function StudentContestClient({ initialParams }: StudentContestClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const params: GetStudentContestsApiV1StudentsContestsGetParams = {
        ...initialParams,
        page: parseInt(searchParams.get("page") || String(initialParams.page || 1)),
        page_size: initialParams.page_size || 12,
        search: searchParams.get("search") || initialParams.search || undefined,
        min_team_size: searchParams.get("min_team_size")
            ? parseInt(searchParams.get("min_team_size")!)
            : undefined,
        max_team_size: searchParams.get("max_team_size")
            ? parseInt(searchParams.get("max_team_size")!)
            : undefined,
    };

    const rawRunStatus = searchParams.get("run_status");
    const runStatus = (rawRunStatus && rawRunStatus !== "all" ? rawRunStatus : undefined) as
        | ContestRunStatus
        | undefined;

    const { data, isLoading, isError, error, refetch } =
        useGetStudentContestsApiV1StudentsContestsGet(runStatus ? [runStatus] : undefined, params);

    const setPage = (newPage: number) => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("page", String(newPage));
        router.push(`${pathname}?${newParams.toString()}`);
    };

    const listData = data?.data;
    const contests = listData?.contests || [];
    const totalItems = listData?.total || 0;
    const pageSize = listData?.page_size || 12;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const currentPage = listData?.page || 1;

    return (
        <div className="flex flex-col gap-5">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <StudentContestFilters />
            </div>

            <AsyncStateHandler
                isLoading={isLoading}
                isError={isError}
                error={error}
                onRetry={refetch}
                loadingComponent={
                    <div className="grid grid-cols-1 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <StudentContestSkeleton key={i} />
                        ))}
                    </div>
                }
            >
                <div className="grid grid-cols-1 gap-6">
                    {contests.length > 0 ? (
                        contests.map((contest) => (
                            <StudentContestCard key={contest.id} contest={contest} />
                        ))
                    ) : (
                        <div className="col-span-full flex min-h-[200px] items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                            No contests found. Try adjusting your filters.
                        </div>
                    )}
                </div>

                {totalItems > pageSize && (
                    <div className="mt-4">
                        <AppPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            hasPrevious={currentPage > 1}
                            hasNext={listData?.has_more || false}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </AsyncStateHandler>
        </div>
    );
}

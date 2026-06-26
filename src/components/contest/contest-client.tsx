"use client";

import { ArrowRight, Calendar, Clock, FileQuestion, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useGetAllContestsApiV1ContestsGet } from "@/api/generated/contests/contests";
import type {
    ContestRunStatus,
    ContestStatus,
    ContestSummaryResponse,
    GetAllContestsApiV1ContestsGetParams,
} from "@/api/generated/model";
import { AppPagination } from "@/components/shared/app-pagination";
import { type ViewMode, ViewToggle } from "@/components/shared/view-toggle";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { AsyncStateHandler } from "../shared/async-state-handler";
import { ContestCard } from "./contest-card";
import { ContestFilters } from "./contest-filters";
import { ContestSkeleton } from "./contest-skeleton";

const CONTEST_STATUS_STYLES: Record<
    string,
    { bg: string; dot: string; label: string; text: string }
> = {
    PUBLISHED: {
        bg: "bg-emerald-500/10",
        dot: "bg-emerald-500",
        label: "Published",
        text: "text-emerald-700 dark:text-emerald-400",
    },
    DRAFT: {
        bg: "bg-amber-500/10",
        dot: "bg-amber-500",
        label: "Draft",
        text: "text-amber-700 dark:text-amber-400",
    },
    PAUSED: {
        bg: "bg-sky-500/10",
        dot: "bg-sky-600",
        label: "Paused",
        text: "text-sky-700 dark:text-sky-400",
    },
    CANCELLED: {
        bg: "bg-red-500/10",
        dot: "bg-red-500",
        label: "Cancelled",
        text: "text-red-700 dark:text-red-400",
    },
};

const RUN_STATUS_CLASSES: Record<string, string> = {
    LIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    UPCOMING: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    ENDED: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

function ContestListRow({ contest }: { contest: ContestSummaryResponse }) {
    const cStatus = CONTEST_STATUS_STYLES[contest.status] ?? CONTEST_STATUS_STYLES.DRAFT;
    const rStatus = RUN_STATUS_CLASSES[contest.run_status] ?? RUN_STATUS_CLASSES.UPCOMING;
    const contestCode = contest.id.split("-")[0].toUpperCase();

    const start = contest.start_time
        ? new Date(contest.start_time).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : "Not Scheduled";

    const startTimeStr = contest.start_time
        ? new Date(contest.start_time).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
          })
        : "";

    const runStatusLabel = contest.run_status === "ENDED" ? "COMPLETED" : contest.run_status;

    return (
        <Link
            href={`/contest/${contest.id}`}
            aria-label={`View contest ${contest.name}`}
            className="group relative flex min-h-[72px] flex-col gap-3 rounded-2xl border border-border bg-card p-3 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md md:flex-row md:items-center md:gap-4 block"
        >
            {/* Left: Big Icon Container */}
            <div className="hidden h-[64px] w-[64px] shrink-0 items-center justify-center rounded-2xl bg-primary/10 md:flex">
                <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full border-[2px] border-primary/50 text-primary">
                    <Trophy className="h-[18px] w-[18px]" />
                </div>
            </div>

            {/* Middle: Content */}
            <div className="flex flex-1 min-w-0 flex-col justify-center py-1">
                <div className="mb-1.5 flex items-center gap-1.5">
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-[9px] uppercase font-bold tracking-wider rounded h-5 px-1.5",
                            rStatus,
                        )}
                    >
                        {runStatusLabel}
                    </Badge>
                    <div className={cn("flex items-center rounded px-1.5 py-0.5", cStatus.bg)}>
                        <span
                            className={cn(
                                "text-[9px] font-bold uppercase tracking-wide",
                                cStatus.text,
                            )}
                        >
                            {cStatus.label}
                        </span>
                    </div>
                </div>
                <h3 className="line-clamp-1 text-[15px] font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
                    {contest.name}
                </h3>
                <div className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground truncate">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                        {start} {startTimeStr && `at ${startTimeStr}`}
                    </span>
                </div>
            </div>

            {/* Right: Stats & Actions */}
            <div className="mt-2 flex shrink-0 items-center justify-between gap-4 pt-3 md:mt-0 md:justify-end md:pt-0">
                <div className="flex gap-6">
                    <div className="flex flex-col items-start gap-0.5">
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span className="text-[11px] font-medium">Duration</span>
                        </div>
                        <span className="text-[14px] font-bold text-foreground pl-4">
                            {contest.duration ? `${Math.floor(contest.duration / 60)}h` : "—"}
                        </span>
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <FileQuestion className="h-3 w-3 shrink-0" />
                            <span className="text-[11px] font-medium">Questions</span>
                        </div>
                        <span className="text-[14px] font-bold text-foreground pl-4">—</span>
                    </div>
                    <div className="hidden md:flex flex-col items-start gap-0.5">
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-3 w-3 shrink-0" />
                            <span className="text-[11px] font-medium">Teams</span>
                        </div>
                        <span className="text-[14px] font-bold text-foreground pl-4">—</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 pl-3 border-l border-border/40 ml-1">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card shadow-sm text-[11px] font-bold text-muted-foreground">
                        {contestCode.charAt(0)}
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-primary-foreground shadow-sm transition-transform group-hover:scale-105 group-hover:shadow-md">
                        <span className="text-[12px] font-semibold">View</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

function ListSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="flex min-h-[72px] items-center gap-4 rounded-2xl border border-border p-3"
                >
                    <Skeleton className="hidden md:block h-[64px] w-[64px] rounded-xl" />
                    <div className="flex flex-1 min-w-0 flex-col gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-64" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                </div>
            ))}
        </div>
    );
}

interface ContestClientProps {
    initialParams: GetAllContestsApiV1ContestsGetParams;
}

export function ContestClient({ initialParams }: ContestClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [view, setView] = useState<ViewMode>("grid");

    const params: GetAllContestsApiV1ContestsGetParams = {
        ...initialParams,
        page: parseInt(searchParams.get("page") || String(initialParams.page || 1)),
        page_size: initialParams.page_size || 12,
        search: searchParams.get("search") || initialParams.search || undefined,
        contest_status:
            ((searchParams.get("contest_status") ||
                initialParams.contest_status) as ContestStatus) ?? undefined,
        run_status:
            ((searchParams.get("run_status") || initialParams.run_status) as ContestRunStatus) ??
            undefined,
    };

    const { data, isLoading, isError, error, refetch } = useGetAllContestsApiV1ContestsGet(params);

    const setPage = (newPage: number) => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("page", String(newPage));
        router.push(`${pathname}?${newParams.toString()}`);
    };

    const pagination = data?.pagination;
    const totalPages = pagination?.total_pages || 1;
    const currentPage = pagination?.page || 1;

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <ContestFilters />
                <ViewToggle view={view} onChange={setView} />
            </div>

            <AsyncStateHandler
                isLoading={isLoading}
                isError={isError}
                error={error}
                onRetry={refetch}
                loadingComponent={
                    view === "grid" ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <ContestSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <ListSkeleton />
                    )
                }
            >
                {view === "grid" ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {data?.data && data.data.length > 0 ? (
                            data.data.map((contest) => (
                                <ContestCard key={contest.id} contest={contest} />
                            ))
                        ) : (
                            <div className="col-span-full flex min-h-[200px] items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                                No contests found. Try adjusting your filters.
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {data?.data && data.data.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {data.data.map((contest) => (
                                    <ContestListRow key={contest.id} contest={contest} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                                No contests found. Try adjusting your filters.
                            </div>
                        )}
                    </>
                )}

                {pagination && (
                    <div className="mt-4">
                        <AppPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            hasPrevious={pagination.has_previous}
                            hasNext={pagination.has_next}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </AsyncStateHandler>
        </div>
    );
}

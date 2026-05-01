"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Users, Trophy } from "lucide-react";
import Link from "next/link";

import { useGetAllContestsApiV1ContestsGet } from "@/api/generated/contests/contests";
import type {
    ContestStatus,
    ContestRunStatus,
    GetAllContestsApiV1ContestsGetParams,
    ContestSummaryResponse,
} from "@/api/generated/model";
import { ContestFilters } from "./contest-filters";
import { ContestCard } from "./contest-card";
import { ContestSkeleton } from "./contest-skeleton";
import { AppPagination } from "@/components/shared/app-pagination";
import { ViewToggle, type ViewMode } from "@/components/shared/view-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AsyncStateHandler } from "../shared/async-state-handler";

const STATUS_CLASSES: Record<string, string> = {
    PUBLISHED: "bg-emerald-500/10 text-emerald-500 border-transparent",
    DRAFT: "bg-orange-500/10 text-orange-500 border-transparent",
    PAUSED: "bg-blue-500/10 text-blue-500 border-transparent",
    CANCELLED: "bg-red-500/10 text-red-500 border-transparent",
};

const RUN_STATUS_CLASSES: Record<string, string> = {
    LIVE: "bg-emerald-500/10 text-emerald-500 border-transparent",
    UPCOMING: "bg-blue-500/10 text-blue-500 border-transparent",
    ENDED: "bg-zinc-500/10 text-zinc-500 border-transparent",
};

function ContestTableRow({ contest }: { contest: ContestSummaryResponse }) {
    const start = new Date(contest.start_time).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
    const end = new Date(contest.end_time).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <TableRow className="group cursor-pointer hover:bg-muted/40 transition-colors">
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Trophy className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="font-medium text-foreground leading-tight group-hover:text-primary transition-colors">
                            {contest.name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {contest.description || "No description"}
                        </p>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex flex-col items-start gap-1">
                    <Badge
                        variant="outline"
                        className={
                            RUN_STATUS_CLASSES[contest.run_status] ?? RUN_STATUS_CLASSES.UPCOMING
                        }
                    >
                        {contest.run_status}
                    </Badge>
                    <Badge
                        variant="outline"
                        className={`text-[10px] h-5 ${STATUS_CLASSES[contest.status] ?? STATUS_CLASSES.DRAFT}`}
                    >
                        {contest.status}
                    </Badge>
                </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground capitalize">
                {contest.contest_mode.toLowerCase()}
            </TableCell>
            <TableCell>
                <div className="text-sm text-muted-foreground">
                    <p>{start}</p>
                    <p className="text-xs opacity-70">→ {end}</p>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span className="capitalize">
                        {contest.team_approval_mode.replace("_", " ").toLowerCase()}
                    </span>
                </div>
            </TableCell>
            <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/contest/${contest.id}`}>
                        View <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                </Button>
            </TableCell>
        </TableRow>
    );
}

function TableSkeleton() {
    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Contest</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Approval</TableHead>
                        <TableHead />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <Skeleton className="h-9 w-48" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-5 w-20" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-8 w-28" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-8 w-16" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
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
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <ContestSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <TableSkeleton />
                    )
                }
            >
                {view === "grid" ? (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                            <div className="rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Contest</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Mode</TableHead>
                                            <TableHead>Dates</TableHead>
                                            <TableHead>Approval</TableHead>
                                            <TableHead />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.data.map((contest) => (
                                            <ContestTableRow key={contest.id} contest={contest} />
                                        ))}
                                    </TableBody>
                                </Table>
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

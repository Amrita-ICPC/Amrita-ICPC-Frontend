"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Users } from "lucide-react";
import { useGetMyTeamsApiV1StudentsTeamsGet } from "@/api/generated/students/students";
import type { GetMyTeamsApiV1StudentsTeamsGetParams } from "@/api/generated/model";

import { StudentTeamFilters } from "./student-team-filters";
import { StudentTeamCard, StudentTeamRowItem } from "./student-team-card";
import { StudentTeamHero } from "./student-team-hero";
import { StudentTeamCardSkeleton, StudentTeamRowSkeleton } from "./student-team-skeleton";
import { AppPagination } from "@/components/shared/app-pagination";
import type { ViewMode } from "@/components/shared/view-toggle";
import { AsyncStateHandler } from "@/components/shared/async-state-handler";

interface StudentTeamClientProps {
    initialParams: GetMyTeamsApiV1StudentsTeamsGetParams;
}

export function StudentTeamClient({ initialParams }: StudentTeamClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Track grid vs list/table view locally (defaults to "grid")
    const [view, setView] = useState<ViewMode>("grid");

    const parsePositiveInt = (value: string | null, fallback?: number) => {
        if (!value) return fallback;
        const n = Number.parseInt(value, 10);
        return Number.isFinite(n) && n > 0 ? n : fallback;
    };

    // Gather URL search parameters to make the filter dynamic and URL-driven
    const page = parsePositiveInt(searchParams.get("page"), initialParams.page || 1) || 1;
    const pageSize = initialParams.page_size || 12;
    const search = searchParams.get("search") || undefined;
    const createdOnly = searchParams.get("created_only") === "true" ? true : undefined;
    const leaderOnly = searchParams.get("leader_only") === "true" ? true : undefined;

    const minSizeRaw = searchParams.get("min_size");
    const minSize = parsePositiveInt(minSizeRaw);

    const maxSizeRaw = searchParams.get("max_size");
    const maxSize = parsePositiveInt(maxSizeRaw);

    const isPublicRaw = searchParams.get("is_public");
    const isPublic = isPublicRaw === "true" ? true : isPublicRaw === "false" ? false : undefined;

    const params: GetMyTeamsApiV1StudentsTeamsGetParams = {
        page,
        page_size: pageSize,
        search,
        created_only: createdOnly,
        leader_only: leaderOnly,
        min_size: minSize,
        max_size: maxSize,
        is_public: isPublic,
    };

    // Query teams using the newly regenerated OpenAPI hook
    const { data, isLoading, isError, error, refetch } = useGetMyTeamsApiV1StudentsTeamsGet(params);

    const setPage = (newPage: number) => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("page", String(newPage));
        router.push(`${pathname}?${newParams.toString()}`);
    };

    const teams = data?.data?.teams || [];
    const totalItems = data?.pagination?.total || 0;
    const totalPages = data?.pagination?.total_pages || 1;
    const currentPage = page;

    const handleViewDetails = (teamId: string) => {
        console.log(`Navigating to team details for: ${teamId}`);
        // Can route to `/student/teams/${teamId}` in the future
    };

    return (
        <div className="flex flex-col gap-6">
            <StudentTeamHero pendingInvitations={data?.data?.pending_invitation || 0} />

            {/* Filtering Toolbar Row */}
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <StudentTeamFilters view={view} onViewChange={setView} />
            </div>

            {/* API Loading and Error State Wrapper */}
            <AsyncStateHandler
                isLoading={isLoading}
                isError={isError}
                error={error}
                onRetry={refetch}
                loadingComponent={
                    view === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <StudentTeamCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-border/40 overflow-hidden bg-card">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-border/40 bg-muted/20">
                                        <th className="py-3 px-4 text-left text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                                            Team
                                        </th>
                                        <th className="py-3 px-4 text-left text-xs font-extrabold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                                            Description
                                        </th>
                                        <th className="py-3 px-4 text-left text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                                            Code
                                        </th>
                                        <th className="py-3 px-4 text-left text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                                            Members
                                        </th>
                                        <th className="py-3 px-4 text-left text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                                            Join Requests
                                        </th>
                                        <th className="py-3 px-4 text-right text-xs font-extrabold uppercase tracking-wider text-muted-foreground"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <StudentTeamRowSkeleton key={i} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                }
            >
                {teams.length > 0 ? (
                    view === "grid" ? (
                        /* GRID LAYOUT */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teams.map((team) => (
                                <StudentTeamCard
                                    key={team.id}
                                    team={team}
                                    onViewDetails={handleViewDetails}
                                />
                            ))}
                        </div>
                    ) : (
                        /* TABLE LIST LAYOUT */
                        <div className="rounded-xl border border-border/40 overflow-hidden bg-card shadow-sm">
                            <div className="overflow-x-auto w-full">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-border/40 bg-muted/20">
                                            <th className="py-3.5 px-4 text-left text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                                                Team
                                            </th>
                                            <th className="py-3.5 px-4 text-left text-xs font-extrabold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                                                Description
                                            </th>
                                            <th className="py-3.5 px-4 text-left text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                                                Code
                                            </th>
                                            <th className="py-3.5 px-4 text-left text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                                                Members
                                            </th>
                                            <th className="py-3.5 px-4 text-left text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                                                Join Requests
                                            </th>
                                            <th className="py-3.5 px-4 text-right text-xs font-extrabold uppercase tracking-wider text-muted-foreground"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teams.map((team) => (
                                            <StudentTeamRowItem
                                                key={team.id}
                                                team={team}
                                                onViewDetails={handleViewDetails}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                ) : (
                    /* EMPTY STATE */
                    <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-card p-12 text-center">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-primary mb-2">
                            <Users className="h-6 w-6 text-indigo-500" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">No Teams Found</h3>
                        <p className="text-xs text-muted-foreground max-w-sm font-semibold leading-normal">
                            No teams match your selected filters. Try adjusting your search term or
                            clearing the filters.
                        </p>
                    </div>
                )}

                {/* PAGINATION CONTROL ROW */}
                {totalItems > pageSize && (
                    <div className="mt-6 flex justify-end">
                        <AppPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            hasPrevious={currentPage > 1}
                            hasNext={currentPage < totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </AsyncStateHandler>
        </div>
    );
}

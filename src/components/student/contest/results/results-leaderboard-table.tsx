"use client";

import { Loader2, Search, Trophy } from "lucide-react";
import * as React from "react";

import { useGetStudentContestLeaderboardApiV1StudentsContestsContestIdLeaderboardGet } from "@/api/generated/students/students";
import { AppPagination } from "@/components/shared/app-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface ResultsLeaderboardTableProps {
    contestId: string;
}

export function ResultsLeaderboardTable({ contestId }: ResultsLeaderboardTableProps) {
    const [searchTerm, setSearchTerm] = React.useState("");
    const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = React.useState(1);
    const debouncedSearch = useDebounce(searchTerm);

    const filterKey = `${debouncedSearch}:${sortOrder}`;
    const [previousFilterKey, setPreviousFilterKey] = React.useState(filterKey);
    if (filterKey !== previousFilterKey) {
        setPreviousFilterKey(filterKey);
        setCurrentPage(1);
    }

    const { data, isLoading } =
        useGetStudentContestLeaderboardApiV1StudentsContestsContestIdLeaderboardGet(contestId, {
            search: debouncedSearch || undefined,
            sort_order: sortOrder,
            page: currentPage,
            page_size: 10,
        });

    const standings = data?.data?.standings ?? [];
    const pagination = data?.pagination;

    return (
        <Card className="border-border/70 bg-card shadow-sm">
            <CardHeader className="border-b border-border/60">
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>Live standings across all participating teams.</CardDescription>
            </CardHeader>
            <div className="flex flex-col gap-3 border-b border-border/40 bg-muted/5 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-xs flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search teams..."
                        className="h-9 pl-8"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                </div>
                <Select
                    value={sortOrder}
                    onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
                >
                    <SelectTrigger className="h-9 w-[140px]">
                        <SelectValue placeholder="Sort Order" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="desc">Highest Score</SelectItem>
                        <SelectItem value="asc">Lowest Score</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <CardContent className="p-0">
                {isLoading && !data ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="animate-pulse text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Loading standings...
                        </span>
                    </div>
                ) : !standings.length ? (
                    <EmptyState
                        icon={Trophy}
                        title="No standings available yet"
                        description="Standings will appear once teams begin submitting solutions."
                        compact
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-border bg-muted/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        <th className="w-14 px-4 py-3 text-center">Rank</th>
                                        <th className="min-w-[200px] px-4 py-3">Team Name</th>
                                        <th className="w-20 px-4 py-3 text-center">Score</th>
                                        <th className="w-28 px-4 py-3 text-center">Penalty (m)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    {standings.map((row) => (
                                        <tr
                                            key={row.team_id}
                                            className="align-middle transition-colors hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3">
                                                <div
                                                    className={cn(
                                                        "mx-auto flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold",
                                                        row.rank === 1 &&
                                                            "border-amber-400 bg-amber-500/10 text-amber-500 shadow-sm dark:text-amber-450",
                                                        row.rank === 2 &&
                                                            "border-slate-350 bg-slate-350/10 text-slate-500 shadow-sm dark:text-slate-400",
                                                        row.rank === 3 &&
                                                            "border-orange-400 bg-orange-500/10 text-orange-500 shadow-sm dark:text-orange-450",
                                                        row.rank > 3 &&
                                                            "border-border bg-muted/40 text-muted-foreground",
                                                    )}
                                                >
                                                    {row.rank}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-foreground">
                                                {row.team_name}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="inline-flex h-7 items-center justify-center rounded-full bg-primary/10 px-2.5 text-xs font-bold text-primary">
                                                    {row.total_score}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center font-mono text-xs text-muted-foreground">
                                                {Math.floor((row.total_penalty || 0) / 60)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {pagination && pagination.total_pages > 1 && (
                            <div className="flex justify-end border-t border-border/40 p-4">
                                <AppPagination
                                    currentPage={currentPage}
                                    totalPages={pagination.total_pages}
                                    hasPrevious={pagination.has_previous ?? false}
                                    hasNext={pagination.has_next ?? false}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

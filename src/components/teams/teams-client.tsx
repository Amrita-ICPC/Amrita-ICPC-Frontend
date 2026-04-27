"use client";

import { useState } from "react";
import { Check, Users, Trophy, Search } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useGetAllContestsApiV1ContestsGet } from "@/api/generated/contests/contests";
import {
    useGetContestTeamsApiV1ContestsContestIdTeamsGet,
    useApproveTeamApiV1ContestsContestIdTeamsTeamIdApprovePatch,
    getGetContestTeamsApiV1ContestsContestIdTeamsGetQueryKey,
} from "@/api/generated/teams/teams";
import type { ContestSummaryResponse, ContestTeamResponse } from "@/api/generated/model";
import { TeamApprovalStatus } from "@/api/generated/model/teamApprovalStatus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ViewToggle, type ViewMode } from "@/components/shared/view-toggle";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

function ApprovalBadge({ status }: { status: string }) {
    if (status === TeamApprovalStatus.APPROVED) {
        return (
            <Badge className="border-transparent bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/20 dark:bg-emerald-500/22 dark:text-emerald-300">
                Approved
            </Badge>
        );
    }
    return (
        <Badge className="border-transparent bg-amber-500/12 text-amber-700 hover:bg-amber-500/20 dark:bg-amber-500/22 dark:text-amber-300">
            Waiting
        </Badge>
    );
}

function StatusBadge({ status }: { status: string }) {
    return (
        <Badge variant="secondary" className="capitalize text-xs">
            {status.toLowerCase()}
        </Badge>
    );
}

function ApproveButton({ team, contestId }: { team: ContestTeamResponse; contestId: string }) {
    const queryClient = useQueryClient();
    const { mutate: approve, isPending } =
        useApproveTeamApiV1ContestsContestIdTeamsTeamIdApprovePatch({
            mutation: {
                onSuccess: () => {
                    toast.success(`Team "${team.name}" approved`);
                    queryClient.invalidateQueries({
                        queryKey:
                            getGetContestTeamsApiV1ContestsContestIdTeamsGetQueryKey(contestId),
                    });
                },
                onError: (err: unknown) => {
                    const msg = (err as { response?: { data?: { message?: string } } })?.response
                        ?.data?.message;
                    toast.error(msg || "Failed to approve team");
                },
            },
        });

    if (team.approval_status !== TeamApprovalStatus.WAITING) return null;

    return (
        <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => approve({ contestId, teamId: team.id })}
        >
            <Check className="mr-1.5 h-3.5 w-3.5" />
            Approve
        </Button>
    );
}

function TeamCard({ team, contestId }: { team: ContestTeamResponse; contestId: string }) {
    const created = new Date(team.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const isApproved = team.approval_status === TeamApprovalStatus.APPROVED;

    return (
        <div className="group relative flex h-50 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_-18px_rgba(20,45,103,0.45)] transition-all duration-200 hover:-translate-y-1 hover:border-[#c7d3ef] hover:bg-[#f8faff] hover:shadow-[0_18px_30px_-18px_rgba(20,45,103,0.55)] dark:border-white/12 dark:bg-slate-900 dark:hover:border-white/20 dark:hover:bg-slate-900">
            {/* Top accent line */}
            <div
                className={`absolute inset-x-0 top-0 h-0.5 rounded-t-xl ${isApproved ? "bg-linear-to-r from-emerald-500 to-teal-500" : "bg-linear-to-r from-[#d18a22] to-[#d2701d]"} opacity-45 transition-opacity duration-200 group-hover:opacity-100`}
            />

            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e7edfb] text-[#27438a] transition-colors group-hover:bg-[#dce6fa] dark:bg-blue-500/20 dark:text-blue-300 dark:group-hover:bg-blue-500/30">
                    <Users className="h-5 w-5" />
                </div>
                <ApprovalBadge status={team.approval_status} />
            </div>

            {/* Name + description */}
            <div className="mt-3 flex-1 min-h-0">
                <p className="line-clamp-1 font-bold text-slate-900 transition-colors group-hover:text-[#1f3678] dark:text-slate-100 dark:group-hover:text-blue-300">
                    {team.name}
                </p>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300/90">
                    {team.description || "No description provided."}
                </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <StatusBadge status={team.status} />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        · {created}
                    </span>
                </div>
                <ApproveButton team={team} contestId={contestId} />
            </div>
        </div>
    );
}

function TeamsContent({
    contestId,
    search,
    view,
}: {
    contestId: string;
    search: string;
    view: ViewMode;
}) {
    const { data, isLoading, isError } =
        useGetContestTeamsApiV1ContestsContestIdTeamsGet(contestId);
    const allTeams = data?.data ?? [];
    const teams = search
        ? allTeams.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
        : allTeams;

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-48 rounded-lg" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-50 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-sm text-destructive">
                Failed to load teams.
            </div>
        );
    }

    if (teams.length === 0) {
        return (
            <div className="flex min-h-50 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground">
                <Users className="h-8 w-8 opacity-40" />
                <p className="text-sm">
                    {search
                        ? "No teams match your search."
                        : "No teams registered for this contest."}
                </p>
            </div>
        );
    }

    if (view === "table") {
        return (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_10px_24px_-20px_rgba(20,45,103,0.45)] dark:border-white/12 dark:bg-slate-900">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-[#162d68] hover:bg-[#162d68] dark:bg-[#0f214d] dark:hover:bg-[#0f214d]">
                            <TableHead className="text-[12px] font-semibold text-white">
                                Name
                            </TableHead>
                            <TableHead className="text-[12px] font-semibold text-white">
                                Description
                            </TableHead>
                            <TableHead className="text-[12px] font-semibold text-white">
                                Status
                            </TableHead>
                            <TableHead className="text-[12px] font-semibold text-white">
                                Approval
                            </TableHead>
                            <TableHead className="text-[12px] font-semibold text-white">
                                Created
                            </TableHead>
                            <TableHead className="text-right text-[12px] font-semibold text-white">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teams.map((team) => (
                            <TableRow key={team.id}>
                                <TableCell className="font-medium">{team.name}</TableCell>
                                <TableCell className="max-w-50 truncate text-sm text-muted-foreground">
                                    {team.description || "—"}
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={team.status} />
                                </TableCell>
                                <TableCell>
                                    <ApprovalBadge status={team.approval_status} />
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                    {new Date(team.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <ApproveButton team={team} contestId={contestId} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
                <TeamCard key={team.id} team={team} contestId={contestId} />
            ))}
        </div>
    );
}

export function TeamsClient() {
    const [selectedContest, setSelectedContest] = useState<ContestSummaryResponse | null>(null);
    const [search, setSearch] = useState("");
    const [view, setView] = useState<ViewMode>("grid");

    const { data: contestsData, isLoading: loadingContests } = useGetAllContestsApiV1ContestsGet({
        page: 1,
        page_size: 50,
    });

    const contests = contestsData?.data ?? [];

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-3">
                    <Select
                        value={selectedContest?.id ?? ""}
                        onValueChange={(id) => {
                            const c = contests.find((x) => x.id === id) ?? null;
                            setSelectedContest(c);
                        }}
                    >
                        <SelectTrigger className="w-65">
                            <SelectValue
                                placeholder={
                                    loadingContests ? "Loading contests…" : "Select a contest"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {contests.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                    <div className="flex items-center gap-2">
                                        <Trophy className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <span className="truncate">{c.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {selectedContest && (
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search teams..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {selectedContest && <ViewToggle view={view} onChange={setView} />}
            </div>

            {selectedContest ? (
                <TeamsContent contestId={selectedContest.id} search={search} view={view} />
            ) : (
                <div className="flex min-h-70 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-muted-foreground">
                    <Users className="h-10 w-10 opacity-30" />
                    <p className="text-sm">Select a contest to view its teams.</p>
                </div>
            )}
        </div>
    );
}

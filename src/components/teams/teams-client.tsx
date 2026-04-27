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
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-transparent hover:bg-emerald-500/20">Approved</Badge>;
    }
    return <Badge className="bg-amber-500/10 text-amber-500 border-transparent hover:bg-amber-500/20">Waiting</Badge>;
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
    const { mutate: approve, isPending } = useApproveTeamApiV1ContestsContestIdTeamsTeamIdApprovePatch({
        mutation: {
            onSuccess: () => {
                toast.success(`Team "${team.name}" approved`);
                queryClient.invalidateQueries({
                    queryKey: getGetContestTeamsApiV1ContestsContestIdTeamsGetQueryKey(contestId),
                });
            },
            onError: (err: unknown) => {
                const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
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
        month: "short", day: "numeric", year: "numeric",
    });

    const isApproved = team.approval_status === TeamApprovalStatus.APPROVED;

    return (
        <div className="group relative flex h-[200px] flex-col rounded-xl bg-[#0c1a2e] p-5 shadow-lg shadow-black/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#060f1e]/60 hover:bg-[#0f2040]">
            {/* Top accent line */}
            <div className={`absolute inset-x-0 top-0 h-[2px] rounded-t-xl ${isApproved ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-amber-400 to-orange-500"} opacity-70 group-hover:opacity-100 transition-opacity duration-200`} />

            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                    <Users className="h-5 w-5" />
                </div>
                <ApprovalBadge status={team.approval_status} />
            </div>

            {/* Name + description */}
            <div className="mt-3 flex-1 min-h-0">
                <p className="line-clamp-1 font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                    {team.name}
                </p>
                <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                    {team.description || "No description provided."}
                </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <StatusBadge status={team.status} />
                    <span className="text-[11px] text-slate-600">· {created}</span>
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
    const { data, isLoading, isError } = useGetContestTeamsApiV1ContestsContestIdTeamsGet(contestId);
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
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm p-8">
                Failed to load teams.
            </div>
        );
    }

    if (teams.length === 0) {
        return (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground">
                <Users className="h-8 w-8 opacity-40" />
                <p className="text-sm">{search ? "No teams match your search." : "No teams registered for this contest."}</p>
            </div>
        );
    }

    if (view === "table") {
        return (
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Approval</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teams.map((team) => (
                            <TableRow key={team.id}>
                                <TableCell className="font-medium">{team.name}</TableCell>
                                <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                                    {team.description || "—"}
                                </TableCell>
                                <TableCell><StatusBadge status={team.status} /></TableCell>
                                <TableCell><ApprovalBadge status={team.approval_status} /></TableCell>
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
                        <SelectTrigger className="w-[260px]">
                            <SelectValue placeholder={loadingContests ? "Loading contests…" : "Select a contest"} />
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
                <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-muted-foreground">
                    <Users className="h-10 w-10 opacity-30" />
                    <p className="text-sm">Select a contest to view its teams.</p>
                </div>
            )}
        </div>
    );
}

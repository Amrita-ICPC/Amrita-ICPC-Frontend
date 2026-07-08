"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Ban, CheckCircle2, Clock, Eye, MoreVertical, Search, Users, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import type { ContestTeamResponse } from "@/api/generated/model/contestTeamResponse";
import { TeamApprovalStatus } from "@/api/generated/model/teamApprovalStatus";
import type { TeamMemberPreview } from "@/api/generated/model/teamMemberPreview";
import type { TeamMemberResponse } from "@/api/generated/model/teamMemberResponse";
import { TeamStatus } from "@/api/generated/model/teamStatus";
import {
    getGetContestTeamsApiV1ContestsContestIdTeamsGetQueryKey,
    useApproveTeamApiV1ContestsContestIdTeamsContestTeamIdApprovePatch,
    useGetContestTeamsApiV1ContestsContestIdTeamsGet,
    useGetTeamMembersApiV1ContestsContestIdTeamsContestTeamIdMembersGet,
    useRejectTeamApiV1ContestsContestIdTeamsContestTeamIdRejectPatch,
} from "@/api/generated/teams/teams";
import { AppPagination } from "@/components/shared/app-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface ContestTeamsClientProps {
    contestId: string;
    embedded?: boolean;
}

function ApprovalBadge({ status }: { status: string }) {
    if (status === TeamApprovalStatus.APPROVED) {
        return (
            <Badge className="border-transparent bg-emerald-500/12 text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full">
                Approved
            </Badge>
        );
    }
    if (status === TeamApprovalStatus.REJECTED) {
        return (
            <Badge className="border-transparent bg-red-500/12 text-red-600 hover:bg-red-500/20 dark:bg-red-500/15 dark:text-red-400 font-semibold px-2.5 py-0.5 rounded-full">
                Rejected
            </Badge>
        );
    }
    return (
        <Badge className="border-transparent bg-amber-500/12 text-amber-600 hover:bg-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 font-semibold px-2.5 py-0.5 rounded-full">
            Waiting
        </Badge>
    );
}

function TeamStatusBadge({ status }: { status: string }) {
    if (status === TeamStatus.CONFIRMED) {
        return (
            <Badge
                variant="outline"
                className="border-transparent bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold px-2.5 py-0.5 rounded-full"
            >
                Confirmed
            </Badge>
        );
    }
    if (status === TeamStatus.DISQUALIFIED) {
        return (
            <Badge
                variant="outline"
                className="border-transparent bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 font-semibold px-2.5 py-0.5 rounded-full"
            >
                Disqualified
            </Badge>
        );
    }
    return (
        <Badge
            variant="outline"
            className="border-transparent bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold px-2.5 py-0.5 rounded-full"
        >
            Draft
        </Badge>
    );
}

function initialsColor(initials: string) {
    const palette = [
        "bg-blue-500/15 text-blue-600 dark:text-blue-300 ring-blue-500/20",
        "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 ring-emerald-500/20",
        "bg-violet-500/15 text-violet-600 dark:text-violet-300 ring-violet-500/20",
        "bg-amber-500/15 text-amber-600 dark:text-amber-300 ring-amber-500/20",
        "bg-rose-500/15 text-rose-600 dark:text-rose-300 ring-rose-500/20",
        "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 ring-cyan-500/20",
    ];
    const n = initials.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return palette[n % palette.length];
}

function MembersPreview({
    members,
    extraCount,
}: {
    members?: TeamMemberPreview[];
    extraCount?: number;
}) {
    const preview = members ?? [];
    return (
        <div className="flex items-center">
            <div className="flex -space-x-2">
                {preview.slice(0, 3).map((m) => {
                    const c = initialsColor(m.initials);
                    return (
                        <Avatar
                            key={m.id}
                            className={`h-9 w-9 border-2 border-background ring-1 ring-border/20 ${c}`}
                        >
                            {m.avatar ? <AvatarImage src={m.avatar} alt={m.name} /> : null}
                            <AvatarFallback className="bg-transparent text-[11px] font-bold">
                                {m.initials}
                            </AvatarFallback>
                        </Avatar>
                    );
                })}
            </div>
            {(extraCount ?? 0) > 0 && (
                <div className="ml-2 text-[12px] font-medium text-muted-foreground">
                    +{extraCount}
                </div>
            )}
        </div>
    );
}

function TeamMembersDropdown({
    contestId,
    team,
}: {
    contestId: string;
    team: ContestTeamResponse;
}) {
    const [open, setOpen] = useState(false);

    const { data, isLoading, isError } =
        useGetTeamMembersApiV1ContestsContestIdTeamsContestTeamIdMembersGet(
            contestId,
            team.id,
            { page: 1, page_size: 50 },
            { query: { enabled: open } },
        );

    // axiosWithAuth returns APIResponseListTeamMemberResponse directly; the members list is in `.data`
    // Explicitly type members so `m` isn't inferred as `any`
    const members: TeamMemberResponse[] = data?.data ?? [];

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 px-2">
                    <MembersPreview
                        members={team.members_preview}
                        extraCount={team.extra_members_count}
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
                <div className="px-2 py-1.5">
                    <p className="text-sm font-semibold">{team.name}</p>
                    <p className="text-xs text-muted-foreground">Team members</p>
                </div>
                <DropdownMenuSeparator />
                {isLoading ? (
                    <div className="px-3 py-3 text-xs text-muted-foreground">Loading members…</div>
                ) : isError ? (
                    <div className="px-3 py-3 text-xs text-destructive">
                        Failed to load members.
                    </div>
                ) : members.length === 0 ? (
                    <div className="px-3 py-3 text-xs text-muted-foreground">No members found.</div>
                ) : (
                    <div className="max-h-72 overflow-auto">
                        {members.map((m) => (
                            <div
                                key={m.id}
                                className="flex items-center justify-between gap-3 px-3 py-2"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{m.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {m.email}
                                    </p>
                                </div>
                                {m.is_leader ? (
                                    <Badge variant="outline" className="text-[10px]">
                                        Leader
                                    </Badge>
                                ) : null}
                            </div>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function TeamActionsDropdown({
    onApprove,
    onReject,
    busy,
}: {
    onApprove: () => void;
    onReject: () => void;
    busy?: boolean;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full hover:bg-muted/40 transition-colors"
                    disabled={busy}
                >
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer" onClick={onApprove}>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                    Approve team
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={onReject}>
                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                    Reject team
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function ContestTeamsClient({ contestId, embedded = false }: ContestTeamsClientProps) {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [teamStatus, setTeamStatus] = useState<TeamStatus | "ALL">("ALL");
    const [approvalStatus, setApprovalStatus] = useState<TeamApprovalStatus | "ALL">("ALL");
    const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(new Set());
    const [bulkBusy, setBulkBusy] = useState<null | "approve" | "reject">(null);

    const { data, isLoading, isError } = useGetContestTeamsApiV1ContestsContestIdTeamsGet(
        contestId,
        {
            page,
            page_size: pageSize,
            search: search || undefined,
            team_status: teamStatus === "ALL" ? undefined : teamStatus,
            approval_status: approvalStatus === "ALL" ? undefined : approvalStatus,
        },
    );

    const teams = useMemo(() => {
        const priority: Record<string, number> = {
            [TeamApprovalStatus.WAITING]: 0,
            [TeamApprovalStatus.APPROVED]: 1,
            [TeamApprovalStatus.REJECTED]: 2,
        };
        return [...(data?.data?.teams ?? [])].sort(
            (a, b) => (priority[a.approval_status] ?? 3) - (priority[b.approval_status] ?? 3),
        );
    }, [data?.data?.teams]);
    const pagination = data?.pagination;
    const teamStats = data?.data;

    const stats = {
        total: teamStats?.total ?? 0,
        approved: teamStats?.approved_count ?? 0,
        pending: teamStats?.waiting_count ?? 0,
        rejected: teamStats?.rejected_count ?? 0,
        disqualified: teamStats?.disqualified_count ?? 0,
    };

    const approveMutation = useApproveTeamApiV1ContestsContestIdTeamsContestTeamIdApprovePatch();
    const rejectMutation = useRejectTeamApiV1ContestsContestIdTeamsContestTeamIdRejectPatch();

    const baseTeamsQueryKey = getGetContestTeamsApiV1ContestsContestIdTeamsGetQueryKey(contestId);

    async function refreshTeams() {
        await queryClient.invalidateQueries({ queryKey: baseTeamsQueryKey, exact: false });
    }

    async function approveTeam(team: ContestTeamResponse) {
        try {
            await approveMutation.mutateAsync({ contestId, contestTeamId: team.id });
            toast.success(`Approved "${team.name}"`);
            await refreshTeams();
        } catch {
            toast.error(`Failed to approve "${team.name}"`);
        }
    }

    async function rejectTeam(team: ContestTeamResponse) {
        try {
            await rejectMutation.mutateAsync({ contestId, contestTeamId: team.id });
            toast.success(`Rejected "${team.name}"`);
            await refreshTeams();
        } catch {
            toast.error(`Failed to reject "${team.name}"`);
        }
    }

    const allOnPageSelected = useMemo(
        () => teams.length > 0 && teams.every((t: any) => selectedTeamIds.has(t.id)),
        [teams, selectedTeamIds],
    );
    const someOnPageSelected = useMemo(
        () => teams.some((t: any) => selectedTeamIds.has(t.id)) && !allOnPageSelected,
        [teams, selectedTeamIds, allOnPageSelected],
    );

    function toggleTeam(id: string, checked: boolean) {
        setSelectedTeamIds((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    }

    function toggleAllOnPage(checked: boolean) {
        setSelectedTeamIds((prev) => {
            const next = new Set(prev);
            for (const t of teams) {
                if (checked) next.add(t.id);
                else next.delete(t.id);
            }
            return next;
        });
    }

    async function runBulk(action: "approve" | "reject") {
        const ids = Array.from(selectedTeamIds);
        if (ids.length === 0) return;
        setBulkBusy(action);
        try {
            await Promise.allSettled(
                ids.map((id) => {
                    if (action === "approve")
                        return approveMutation.mutateAsync({ contestId, contestTeamId: id });
                    return rejectMutation.mutateAsync({ contestId, contestTeamId: id });
                }),
            );
            toast.success(`${action[0].toUpperCase() + action.slice(1)}d ${ids.length} team(s)`);
            setSelectedTeamIds(new Set());
            await refreshTeams();
        } catch {
            toast.error("Bulk action failed");
        } finally {
            setBulkBusy(null);
        }
    }

    if (embedded) {
        const requestFilters = [
            { value: "ALL", label: "All", count: stats.total, color: "text-primary" },
            {
                value: TeamApprovalStatus.WAITING,
                label: "Waiting",
                count: stats.pending,
                color: "text-sky-600 dark:text-sky-400",
            },
            {
                value: TeamApprovalStatus.APPROVED,
                label: "Accepted",
                count: stats.approved,
                color: "text-emerald-600 dark:text-emerald-400",
            },
            {
                value: TeamApprovalStatus.REJECTED,
                label: "Rejected",
                count: stats.rejected,
                color: "text-rose-600 dark:text-rose-400",
            },
        ];

        return (
            <div className="p-4 md:p-6">
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-border/60 p-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                            {requestFilters.map((filter) => (
                                <button
                                    key={filter.value}
                                    type="button"
                                    onClick={() => {
                                        setApprovalStatus(
                                            filter.value as TeamApprovalStatus | "ALL",
                                        );
                                        setPage(1);
                                    }}
                                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${filter.color} ${
                                        approvalStatus === filter.value
                                            ? "border-current bg-current/10 ring-1 ring-current/15"
                                            : "border-border bg-background hover:border-current/40"
                                    }`}
                                >
                                    {filter.label}
                                    <span className="ml-2 opacity-70">{filter.count}</span>
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full lg:w-80">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search teams..."
                                className="h-11 bg-background pl-9"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-[1fr_160px_220px] gap-4 border-b border-border/60 bg-muted/20 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <span>Team</span>
                        <span>Status</span>
                        <span className="text-right">Action</span>
                    </div>

                    <div className="divide-y divide-border/50">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-[1fr_160px_220px] items-center gap-4 px-6 py-5"
                                >
                                    <Skeleton className="h-12 w-56" />
                                    <Skeleton className="h-7 w-24 rounded-full" />
                                    <Skeleton className="ml-auto h-9 w-40" />
                                </div>
                            ))
                        ) : teams.length === 0 ? (
                            <div className="flex min-h-48 flex-col items-center justify-center text-muted-foreground">
                                <Users className="mb-3 size-8 opacity-30" />
                                <p className="text-sm">No team requests found.</p>
                            </div>
                        ) : (
                            teams.map((team) => {
                                const initials = team.name?.slice(0, 2).toUpperCase() || "T";
                                const memberNames = (team.members_preview ?? [])
                                    .map((member) => member.name)
                                    .join(", ");
                                const isWaiting =
                                    team.approval_status === TeamApprovalStatus.WAITING;
                                return (
                                    <div
                                        key={team.id}
                                        className="grid grid-cols-1 items-center gap-4 px-6 py-5 transition-colors hover:bg-muted/20 md:grid-cols-[1fr_160px_220px]"
                                    >
                                        <div className="flex min-w-0 items-center gap-4">
                                            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
                                                {initials}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-foreground">
                                                    {team.name}
                                                </p>
                                                <p className="mt-1 truncate text-sm text-muted-foreground">
                                                    {team.members_preview?.length ?? 0} member
                                                    {(team.members_preview?.length ?? 0) === 1
                                                        ? ""
                                                        : "s"}
                                                    {memberNames ? ` · ${memberNames}` : ""}
                                                </p>
                                            </div>
                                        </div>
                                        <ApprovalBadge status={team.approval_status} />
                                        <div className="flex justify-start gap-2 md:justify-end">
                                            {isWaiting && (
                                                <>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="border-emerald-500/25 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                                                        disabled={
                                                            approveMutation.isPending ||
                                                            rejectMutation.isPending
                                                        }
                                                        onClick={() => approveTeam(team)}
                                                    >
                                                        <CheckCircle2 className="size-4" />
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="border-rose-500/25 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                                                        disabled={
                                                            approveMutation.isPending ||
                                                            rejectMutation.isPending
                                                        }
                                                        onClick={() => rejectTeam(team)}
                                                    >
                                                        <XCircle className="size-4" />
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {pagination && pagination.total_pages > 1 && (
                        <div className="flex justify-end border-t border-border/60 p-4">
                            <AppPagination
                                currentPage={page}
                                totalPages={pagination.total_pages}
                                hasNext={pagination.has_next}
                                hasPrevious={pagination.has_previous}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            className={
                embedded
                    ? "flex flex-col bg-transparent"
                    : "flex min-h-screen flex-col bg-background"
            }
        >
            {/* Hero */}
            {!embedded && (
                <div className="relative overflow-hidden rounded-[12px] border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm m-4 md:m-6 mb-2">
                    <div className="relative space-y-6">
                        <div>
                            <h1 className="text-[22px] font-bold tracking-tight text-foreground">
                                Contest teams
                            </h1>
                            <p className="text-[13px] text-muted-foreground mt-1">
                                Review registrations and track approval status for this contest.
                            </p>
                        </div>

                        {/* Counts */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-sm">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold leading-none text-foreground">
                                        {stats.total}
                                    </span>
                                    <span className="text-[12px] text-muted-foreground mt-1">
                                        Total
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-sm">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold leading-none text-foreground">
                                        {stats.approved}
                                    </span>
                                    <span className="text-[12px] text-muted-foreground mt-1">
                                        Approved
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-sm">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold leading-none text-foreground">
                                        {stats.pending}
                                    </span>
                                    <span className="text-[12px] text-muted-foreground mt-1">
                                        Waiting
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-sm">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                                    <XCircle className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold leading-none text-foreground">
                                        {stats.rejected}
                                    </span>
                                    <span className="text-[12px] text-muted-foreground mt-1">
                                        Rejected
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-sm">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                                    <Ban className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold leading-none text-foreground">
                                        {stats.disqualified}
                                    </span>
                                    <span className="text-[12px] text-muted-foreground mt-1">
                                        Disqualified
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter & Actions Bar */}
            <div className="sticky top-0 z-20 flex min-h-[72px] flex-col justify-center border-b border-border/60 bg-background/80 px-6 py-3 backdrop-blur-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-[280px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search team or member..."
                                className="h-10 w-full pl-9 bg-card shadow-sm border-border/60"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                    setSelectedTeamIds(new Set());
                                }}
                            />
                        </div>
                        <Select
                            value={approvalStatus}
                            onValueChange={(v) => {
                                setApprovalStatus(v as TeamApprovalStatus | "ALL");
                                setPage(1);
                                setSelectedTeamIds(new Set());
                            }}
                        >
                            <SelectTrigger className="h-10 w-full sm:w-[160px] bg-card shadow-sm border-border/60">
                                <SelectValue placeholder="Approval Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Approvals</SelectItem>
                                <SelectItem value={TeamApprovalStatus.APPROVED}>
                                    Approved
                                </SelectItem>
                                <SelectItem value={TeamApprovalStatus.WAITING}>Waiting</SelectItem>
                                <SelectItem value={TeamApprovalStatus.REJECTED}>
                                    Rejected
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={teamStatus}
                            onValueChange={(v) => {
                                setTeamStatus(v as TeamStatus | "ALL");
                                setPage(1);
                                setSelectedTeamIds(new Set());
                            }}
                        >
                            <SelectTrigger className="h-10 w-full sm:w-[160px] bg-card shadow-sm border-border/60">
                                <SelectValue placeholder="Team Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value={TeamStatus.DRAFT}>Draft</SelectItem>
                                <SelectItem value={TeamStatus.CONFIRMED}>Confirmed</SelectItem>
                                <SelectItem value={TeamStatus.DISQUALIFIED}>
                                    Disqualified
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Bulk actions */}
                {selectedTeamIds.size > 0 && (
                    <div className="flex flex-col sm:flex-row sm:h-[52px] items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 sm:py-0 mt-3 animate-in fade-in slide-in-from-top-2">
                        <p className="text-[14px] text-muted-foreground">
                            <span className="font-semibold text-foreground">
                                {selectedTeamIds.size}
                            </span>{" "}
                            teams selected
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={bulkBusy !== null}
                                onClick={() => runBulk("approve")}
                                className="h-8 shadow-sm"
                            >
                                <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-500" />{" "}
                                Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={bulkBusy !== null}
                                onClick={() => runBulk("reject")}
                                className="h-8 shadow-sm"
                            >
                                <XCircle className="mr-2 h-3.5 w-3.5 text-red-500" /> Reject
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                disabled={bulkBusy !== null}
                                onClick={() => setSelectedTeamIds(new Set())}
                                className="h-8"
                            >
                                Clear
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-4 md:p-6">
                <div className="overflow-hidden rounded-[12px] border border-border/60 bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <Table className="min-w-[1000px]">
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/60">
                                    <TableHead className="w-[48px] px-4">
                                        <Checkbox
                                            checked={
                                                allOnPageSelected
                                                    ? true
                                                    : someOnPageSelected
                                                      ? "indeterminate"
                                                      : false
                                            }
                                            onCheckedChange={(v) => toggleAllOnPage(Boolean(v))}
                                            aria-label="Select all teams on this page"
                                        />
                                    </TableHead>
                                    <TableHead className="w-[300px] text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
                                        Team
                                    </TableHead>
                                    <TableHead className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
                                        Members
                                    </TableHead>
                                    <TableHead className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
                                        Approval
                                    </TableHead>
                                    <TableHead className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
                                        Contest Status
                                    </TableHead>
                                    <TableHead className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
                                        Parent Team
                                    </TableHead>
                                    <TableHead className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
                                        Enrolled At
                                    </TableHead>
                                    <TableHead className="text-right w-[120px] text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 8 }).map((_, i) => (
                                        <TableRow key={i} className="h-[72px]">
                                            <TableCell className="px-4">
                                                <Skeleton className="h-4 w-4 rounded" />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="h-9 w-9 rounded-full" />
                                                    <div className="space-y-1.5">
                                                        <Skeleton className="h-4 w-32" />
                                                        <Skeleton className="h-3 w-24" />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-9 w-24 rounded-full" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-6 w-20 rounded-full" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-6 w-20 rounded-full" />
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1.5">
                                                    <Skeleton className="h-3 w-28" />
                                                    <Skeleton className="h-2 w-16" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-28 rounded-full" />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Skeleton className="h-10 w-20 ml-auto rounded-full" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-64">
                                            <div className="flex items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
                                                Failed to load teams.
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : teams.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-64">
                                            <div className="py-4">
                                                <EmptyState
                                                    icon={Users}
                                                    title={
                                                        search
                                                            ? "No teams match your search"
                                                            : "No teams registered"
                                                    }
                                                    description={
                                                        search
                                                            ? "Clear the search or try a different team name."
                                                            : "Registered teams will appear here once students join the contest."
                                                    }
                                                    compact
                                                />
                                                {search && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="mx-auto mt-4 flex"
                                                        onClick={() => setSearch("")}
                                                    >
                                                        Clear search
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    teams.map((team: any) => {
                                        const initials =
                                            team.name?.substring(0, 2).toUpperCase() || "T";
                                        const c = initialsColor(initials);
                                        return (
                                            <TableRow
                                                key={team.id}
                                                className="h-[72px] hover:bg-muted/30 hover:-translate-y-[1px] transition-all border-border/40 group"
                                            >
                                                <TableCell className="px-4">
                                                    <Checkbox
                                                        checked={selectedTeamIds.has(team.id)}
                                                        onCheckedChange={(v) =>
                                                            toggleTeam(team.id, Boolean(v))
                                                        }
                                                        aria-label={`Select team ${team.name}`}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className={`h-10 w-10 border ${c}`}>
                                                            <AvatarFallback className="bg-transparent text-[13px] font-bold">
                                                                {initials}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="text-[14px] font-semibold text-foreground group-hover:text-primary transition-colors">
                                                                {team.name}
                                                            </span>
                                                            <span className="text-[12px] text-muted-foreground opacity-75 line-clamp-1 max-w-[220px]">
                                                                {team.description || "Contest Team"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <TeamMembersDropdown
                                                        contestId={contestId}
                                                        team={team}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <ApprovalBadge status={team.approval_status} />
                                                </TableCell>
                                                <TableCell>
                                                    <TeamStatusBadge status={team.status} />
                                                </TableCell>
                                                <TableCell>
                                                    {team.parent_team ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-[12px] font-medium text-foreground opacity-80 truncate max-w-[160px]">
                                                                {team.parent_team.name}
                                                            </span>
                                                            <span className="text-[11px] text-muted-foreground opacity-70">
                                                                Global Team
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[12px] text-muted-foreground opacity-50">
                                                            —
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-[13px] text-muted-foreground font-medium">
                                                        {team.enrolled_at
                                                            ? new Date(
                                                                  team.enrolled_at,
                                                              ).toLocaleString("en-GB", {
                                                                  day: "numeric",
                                                                  month: "short",
                                                                  year: "numeric",
                                                                  hour: "2-digit",
                                                                  minute: "2-digit",
                                                              })
                                                            : "—"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-10 w-10 rounded-full hover:bg-muted/40 transition-colors"
                                                        >
                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                        <TeamActionsDropdown
                                                            busy={
                                                                approveMutation.isPending ||
                                                                rejectMutation.isPending
                                                            }
                                                            onApprove={() => approveTeam(team)}
                                                            onReject={() => rejectTeam(team)}
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Pagination */}
                {pagination && (
                    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
                        <p className="text-[13px] text-muted-foreground">
                            Showing{" "}
                            <span className="font-medium text-foreground">
                                {(pagination.page - 1) * pagination.page_size +
                                    (teams.length ? 1 : 0)}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium text-foreground">
                                {(pagination.page - 1) * pagination.page_size + teams.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium text-foreground">{pagination.total}</span>{" "}
                            teams
                        </p>
                        <div className="flex flex-wrap items-center gap-4 justify-between sm:justify-end">
                            <AppPagination
                                currentPage={page}
                                totalPages={pagination.total_pages}
                                hasNext={pagination.has_next}
                                hasPrevious={pagination.has_previous}
                                onPageChange={(p) => {
                                    setPage(p);
                                    setSelectedTeamIds(new Set());
                                }}
                            />
                            <Select
                                value={String(pageSize)}
                                onValueChange={(v) => {
                                    setPageSize(parseInt(v, 10));
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-[110px] h-9 shadow-sm bg-card text-[13px] border-border/60">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10 / page</SelectItem>
                                    <SelectItem value="20">20 / page</SelectItem>
                                    <SelectItem value="50">50 / page</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

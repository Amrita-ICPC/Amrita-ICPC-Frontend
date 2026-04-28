"use client";

import { useMemo, useState } from "react";
import {
    Users,
    CheckCircle2,
    Clock,
    XCircle,
    Ban,
    Search,
    MoreVertical,
    Eye,
    Flag,
    FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
    useGetContestTeamsApiV1ContestsContestIdTeamsGet,
    useGetTeamMembersApiV1ContestsContestIdTeamsTeamIdMembersGet,
    useApproveTeamApiV1ContestsContestIdTeamsTeamIdApprovePatch,
    useRejectTeamApiV1ContestsContestIdTeamsTeamIdRejectPatch,
    useConfirmTeamApiV1ContestsContestIdTeamsTeamIdConfirmPatch,
    getGetContestTeamsApiV1ContestsContestIdTeamsGetQueryKey,
} from "@/api/generated/teams/teams";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppPagination } from "@/components/shared/app-pagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { TeamApprovalStatus } from "@/api/generated/model/teamApprovalStatus";
import { TeamStatus } from "@/api/generated/model/teamStatus";
import type { ContestTeamResponse } from "@/api/generated/model/contestTeamResponse";
import type { TeamMemberPreview } from "@/api/generated/model/teamMemberPreview";
import type { TeamMemberResponse } from "@/api/generated/model/teamMemberResponse";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ContestTeamsClientProps {
    contestId: string;
}

function StatCard({
    icon: Icon,
    label,
    value,
    color = "primary",
}: {
    icon: React.ElementType;
    label: string;
    value: number;
    color?: "primary" | "emerald" | "amber" | "red" | "violet";
}) {
    const colorMap: Record<string, string> = {
        primary: "bg-primary/10 text-primary",
        emerald: "bg-emerald-500/10 text-emerald-500",
        amber: "bg-amber-500/10 text-amber-500",
        red: "bg-red-500/10 text-red-500",
        violet: "bg-violet-500/10 text-violet-500",
    };

    return (
        <Card className="border-border/60 bg-gradient-to-br from-card via-card to-primary/5">
            <CardContent className="p-5">
                <div className="flex items-center gap-3">
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colorMap[color] ?? colorMap.primary}`}
                    >
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ApprovalBadge({ status }: { status: string }) {
    if (status === TeamApprovalStatus.APPROVED) {
        return (
            <Badge className="border-transparent bg-emerald-500/12 text-emerald-500 hover:bg-emerald-500/20 dark:bg-emerald-500/22 dark:text-emerald-400">
                Approved
            </Badge>
        );
    }
    if (status === TeamApprovalStatus.REJECTED) {
        return (
            <Badge className="border-transparent bg-red-500/12 text-red-500 hover:bg-red-500/20 dark:bg-red-500/22 dark:text-red-400">
                Rejected
            </Badge>
        );
    }

    return (
        <Badge className="border-transparent bg-amber-500/12 text-amber-500 hover:bg-amber-500/20 dark:bg-amber-500/22 dark:text-amber-400">
            Pending
        </Badge>
    );
}

function TeamStatusBadge({ status }: { status: string }) {
    if (status === TeamStatus.CONFIRMED) {
        return (
            <Badge variant="outline" className="border-transparent bg-blue-500/10 text-blue-500">
                Confirmed
            </Badge>
        );
    }
    if (status === TeamStatus.DISQUALIFIED) {
        return (
            <Badge variant="outline" className="border-transparent bg-zinc-500/10 text-zinc-400">
                Disqualified
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="border-transparent bg-orange-500/10 text-orange-500">
            Draft
        </Badge>
    );
}

function initialsColor(initials: string) {
    const palette = [
        "bg-blue-500/20 text-blue-300 ring-blue-500/20",
        "bg-emerald-500/20 text-emerald-300 ring-emerald-500/20",
        "bg-violet-500/20 text-violet-300 ring-violet-500/20",
        "bg-amber-500/20 text-amber-300 ring-amber-500/20",
        "bg-rose-500/20 text-rose-300 ring-rose-500/20",
        "bg-cyan-500/20 text-cyan-300 ring-cyan-500/20",
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
                            className={`h-8 w-8 border border-white/10 ring-1 ring-white/10 ${c}`}
                        >
                            {m.avatar ? <AvatarImage src={m.avatar} alt={m.name} /> : null}
                            <AvatarFallback className="bg-transparent text-[11px] font-semibold">
                                {m.initials}
                            </AvatarFallback>
                        </Avatar>
                    );
                })}
            </div>
            {(extraCount ?? 0) > 0 && (
                <div className="ml-2 text-xs text-muted-foreground">+{extraCount}</div>
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
        useGetTeamMembersApiV1ContestsContestIdTeamsTeamIdMembersGet(
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
    onConfirm,
    busy,
}: {
    onApprove: () => void;
    onReject: () => void;
    onConfirm: () => void;
    busy?: boolean;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9" disabled={busy}>
                    <MoreVertical className="h-4 w-4" />
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
                <DropdownMenuItem className="cursor-pointer" onClick={onConfirm}>
                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                    Confirm team
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                    <Ban className="mr-2 h-4 w-4 text-violet-500" />
                    Disqualify team
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                    <Flag className="mr-2 h-4 w-4 text-amber-500" />
                    Report team
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function ContestTeamsClient({ contestId }: ContestTeamsClientProps) {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [teamStatus, setTeamStatus] = useState<TeamStatus | "ALL">("ALL");
    const [approvalStatus, setApprovalStatus] = useState<TeamApprovalStatus | "ALL">("ALL");
    const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(new Set());
    const [bulkBusy, setBulkBusy] = useState<null | "approve" | "reject" | "confirm">(null);

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

    const teams = data?.data?.teams ?? [];
    const pagination = data?.pagination;
    const teamStats = data?.data;

    const stats = {
        total: teamStats?.total ?? 0,
        approved: teamStats?.approved_count ?? 0,
        pending: teamStats?.waiting_count ?? 0,
        rejected: teamStats?.rejected_count ?? 0,
        disqualified: teamStats?.disqualified_count ?? 0,
    };

    const approveMutation = useApproveTeamApiV1ContestsContestIdTeamsTeamIdApprovePatch();
    const rejectMutation = useRejectTeamApiV1ContestsContestIdTeamsTeamIdRejectPatch();
    const confirmMutation = useConfirmTeamApiV1ContestsContestIdTeamsTeamIdConfirmPatch();

    const baseTeamsQueryKey = getGetContestTeamsApiV1ContestsContestIdTeamsGetQueryKey(contestId);

    async function refreshTeams() {
        await queryClient.invalidateQueries({ queryKey: baseTeamsQueryKey, exact: false });
    }

    async function approveTeam(team: ContestTeamResponse) {
        try {
            await approveMutation.mutateAsync({ contestId, teamId: team.id });
            toast.success(`Approved "${team.name}"`);
            await refreshTeams();
        } catch {
            toast.error(`Failed to approve "${team.name}"`);
        }
    }

    async function rejectTeam(team: ContestTeamResponse) {
        try {
            await rejectMutation.mutateAsync({ contestId, teamId: team.id });
            toast.success(`Rejected "${team.name}"`);
            await refreshTeams();
        } catch {
            toast.error(`Failed to reject "${team.name}"`);
        }
    }

    async function confirmTeam(team: ContestTeamResponse) {
        try {
            await confirmMutation.mutateAsync({ contestId, teamId: team.id });
            toast.success(`Confirmed "${team.name}"`);
            await refreshTeams();
        } catch {
            toast.error(`Failed to confirm "${team.name}"`);
        }
    }

    const allOnPageSelected = useMemo(
        () => teams.length > 0 && teams.every((t) => selectedTeamIds.has(t.id)),
        [teams, selectedTeamIds],
    );
    const someOnPageSelected = useMemo(
        () => teams.some((t) => selectedTeamIds.has(t.id)) && !allOnPageSelected,
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

    async function runBulk(action: "approve" | "reject" | "confirm") {
        const ids = Array.from(selectedTeamIds);
        if (ids.length === 0) return;
        setBulkBusy(action);
        try {
            const teamById = new Map(teams.map((t) => [t.id, t]));
            await Promise.allSettled(
                ids.map(async (id) => {
                    const t = teamById.get(id) ?? ({ id, name: "team" } as ContestTeamResponse);
                    if (action === "approve")
                        return approveMutation.mutateAsync({ contestId, teamId: id });
                    if (action === "reject")
                        return rejectMutation.mutateAsync({ contestId, teamId: id });
                    return confirmMutation.mutateAsync({ contestId, teamId: id });
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

    return (
        <div className="space-y-6">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm">
                <div className="relative space-y-5">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Contest teams</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Review registrations and track approval status for this contest.
                        </p>
                    </div>

                    {/* Counts */}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                        <StatCard icon={Users} label="Total" value={stats.total} color="primary" />
                        <StatCard
                            icon={CheckCircle2}
                            label="Approved"
                            value={stats.approved}
                            color="emerald"
                        />
                        <StatCard
                            icon={Clock}
                            label="Pending"
                            value={stats.pending}
                            color="amber"
                        />
                        <StatCard
                            icon={XCircle}
                            label="Rejected"
                            value={stats.rejected}
                            color="red"
                        />
                        <StatCard
                            icon={Ban}
                            label="Disqualified"
                            value={stats.disqualified}
                            color="violet"
                        />
                    </div>
                </div>
            </div>

            {/* Teams management */}
            <Card className="overflow-hidden border-border/60 bg-card/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/50">
                <CardHeader className="pb-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-lg font-semibold tracking-tight">
                                Teams management
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Search teams, filter by status, and manage approvals.
                            </p>
                        </div>
                        <Button variant="outline" size="sm" className="h-9 self-start shadow-xs">
                            <FileText className="mr-2 h-4 w-4" />
                            Reports
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filters row */}
                    <div className="grid grid-cols-1 gap-4 rounded-xl border border-border/60 bg-background/40 p-4 shadow-xs sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex flex-col gap-1">
                            <p className="text-xs font-medium text-muted-foreground">Search</p>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Team name or member…"
                                    className="h-10 pl-9 shadow-xs"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                        setSelectedTeamIds(new Set());
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <p className="text-xs font-medium text-muted-foreground">
                                Approval status
                            </p>
                            <Select
                                value={approvalStatus}
                                onValueChange={(v) => {
                                    setApprovalStatus(v as TeamApprovalStatus | "ALL");
                                    setPage(1);
                                    setSelectedTeamIds(new Set());
                                }}
                            >
                                <SelectTrigger className="h-10 w-full shadow-xs">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All</SelectItem>
                                    <SelectItem value={TeamApprovalStatus.APPROVED}>
                                        Approved
                                    </SelectItem>
                                    <SelectItem value={TeamApprovalStatus.WAITING}>
                                        Pending
                                    </SelectItem>
                                    <SelectItem value={TeamApprovalStatus.REJECTED}>
                                        Rejected
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <p className="text-xs font-medium text-muted-foreground">Team status</p>
                            <Select
                                value={teamStatus}
                                onValueChange={(v) => {
                                    setTeamStatus(v as TeamStatus | "ALL");
                                    setPage(1);
                                    setSelectedTeamIds(new Set());
                                }}
                            >
                                <SelectTrigger className="h-10 w-full shadow-xs">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All</SelectItem>
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
                    {selectedTeamIds.size > 0 ? (
                        <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/20 p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                                <span className="font-semibold text-foreground">
                                    {selectedTeamIds.size}
                                </span>{" "}
                                selected
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={bulkBusy !== null}
                                    onClick={() => runBulk("approve")}
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                                    Bulk approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={bulkBusy !== null}
                                    onClick={() => runBulk("reject")}
                                >
                                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                    Bulk reject
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={bulkBusy !== null}
                                    onClick={() => runBulk("confirm")}
                                >
                                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                                    Bulk confirm
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={bulkBusy !== null}
                                    onClick={() => setSelectedTeamIds(new Set())}
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                    ) : null}

                    {/* Table */}
                    <div className="overflow-hidden rounded-xl border border-border/60 bg-background/30 shadow-xs">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="w-[44px]">
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
                                    <TableHead className="w-[260px]">Team Name</TableHead>
                                    <TableHead>Members</TableHead>
                                    <TableHead>Approval</TableHead>
                                    <TableHead>Team Status</TableHead>
                                    <TableHead className="w-[180px]">Registered At</TableHead>
                                    <TableHead className="text-right w-[120px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 8 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <Skeleton className="h-4 w-4 rounded" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-5 w-40" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-9 w-44" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-6 w-24 rounded-full" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-6 w-28 rounded-full" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-5 w-32" />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Skeleton className="h-9 w-20 ml-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            <div className="flex min-h-[140px] items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 text-sm text-destructive">
                                                Failed to load teams.
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : teams.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground">
                                                <Users className="h-9 w-9 opacity-30" />
                                                <p className="text-sm">
                                                    {search
                                                        ? "No teams match your search."
                                                        : "No teams registered for this contest."}
                                                </p>
                                                {search ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSearch("")}
                                                    >
                                                        Clear search
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    teams.map((team) => (
                                        <TableRow
                                            key={team.id}
                                            className="hover:bg-muted/25 transition-colors"
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedTeamIds.has(team.id)}
                                                    onCheckedChange={(v) =>
                                                        toggleTeam(team.id, Boolean(v))
                                                    }
                                                    aria-label={`Select team ${team.name}`}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-0.5">
                                                    <p className="font-semibold leading-tight">
                                                        {team.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                                        {team.description || "—"}
                                                    </p>
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
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(team.created_at).toLocaleString(
                                                    undefined,
                                                    {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    },
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-9 w-9 shadow-xs"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <TeamActionsDropdown
                                                        busy={
                                                            approveMutation.isPending ||
                                                            rejectMutation.isPending ||
                                                            confirmMutation.isPending
                                                        }
                                                        onApprove={() => approveTeam(team)}
                                                        onReject={() => rejectTeam(team)}
                                                        onConfirm={() => confirmTeam(team)}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Footer */}
                    {pagination ? (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-muted-foreground">
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
                                <span className="font-medium text-foreground">
                                    {pagination.total}
                                </span>{" "}
                                teams
                            </p>
                            <div className="flex items-center gap-3 justify-between sm:justify-end">
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
                                    <SelectTrigger className="w-32">
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
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}

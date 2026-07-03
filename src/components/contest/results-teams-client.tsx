"use client";

import { useQueries, useQueryClient } from "@tanstack/react-query";
import { ArrowUpDown, Ban, Eye, Flag, Loader2, Search, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { TeamApprovalStatus } from "@/api/generated/model/teamApprovalStatus";
import { TeamStatus } from "@/api/generated/model/teamStatus";
import {
    getContestTeamAnalyticsApiV1ContestsContestIdTeamsContestTeamIdAnalyticsGet,
    getGetContestTeamsApiV1ContestsContestIdTeamsGetQueryKey,
    useDisqualifyTeamApiV1ContestsContestIdTeamsContestTeamIdDisqualifyPatch,
    useGetContestTeamsApiV1ContestsContestIdTeamsGet,
} from "@/api/generated/teams/teams";
import { AppPagination } from "@/components/shared/app-pagination";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ResultsTeamsClient({ contestId }: { contestId: string }) {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("score_desc");
    const [flaggedOnly, setFlaggedOnly] = useState(false);
    const [disqualifiedOnly, setDisqualifiedOnly] = useState(false);
    const [page, setPage] = useState(1);

    const teamsQuery = useGetContestTeamsApiV1ContestsContestIdTeamsGet(contestId, {
        page,
        page_size: 10,
        search: search || undefined,
        approval_status: TeamApprovalStatus.APPROVED,
        team_status: disqualifiedOnly ? TeamStatus.DISQUALIFIED : TeamStatus.CONFIRMED,
        sort_by: sort.startsWith("score") ? "score" : "name",
        sort_order: sort.endsWith("asc") ? "asc" : "desc",
    });

    const disqualifyMutation =
        useDisqualifyTeamApiV1ContestsContestIdTeamsContestTeamIdDisqualifyPatch({
            mutation: {
                onSuccess: async () => {
                    toast.success("Team disqualified");
                    await queryClient.invalidateQueries({
                        queryKey:
                            getGetContestTeamsApiV1ContestsContestIdTeamsGetQueryKey(contestId),
                        exact: false,
                    });
                },
                onError: () => toast.error("Could not disqualify team"),
            },
        });

    const teams = teamsQuery.data?.data?.teams ?? [];
    const analyticsQueries = useQueries({
        queries: teams.map((team) => ({
            queryKey: ["contest-team-analytics", contestId, team.id],
            queryFn: () =>
                getContestTeamAnalyticsApiV1ContestsContestIdTeamsContestTeamIdAnalyticsGet(
                    contestId,
                    team.id,
                ),
            enabled: flaggedOnly,
            staleTime: 30_000,
        })),
    });
    const flaggedTeamIds = new Set(
        teams
            .filter((_team, index) =>
                analyticsQueries[index]?.data?.data?.members?.some((member) => member.is_flagged),
            )
            .map((team) => team.id),
    );
    const visibleTeams = [...teams]
        .filter((team) => !flaggedOnly || flaggedTeamIds.has(team.id))
        .sort((a, b) => {
            if (sort === "name_asc") return a.name.localeCompare(b.name);
            if (sort === "name_desc") return b.name.localeCompare(a.name);
            return 0;
        });
    const isFlagFilterLoading = flaggedOnly && analyticsQueries.some((query) => query.isLoading);
    const pagination = teamsQuery.data?.pagination;

    return (
        <Card className="overflow-hidden border-border/60 shadow-sm">
            <CardHeader className="gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <CardTitle className="text-lg">Team results</CardTitle>
                    <CardDescription>
                        Review approved and confirmed teams, their members, scores, and submissions.
                    </CardDescription>
                </div>
                <div className="flex w-fit items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold text-foreground">
                        {flaggedOnly
                            ? visibleTeams.length
                            : (teamsQuery.data?.data?.total ?? teams.length)}
                    </span>
                    teams in view
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="flex flex-col gap-3 border-y border-border/50 bg-muted/10 px-5 py-3 sm:flex-row sm:items-center">
                    <div className="relative sm:w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                            placeholder="Search by team name..."
                            className="pl-9"
                        />
                    </div>
                    <Select
                        value={sort}
                        onValueChange={(value) => {
                            setSort(value);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-44">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="score_desc">Highest score</SelectItem>
                            <SelectItem value="score_asc">Lowest score</SelectItem>
                            <SelectItem value="name_asc">Name A–Z</SelectItem>
                            <SelectItem value="name_desc">Name Z–A</SelectItem>
                        </SelectContent>
                    </Select>
                    <FilterSwitch
                        icon={Flag}
                        label="Flagged"
                        checked={flaggedOnly}
                        onCheckedChange={(checked) => {
                            setFlaggedOnly(checked);
                            setPage(1);
                        }}
                    />
                    <FilterSwitch
                        icon={Ban}
                        label="Disqualified"
                        checked={disqualifiedOnly}
                        onCheckedChange={(checked) => {
                            setDisqualifiedOnly(checked);
                            setPage(1);
                        }}
                    />
                </div>

                {teamsQuery.isLoading || isFlagFilterLoading ? (
                    <div className="space-y-1 p-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton key={index} className="h-[72px] w-full" />
                        ))}
                    </div>
                ) : teamsQuery.isError ? (
                    <div className="flex min-h-52 items-center justify-center text-sm text-destructive">
                        Could not load contest teams.
                    </div>
                ) : visibleTeams.length === 0 ? (
                    <div className="flex min-h-52 flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Users className="h-8 w-8 opacity-40" />
                        <p className="text-sm">No teams match this search.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-muted/20">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="h-12 min-w-56 px-5">Team</TableHead>
                                <TableHead className="w-48">Members preview</TableHead>
                                <TableHead className="w-32">
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1.5"
                                        onClick={() => {
                                            setSort((current) =>
                                                current === "score_desc"
                                                    ? "score_asc"
                                                    : "score_desc",
                                            );
                                            setPage(1);
                                        }}
                                    >
                                        Score{" "}
                                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                                    </button>
                                </TableHead>
                                <TableHead className="w-44">Enrolled at</TableHead>
                                <TableHead className="w-36 pr-5 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visibleTeams.map((team) => (
                                <TableRow key={team.id} className="group h-[76px]">
                                    <TableCell className="px-5">
                                        <Link
                                            href={`/contest/${contestId}/evaluate/${team.id}`}
                                            className="flex items-center gap-3"
                                        >
                                            <Avatar className="h-10 w-10 border border-primary/15">
                                                <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                                                    {team.name.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="max-w-52 truncate font-semibold group-hover:text-primary">
                                                    {team.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Contest team
                                                </p>
                                            </div>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <TooltipProvider delayDuration={150}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="flex -space-x-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                    >
                                                        {(team.members_preview ?? [])
                                                            .slice(0, 3)
                                                            .map((member) => (
                                                                <Avatar
                                                                    key={member.id}
                                                                    className="h-9 w-9 border-2 border-card transition-transform hover:-translate-y-0.5"
                                                                >
                                                                    <AvatarFallback className="bg-sky-500/10 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                                                                        {member.initials}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            ))}
                                                        {(team.extra_members_count ?? 0) > 0 && (
                                                            <span className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-semibold text-muted-foreground">
                                                                +{team.extra_members_count}
                                                            </span>
                                                        )}
                                                        {!team.members_preview?.length && (
                                                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                                                <Users className="h-4 w-4" />
                                                            </span>
                                                        )}
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="bottom"
                                                    sideOffset={8}
                                                    className="w-64 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg"
                                                >
                                                    <p className="mb-2 text-sm font-semibold">
                                                        Team members
                                                    </p>
                                                    <div className="space-y-2">
                                                        {(team.members_preview ?? []).map(
                                                            (member) => (
                                                                <div
                                                                    key={member.id}
                                                                    className="flex items-center gap-2.5"
                                                                >
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                                                                            {member.initials}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <p className="truncate text-sm">
                                                                        {member.name}
                                                                    </p>
                                                                </div>
                                                            ),
                                                        )}
                                                        {!team.members_preview?.length && (
                                                            <p className="text-xs text-muted-foreground">
                                                                No member preview available.
                                                            </p>
                                                        )}
                                                    </div>
                                                    {(team.extra_members_count ?? 0) > 0 && (
                                                        <p className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
                                                            +{team.extra_members_count} more members
                                                        </p>
                                                    )}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-semibold tabular-nums text-primary">
                                            {(team.score ?? 0).toLocaleString()}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {team.enrolled_at
                                            ? new Intl.DateTimeFormat(undefined, {
                                                  dateStyle: "medium",
                                                  timeStyle: "short",
                                              }).format(new Date(team.enrolled_at))
                                            : "—"}
                                    </TableCell>
                                    <TableCell className="pr-5">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                size="sm"
                                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                                                asChild
                                            >
                                                <Link
                                                    href={`/contest/${contestId}/evaluate/${team.id}`}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View
                                                </Link>
                                            </Button>
                                            {!disqualifiedOnly && (
                                                <AlertDialog>
                                                    <TooltipProvider delayDuration={200}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                                        disabled={
                                                                            disqualifyMutation.isPending
                                                                        }
                                                                        aria-label={`Disqualify ${team.name}`}
                                                                    >
                                                                        {disqualifyMutation.isPending &&
                                                                        disqualifyMutation.variables
                                                                            ?.contestTeamId ===
                                                                            team.id ? (
                                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                                        ) : (
                                                                            <Ban className="h-4 w-4" />
                                                                        )}
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                            </TooltipTrigger>
                                                            <TooltipContent
                                                                side="top"
                                                                sideOffset={6}
                                                            >
                                                                Disqualify team
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                Disqualify {team.name}?
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This team will be removed from the
                                                                confirmed results list and will no
                                                                longer be eligible for the contest.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>
                                                                Cancel
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                onClick={() =>
                                                                    disqualifyMutation.mutate({
                                                                        contestId,
                                                                        contestTeamId: team.id,
                                                                    })
                                                                }
                                                            >
                                                                Disqualify team
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                {pagination && pagination.total_pages > 1 && (
                    <div className="flex justify-end border-t border-border/50 p-4">
                        <AppPagination
                            currentPage={page}
                            totalPages={pagination.total_pages}
                            hasPrevious={pagination.has_previous}
                            hasNext={pagination.has_next}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function FilterSwitch({
    icon: Icon,
    label,
    checked,
    onCheckedChange,
}: {
    icon: typeof Flag;
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}) {
    return (
        <label className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-sm shadow-xs">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{label}</span>
            <Switch
                checked={checked}
                onCheckedChange={onCheckedChange}
                aria-label={`Show ${label.toLowerCase()} teams`}
                className="ml-1 scale-90"
            />
        </label>
    );
}

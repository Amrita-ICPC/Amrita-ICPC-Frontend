"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Ban, RefreshCw, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { ContestTeamMemberAnalytics } from "@/api/generated/model/contestTeamMemberAnalytics";
import { EvaluationScope } from "@/api/generated/model/evaluationScope";
import {
    getGetContestTeamsApiV1ContestsContestIdTeamsGetQueryKey,
    useDisqualifyTeamApiV1ContestsContestIdTeamsContestTeamIdDisqualifyPatch,
    useGetContestTeamAnalyticsApiV1ContestsContestIdTeamsContestTeamIdAnalyticsGet,
} from "@/api/generated/teams/teams";
import { EvaluationDialog } from "@/components/contest/evaluation-dialog";
import { TeamSubmissionBreakdownChart } from "@/components/contest/team-submission-breakdown-chart";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface TeamAnalyticsClientProps {
    contestId: string;
    contestTeamId: string;
}

function numberValue(value?: number) {
    return value ?? 0;
}

function formatDateTime(value?: string | null) {
    if (!value) return "Not recorded";

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function getErrorMessage(error: unknown) {
    if (typeof error === "object" && error && "message" in error) {
        return String((error as { message?: unknown }).message ?? "Unable to load analytics.");
    }

    return "Unable to load analytics.";
}

function HeroMetric({
    label,
    value,
    hint,
    tone = "neutral",
}: {
    label: string;
    value: string | number;
    hint: string;
    tone?: "neutral" | "primary" | "emerald" | "amber" | "red";
}) {
    const toneClass = {
        neutral: "border-border/70 bg-muted/30 text-foreground",
        primary: "border-primary/20 bg-primary/5 text-primary",
        emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
        amber: "border-amber-500/25 bg-amber-500/5 text-amber-600 dark:text-amber-400",
        red: "border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-300",
    };

    return (
        <div className={cn("rounded-xl border p-3 shadow-xs", toneClass[tone])}>
            <p className="text-[11px] font-semibold uppercase text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums text-current">
                {value}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        </div>
    );
}

function ParticipationBadge({ participated }: { participated?: boolean }) {
    return participated ? (
        <Badge className="border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            Participated
        </Badge>
    ) : (
        <Badge variant="outline" className="border-transparent bg-muted text-muted-foreground">
            Not started
        </Badge>
    );
}

function FlagBadge({ member }: { member: ContestTeamMemberAnalytics }) {
    return member.is_flagged ? (
        <Badge className="border-transparent bg-rose-500/10 text-rose-700 dark:text-rose-300">
            Flagged
        </Badge>
    ) : (
        <Badge
            variant="outline"
            className="border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
        >
            Clear
        </Badge>
    );
}

function MembersTable({
    contestId,
    contestTeamId,
    members,
}: {
    contestId: string;
    contestTeamId: string;
    members: ContestTeamMemberAnalytics[];
}) {
    if (!members.length) {
        return (
            <Card className="rounded-2xl border-border/60 shadow-sm">
                <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
                    <Users className="h-10 w-10 opacity-40" />
                    <div>
                        <p className="font-medium text-foreground">No member analytics found</p>
                        <p className="text-sm">
                            Member activity will appear once analytics are available.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden rounded-2xl border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/60 px-5 py-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <CardTitle>Member Analytics</CardTitle>
                        <CardDescription>
                            Participation, score, session window, and flag status for each team
                            member.
                        </CardDescription>
                    </div>
                    <Badge
                        variant="outline"
                        className="w-fit border-transparent bg-muted text-muted-foreground"
                    >
                        {members.length} members
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40">
                            <TableHead className="h-12 px-5">Member</TableHead>
                            <TableHead className="text-center">Score</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Session Window</TableHead>
                            <TableHead>Review Notes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.map((member, index) => (
                            <TableRow
                                key={member.contest_team_member_id}
                                className={cn(
                                    "h-[76px] hover:bg-muted/40",
                                    member.is_flagged && "bg-rose-500/[0.03]",
                                )}
                            >
                                <TableCell className="px-5">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold",
                                                member.is_flagged
                                                    ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                                    : "bg-primary/10 text-primary",
                                            )}
                                        >
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/contest/${contestId}/evaluate/${contestTeamId}/${member.contest_team_member_id}`}
                                                    className="font-medium transition-colors hover:text-primary"
                                                >
                                                    {member.name}
                                                </Link>
                                                {member.is_leader ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-transparent bg-sky-500/10 text-sky-700 dark:text-sky-300"
                                                    >
                                                        Leader
                                                    </Badge>
                                                ) : null}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {member.email}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="inline-flex min-w-12 justify-center rounded-md bg-primary/10 px-2.5 py-1 text-sm font-bold tabular-nums text-primary">
                                        {numberValue(member.score)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col items-start gap-2">
                                        <ParticipationBadge participated={member.is_participated} />
                                        <FlagBadge member={member} />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1 text-sm leading-relaxed">
                                        <p className="font-medium">
                                            {formatDateTime(member.started_at)}
                                        </p>
                                        <p className="text-muted-foreground">
                                            Ended {formatDateTime(member.ended_at)}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-[320px]">
                                    {member.flagged_reason ? (
                                        <p className="whitespace-normal text-sm text-foreground">
                                            {member.flagged_reason}
                                        </p>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">
                                            No review notes.
                                        </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function TeamAnalyticsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.75fr)]">
                <Skeleton className="h-72 rounded-2xl" />
                <Skeleton className="h-72 rounded-2xl" />
            </div>
            <Skeleton className="h-96 rounded-2xl" />
        </div>
    );
}

function TeamAnalyticsError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
    return (
        <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex min-h-[260px] flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                    <AlertCircle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <p className="font-semibold text-destructive">Failed to load team analytics</p>
                    <p className="max-w-md text-sm text-muted-foreground">
                        {getErrorMessage(error)}
                    </p>
                </div>
                <Button variant="outline" onClick={onRetry}>
                    <RefreshCw className="h-4 w-4" />
                    Retry
                </Button>
            </CardContent>
        </Card>
    );
}

export function TeamAnalyticsClient({ contestId, contestTeamId }: TeamAnalyticsClientProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data, isLoading, isError, error, refetch } =
        useGetContestTeamAnalyticsApiV1ContestsContestIdTeamsContestTeamIdAnalyticsGet(
            contestId,
            contestTeamId,
        );

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
                    router.push(`/contest/${contestId}/evaluate`);
                },
                onError: () => toast.error("Could not disqualify team"),
            },
        });

    const analytics = data?.data;

    if (isLoading) {
        return <TeamAnalyticsSkeleton />;
    }

    if (isError || !analytics) {
        return <TeamAnalyticsError error={error} onRetry={() => void refetch()} />;
    }

    const members = analytics.members ?? [];
    const flaggedMembers = members.filter((member) => member.is_flagged).length;
    const participatedMembers = members.filter((member) => member.is_participated).length;

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden rounded-2xl border-border/60 bg-card shadow-sm">
                <CardContent className="p-5">
                    <div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                        {analytics.name}
                                    </h1>
                                    <Badge
                                        variant="outline"
                                        className="border-border/60 bg-muted/60 text-muted-foreground"
                                    >
                                        Team analytics
                                    </Badge>
                                </div>
                                <p className="max-w-2xl text-sm text-muted-foreground">
                                    Instructor view of team score, participation, flags, and
                                    verdicts.
                                </p>
                            </div>
                            <div className="flex shrink-0 gap-2">
                                <EvaluationDialog
                                    contestId={contestId}
                                    defaultScope={EvaluationScope.TEAMS}
                                    defaultIds={[contestTeamId]}
                                />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="border-destructive/30 text-destructive hover:bg-destructive/10"
                                        >
                                            <Ban className="h-4 w-4" />
                                            Disqualify team
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Disqualify {analytics.name}?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                The team will be removed from confirmed results and
                                                will no longer be eligible for this contest.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                onClick={() =>
                                                    disqualifyMutation.mutate({
                                                        contestId,
                                                        contestTeamId,
                                                    })
                                                }
                                            >
                                                Disqualify team
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            <HeroMetric
                                label="Team Score"
                                value={numberValue(analytics.score)}
                                hint="Evaluated score"
                                tone="primary"
                            />
                            <HeroMetric
                                label="Participation"
                                value={`${participatedMembers}/${members.length || 0}`}
                                hint="Members participated"
                                tone={participatedMembers === members.length ? "emerald" : "amber"}
                            />
                            <HeroMetric
                                label="Flags"
                                value={flaggedMembers}
                                hint={
                                    flaggedMembers > 0
                                        ? "Needs instructor review"
                                        : "No flags raised"
                                }
                                tone={flaggedMembers > 0 ? "red" : "neutral"}
                            />
                        </div>
                    </div>
                    <div className="mt-5 border-t border-border/60 pt-4">
                        <TeamSubmissionBreakdownChart analytics={analytics} embedded />
                    </div>
                </CardContent>
            </Card>

            <MembersTable contestId={contestId} contestTeamId={contestTeamId} members={members} />
        </div>
    );
}

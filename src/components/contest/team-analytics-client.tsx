"use client";

import { AlertCircle, RefreshCw, Users } from "lucide-react";
import Link from "next/link";

import type { ContestTeamMemberAnalytics } from "@/api/generated/model/contestTeamMemberAnalytics";
import { useGetContestTeamAnalyticsApiV1ContestsContestIdTeamsContestTeamIdAnalyticsGet } from "@/api/generated/teams/teams";
import { TeamSubmissionBreakdownChart } from "@/components/contest/team-submission-breakdown-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

function getAcceptanceTone(rate: number) {
    if (rate >= 70) {
        return {
            label: "Strong",
            badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            text: "text-emerald-600 dark:text-emerald-400",
            progress: "bg-emerald-500",
        };
    }

    if (rate >= 40) {
        return {
            label: "Needs review",
            badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
            text: "text-amber-600 dark:text-amber-400",
            progress: "bg-amber-500",
        };
    }

    return {
        label: "At risk",
        badge: "bg-red-500/10 text-red-600 dark:text-red-400",
        text: "text-red-600 dark:text-red-400",
        progress: "bg-red-500",
    };
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
        red: "border-red-500/25 bg-red-500/5 text-red-600 dark:text-red-400",
    };

    return (
        <div className={cn("rounded-lg border p-3.5 shadow-xs", toneClass[tone])}>
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
        <Badge className="border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
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
        <Badge className="border-transparent bg-red-500/10 text-red-600 dark:text-red-400">
            Flagged
        </Badge>
    ) : (
        <Badge
            variant="outline"
            className="border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
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
            <Card className="border-border/60">
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
        <Card className="border-border/60">
            <CardHeader className="border-b border-border/60">
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
                                    member.is_flagged && "bg-red-500/[0.03]",
                                )}
                            >
                                <TableCell className="px-5">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold",
                                                member.is_flagged
                                                    ? "bg-red-500/10 text-red-600 dark:text-red-400"
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
                                                        className="border-transparent bg-blue-500/10 text-blue-600 dark:text-blue-400"
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
                <Skeleton className="h-72 rounded-xl" />
                <Skeleton className="h-72 rounded-xl" />
            </div>
            <Skeleton className="h-96 rounded-xl" />
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
    const { data, isLoading, isError, error, refetch } =
        useGetContestTeamAnalyticsApiV1ContestsContestIdTeamsContestTeamIdAnalyticsGet(
            contestId,
            contestTeamId,
        );

    const analytics = data?.data;

    if (isLoading) {
        return <TeamAnalyticsSkeleton />;
    }

    if (isError || !analytics) {
        return <TeamAnalyticsError error={error} onRetry={() => void refetch()} />;
    }

    const members = analytics.members ?? [];
    const totalSubmissions = numberValue(analytics.total_submissions);
    const acceptedSubmissions = numberValue(analytics.accepted_submission);
    const pendingSubmissions = numberValue(analytics.pending_submission);
    const flaggedMembers = members.filter((member) => member.is_flagged).length;
    const participatedMembers = members.filter((member) => member.is_participated).length;
    const acceptanceRate =
        totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;
    const acceptanceTone = getAcceptanceTone(acceptanceRate);

    return (
        <div className="space-y-6">
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.75fr)]">
                <Card className="self-start border-border/70 bg-card shadow-sm">
                    <CardContent className="p-5 md:p-6">
                        <div className="flex flex-col gap-2">
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
                                Instructor view of scoring health, pending work, and member
                                participation.
                            </p>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <HeroMetric
                                label="Team Score"
                                value={numberValue(analytics.score)}
                                hint="Evaluated score"
                                tone="primary"
                            />
                            <HeroMetric
                                label="Submissions"
                                value={totalSubmissions}
                                hint={`${acceptedSubmissions} accepted`}
                            />
                            <div className="rounded-lg border border-border/70 bg-muted/30 p-3.5 shadow-xs">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                                        Acceptance
                                    </p>
                                    <Badge
                                        variant="outline"
                                        className={cn("border-transparent", acceptanceTone.badge)}
                                    >
                                        {acceptanceTone.label}
                                    </Badge>
                                </div>
                                <p
                                    className={cn(
                                        "mt-1 text-2xl font-bold tracking-tight tabular-nums",
                                        acceptanceTone.text,
                                    )}
                                >
                                    {acceptanceRate}%
                                </p>
                                <Progress
                                    value={acceptanceRate}
                                    max={100}
                                    className="mt-2 h-2"
                                    indicatorClassName={acceptanceTone.progress}
                                />
                            </div>
                            <HeroMetric
                                label="Pending"
                                value={pendingSubmissions}
                                hint="Waiting for evaluation"
                                tone="red"
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
                    </CardContent>
                </Card>

                <TeamSubmissionBreakdownChart analytics={analytics} />
            </div>

            <MembersTable contestId={contestId} contestTeamId={contestTeamId} members={members} />
        </div>
    );
}

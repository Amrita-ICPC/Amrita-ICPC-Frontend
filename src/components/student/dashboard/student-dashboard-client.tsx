"use client";

import { useQueries, useQueryClient } from "@tanstack/react-query";
import {
    ArrowRight,
    CalendarDays,
    Check,
    CircleAlert,
    Compass,
    Inbox,
    Loader2,
    Trophy,
    Users,
    X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import type {
    StudentContestAvailableResponse,
    UserInvitationResponse,
} from "@/api/generated/model";
import { ContestRunStatus, ContestTeamMemberStatus } from "@/api/generated/model";
import {
    getGetStudentContestByIdApiV1StudentsContestsContestIdGetQueryOptions,
    getGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGetQueryKey,
    useGetMyTeamsApiV1StudentsTeamsGet,
    useGetStudentContestsApiV1StudentsContestsGet,
    useUpdateContestTeamMemberStatusApiV1StudentsContestsContestIdTeamsContestTeamIdMembersContestTeamMemberIdStatusPatch,
} from "@/api/generated/students/students";
import {
    getGetMyTeamInvitationsApiV1UsersMeTeamInvitationGetQueryKey,
    useGetMyTeamInvitationsApiV1UsersMeTeamInvitationGet,
} from "@/api/generated/users/users";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
});

function getInitials(name: string) {
    return name
        .split(" ")
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase();
}

function runStatusStyle(status: StudentContestAvailableResponse["run_status"]) {
    if (status === ContestRunStatus.LIVE) {
        return "border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    }
    if (status === ContestRunStatus.UPCOMING) {
        return "border-transparent bg-sky-500/10 text-sky-700 dark:text-sky-400";
    }
    return "border-transparent bg-muted text-muted-foreground";
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 rounded-xl" />
                ))}
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
                <Skeleton className="h-[430px] rounded-xl" />
                <Skeleton className="h-[430px] rounded-xl" />
            </div>
        </div>
    );
}

function ContestRow({
    contest,
    resultsPublished = false,
}: {
    contest: StudentContestAvailableResponse;
    resultsPublished?: boolean;
}) {
    const isLive = contest.run_status === ContestRunStatus.LIVE;
    const teamLabel = contest.contest_mode === "team" ? "Team contest" : "Individual";
    const href = resultsPublished
        ? `/student/contest/${contest.id}/results`
        : `/student/contest/${contest.id}`;

    return (
        <Link
            href={href}
            className="group grid gap-4 rounded-xl border border-border/60 bg-background/60 p-4 transition-all hover:border-primary/35 hover:bg-accent/35 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
        >
            <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-primary/8 text-primary">
                {contest.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={contest.image} alt="" className="size-full object-cover" />
                ) : (
                    <Trophy className="size-5" />
                )}
            </div>
            <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-semibold text-foreground group-hover:text-primary">
                        {contest.name}
                    </h3>
                    <Badge
                        variant="outline"
                        className={cn("text-[10px] uppercase", runStatusStyle(contest.run_status))}
                    >
                        {isLive && (
                            <span className="mr-1 size-1.5 animate-pulse rounded-full bg-current" />
                        )}
                        {contest.run_status}
                    </Badge>
                    {resultsPublished && (
                        <Badge className="border-transparent bg-primary/10 text-[10px] uppercase text-primary hover:bg-primary/10">
                            Results published
                        </Badge>
                    )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" />
                        {dateFormatter.format(new Date(contest.start_time))}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Users className="size-3.5" />
                        {teamLabel}
                    </span>
                </div>
            </div>
            <Button variant={isLive ? "default" : "outline"} size="sm" className="w-full sm:w-auto">
                {resultsPublished ? "View results" : isLive ? "Open contest" : "View details"}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
        </Link>
    );
}

function InvitationRow({ invitation }: { invitation: UserInvitationResponse }) {
    const queryClient = useQueryClient();
    const { mutate, isPending } =
        useUpdateContestTeamMemberStatusApiV1StudentsContestsContestIdTeamsContestTeamIdMembersContestTeamMemberIdStatusPatch(
            {
                mutation: {
                    onSuccess: (_, variables) => {
                        toast.success(
                            variables.data.status === ContestTeamMemberStatus.ACCEPTED
                                ? `Joined ${invitation.team.name}`
                                : "Invitation declined",
                        );
                        queryClient.invalidateQueries({
                            queryKey: getGetMyTeamInvitationsApiV1UsersMeTeamInvitationGetQueryKey({
                                status: ContestTeamMemberStatus.INVITED,
                            }),
                        });
                        queryClient.invalidateQueries({
                            queryKey:
                                getGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGetQueryKey(
                                    invitation.contest.id,
                                ),
                        });
                    },
                    onError: () =>
                        toast.error("Could not update the invitation. Please try again."),
                },
            },
        );

    const respond = (
        status: typeof ContestTeamMemberStatus.ACCEPTED | typeof ContestTeamMemberStatus.REJECTED,
    ) => {
        mutate({
            contestId: invitation.contest.id,
            contestTeamId: invitation.team.id,
            contestTeamMemberId: invitation.id,
            data: { status },
        });
    };

    return (
        <div className="rounded-xl border border-border/60 bg-background/60 p-4">
            <div className="flex items-start gap-3">
                <Avatar className="size-10 rounded-lg border">
                    <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                        {getInitials(invitation.team.name)}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{invitation.team.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        For {invitation.contest.name}
                    </p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {invitation.team.joined_members_count}/{invitation.contest.max_team_size}
                </Badge>
            </div>
            {!invitation.can_accept_invitation && invitation.reason && (
                <p className="mt-3 rounded-md bg-amber-500/10 px-2.5 py-2 text-xs text-amber-700 dark:text-amber-400">
                    {invitation.reason}
                </p>
            )}
            <div className="mt-3 flex gap-2">
                <Button
                    size="sm"
                    className="flex-1"
                    disabled={isPending || !invitation.can_accept_invitation}
                    onClick={() => respond(ContestTeamMemberStatus.ACCEPTED)}
                >
                    {isPending ? <Loader2 className="animate-spin" /> : <Check />}
                    Accept
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    disabled={isPending}
                    onClick={() => respond(ContestTeamMemberStatus.REJECTED)}
                >
                    <X /> Decline
                </Button>
            </div>
        </div>
    );
}

export function StudentDashboardClient({ firstName }: { firstName: string }) {
    const contestsQuery = useGetStudentContestsApiV1StudentsContestsGet(undefined, {
        registered: true,
        page: 1,
        page_size: 100,
    });
    const teamsQuery = useGetMyTeamsApiV1StudentsTeamsGet({ page: 1, page_size: 100 });
    const invitationsQuery = useGetMyTeamInvitationsApiV1UsersMeTeamInvitationGet({
        status: ContestTeamMemberStatus.INVITED,
    });

    const contests = contestsQuery.data?.data?.contests ?? [];
    const endedContests = contests.filter(
        (contest) => contest.run_status === ContestRunStatus.ENDED,
    );
    const endedContestDetails = useQueries({
        queries: endedContests.map((contest) =>
            getGetStudentContestByIdApiV1StudentsContestsContestIdGetQueryOptions(contest.id, {
                query: { staleTime: 60_000 },
            }),
        ),
    });

    if (
        contestsQuery.isLoading ||
        teamsQuery.isLoading ||
        invitationsQuery.isLoading ||
        endedContestDetails.some((query) => query.isPending)
    ) {
        return <DashboardSkeleton />;
    }

    const teams = teamsQuery.data?.data?.teams ?? [];
    const invitations = invitationsQuery.data?.data ?? [];
    const liveContests = contests.filter((contest) => contest.run_status === ContestRunStatus.LIVE);
    const upcomingContests = contests.filter(
        (contest) => contest.run_status === ContestRunStatus.UPCOMING,
    );
    const publishedResultIds = new Set(
        endedContestDetails
            .filter((query) => Boolean(query.data?.data?.results_published_at))
            .map((query) => query.data?.data?.id)
            .filter((id): id is string => Boolean(id)),
    );
    const resultsPublishedContests = endedContests.filter((contest) =>
        publishedResultIds.has(contest.id),
    );
    const completedContests = endedContests.filter(
        (contest) => !publishedResultIds.has(contest.id),
    );
    const primaryLiveContest = liveContests[0];

    return (
        <div className="space-y-6 pb-8">
            <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_0%,color-mix(in_srgb,var(--primary)_14%,transparent),transparent_38%)]" />
                <div className="pointer-events-none absolute -right-12 -top-20 size-56 rounded-full border border-primary/10 motion-safe:animate-[spin_24s_linear_infinite]" />
                <header className="relative flex flex-col gap-5 px-6 py-7 sm:flex-row sm:items-end sm:justify-between sm:px-8">
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            {dateFormatter.format(new Date()).split(",")[0]}
                        </p>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Welcome back{firstName ? `, ${firstName}` : ""}
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            You have{" "}
                            <span className="font-semibold text-foreground">
                                {liveContests.length} contests live
                            </span>{" "}
                            across {contests.length} registrations.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <Link href="/student/teams">
                                <Users /> My teams
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/student/contest">
                                <Compass /> Browse contests
                            </Link>
                        </Button>
                    </div>
                </header>
                {primaryLiveContest && (
                    <div className="relative border-t border-primary/15 bg-primary/[0.045] px-6 py-5 sm:px-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <span className="relative mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <span className="absolute inset-0 rounded-full bg-primary/15 motion-safe:animate-ping" />
                                    <CircleAlert className="relative size-4" />
                                </span>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                                        Needs attention
                                    </p>
                                    <h2 className="mt-1 font-semibold">
                                        {primaryLiveContest.name} is live
                                    </h2>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Open the contest to view or continue your session.
                                    </p>
                                </div>
                            </div>
                            <Button asChild size="sm" className="sm:shrink-0">
                                <Link href={`/student/contest/${primaryLiveContest.id}`}>
                                    Open contest <ArrowRight />
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </section>

            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
                <div className="space-y-6">
                    <Card className="gap-0 border-border/60 py-0 shadow-sm">
                        <CardHeader className="border-b px-5 py-5 sm:px-6">
                            <CardTitle>Registered contests</CardTitle>
                            <CardDescription>
                                Only contests you have registered for appear here.
                            </CardDescription>
                            <CardAction>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href="/student/contest">
                                        View all <ArrowRight />
                                    </Link>
                                </Button>
                            </CardAction>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-5">
                            {contestsQuery.isError ? (
                                <EmptyPanel
                                    icon={Trophy}
                                    title="Couldn’t load contests"
                                    description="Refresh the page to try again."
                                />
                            ) : (
                                <Tabs
                                    defaultValue={
                                        liveContests.length
                                            ? "live"
                                            : upcomingContests.length
                                              ? "upcoming"
                                              : "completed"
                                    }
                                >
                                    <TabsList className="mb-5 grid h-auto w-full grid-cols-3">
                                        <TabsTrigger value="live" className="gap-2 py-2.5">
                                            Live{" "}
                                            <span className="rounded-full bg-background/70 px-1.5 text-[10px]">
                                                {liveContests.length}
                                            </span>
                                        </TabsTrigger>
                                        <TabsTrigger value="upcoming" className="gap-2 py-2.5">
                                            Upcoming{" "}
                                            <span className="rounded-full bg-background/70 px-1.5 text-[10px]">
                                                {upcomingContests.length}
                                            </span>
                                        </TabsTrigger>
                                        <TabsTrigger value="completed" className="gap-2 py-2.5">
                                            Completed{" "}
                                            <span className="rounded-full bg-background/70 px-1.5 text-[10px]">
                                                {completedContests.length}
                                            </span>
                                        </TabsTrigger>
                                    </TabsList>
                                    <ContestTab
                                        value="live"
                                        contests={liveContests}
                                        emptyTitle="No live contests"
                                        emptyDescription="Your active registered contests will appear here."
                                    />
                                    <ContestTab
                                        value="upcoming"
                                        contests={upcomingContests}
                                        emptyTitle="No upcoming contests"
                                        emptyDescription="Registered contests that have not started will appear here."
                                    />
                                    <ContestTab
                                        value="completed"
                                        contests={completedContests}
                                        emptyTitle="No completed contests"
                                        emptyDescription="Finished contests will remain here for review."
                                    />
                                </Tabs>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="gap-0 border-border/60 py-0 shadow-sm">
                        <CardHeader className="border-b px-5 py-5 sm:px-6">
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="size-4 text-primary" /> Published results
                            </CardTitle>
                            <CardDescription>
                                Review scores and submissions from completed contests.
                            </CardDescription>
                            {resultsPublishedContests.length > 0 && (
                                <CardAction>
                                    <Badge variant="secondary">
                                        {resultsPublishedContests.length}
                                    </Badge>
                                </CardAction>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-3 p-4 sm:p-5">
                            {resultsPublishedContests.length ? (
                                resultsPublishedContests
                                    .slice(0, 5)
                                    .map((contest) => (
                                        <ContestRow
                                            key={contest.id}
                                            contest={contest}
                                            resultsPublished
                                        />
                                    ))
                            ) : (
                                <EmptyPanel
                                    icon={Trophy}
                                    title="No published results"
                                    description="Results will appear here after an instructor publishes them."
                                    compact
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="gap-0 border-border/60 py-0 shadow-sm">
                        <CardHeader className="border-b px-5 py-5">
                            <CardTitle className="text-base">At a glance</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y px-5 py-2">
                            <GlanceRow
                                icon={Trophy}
                                label="Registered contests"
                                value={contests.length}
                            />
                            <GlanceRow icon={Users} label="My teams" value={teams.length} />
                            <GlanceRow
                                icon={Inbox}
                                label="Pending invitations"
                                value={invitations.length}
                            />
                        </CardContent>
                    </Card>

                    <Card className="gap-0 border-border/60 py-0 shadow-sm">
                        <CardHeader className="border-b px-5 py-5">
                            <CardTitle className="flex items-center gap-2">
                                <Inbox className="size-4 text-primary" /> Invitations
                            </CardTitle>
                            <CardDescription>
                                Contest teams waiting for your response.
                            </CardDescription>
                            {invitations.length > 0 && (
                                <CardAction>
                                    <Badge>{invitations.length}</Badge>
                                </CardAction>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-3 p-4">
                            {invitationsQuery.isError ? (
                                <EmptyPanel
                                    icon={Inbox}
                                    title="Couldn’t load invitations"
                                    description="Refresh the page to try again."
                                    compact
                                />
                            ) : invitations.length ? (
                                invitations
                                    .slice(0, 2)
                                    .map((invitation) => (
                                        <InvitationRow
                                            key={invitation.id}
                                            invitation={invitation}
                                        />
                                    ))
                            ) : (
                                <EmptyPanel
                                    icon={Check}
                                    title="You’re all caught up"
                                    description="New contest invitations will appear here."
                                    compact
                                />
                            )}
                            {invitations.length > 2 && (
                                <Button asChild variant="ghost" className="w-full">
                                    <Link href="/invitation">
                                        View all invitations <ArrowRight />
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function ContestTab({
    value,
    contests,
    emptyTitle,
    emptyDescription,
    resultsPublished = false,
}: {
    value: string;
    contests: StudentContestAvailableResponse[];
    emptyTitle: string;
    emptyDescription: string;
    resultsPublished?: boolean;
}) {
    return (
        <TabsContent value={value} className="space-y-3">
            {contests.length ? (
                contests
                    .slice(0, 5)
                    .map((contest) => (
                        <ContestRow
                            key={contest.id}
                            contest={contest}
                            resultsPublished={resultsPublished}
                        />
                    ))
            ) : (
                <EmptyPanel
                    icon={Trophy}
                    title={emptyTitle}
                    description={emptyDescription}
                    compact
                />
            )}
        </TabsContent>
    );
}

function GlanceRow({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Trophy;
    label: string;
    value: number;
}) {
    return (
        <div className="flex items-center gap-3 py-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
            </div>
            <span className="flex-1 text-sm text-muted-foreground">{label}</span>
            <span className="text-lg font-semibold tabular-nums">{value}</span>
        </div>
    );
}

function EmptyPanel({
    icon: Icon,
    title,
    description,
    action,
    compact = false,
}: {
    icon: typeof Trophy;
    title: string;
    description: string;
    action?: { label: string; href: string };
    compact?: boolean;
}) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center rounded-xl border border-dashed px-5 text-center",
                compact ? "min-h-40" : "min-h-64",
            )}
        >
            <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Icon className="size-4" />
            </div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">{description}</p>
            {action && (
                <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href={action.href}>{action.label}</Link>
                </Button>
            )}
        </div>
    );
}

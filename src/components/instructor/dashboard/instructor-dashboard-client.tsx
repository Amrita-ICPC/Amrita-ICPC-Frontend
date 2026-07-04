"use client";

import {
    AlertCircle,
    ArrowRight,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    FileQuestion,
    Layers3,
    Radio,
    ShieldCheck,
    Trophy,
    Users,
} from "lucide-react";
import Link from "next/link";

import { useGetInstructorDashboardApiV1InstructorsDashboardGet } from "@/api/generated/instructors/instructors";
import type {
    InstructorDashboardAttentionItem,
    InstructorDashboardAttentionItemType,
    InstructorDashboardContest,
} from "@/api/generated/model";
import { ContestRunStatus } from "@/api/generated/model";
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

type DashboardAudience = "instructor" | "admin";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
});

const attentionConfig: Record<
    InstructorDashboardAttentionItemType,
    { icon: typeof AlertCircle; label: string; href: (id: string) => string }
> = {
    TEAM_APPROVAL: {
        icon: Users,
        label: "Review teams",
        href: (id) => `/contest/${id}`,
    },
    MISSING_QUESTIONS: {
        icon: FileQuestion,
        label: "Add questions",
        href: (id) => `/contest/${id}/import`,
    },
    PENDING_EVALUATION: {
        icon: ClipboardCheck,
        label: "Open evaluation",
        href: (id) => `/contest/${id}/evaluate`,
    },
    RESULTS_READY: {
        icon: Trophy,
        label: "Review results",
        href: (id) => `/contest/${id}/evaluate`,
    },
};

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-48 rounded-2xl" />
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(310px,0.75fr)]">
                <div className="space-y-6">
                    <Skeleton className="h-64 rounded-xl" />
                    <Skeleton className="h-96 rounded-xl" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-72 rounded-xl" />
                    <Skeleton className="h-72 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

function ContestRow({ contest }: { contest: InstructorDashboardContest }) {
    const isLive = contest.run_status === ContestRunStatus.LIVE;

    return (
        <Link
            href={`/contest/${contest.id}`}
            className="group grid gap-4 rounded-xl border border-border/60 bg-background/60 p-4 transition-all hover:border-primary/35 hover:bg-accent/35 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
        >
            <div className="flex size-11 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-primary/10 text-primary">
                {contest.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={contest.image} alt="" className="size-full object-cover" />
                ) : (
                    <Trophy className="size-4" />
                )}
            </div>
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-semibold group-hover:text-primary">
                        {contest.name}
                    </h3>
                    {isLive && (
                        <Badge className="border-transparent bg-success/10 text-[10px] text-success hover:bg-success/10">
                            <span className="mr-1 size-1.5 animate-pulse rounded-full bg-current" />{" "}
                            Live
                        </Badge>
                    )}
                    {contest.created_by_current_user && (
                        <Badge variant="outline" className="text-[10px]">
                            Owner
                        </Badge>
                    )}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" />
                        {dateFormatter.format(new Date(contest.start_time))}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <FileQuestion className="size-3.5" />
                        {contest.question_count} questions
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Users className="size-3.5" />
                        {contest.registered_teams_count} teams
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Layers3 className="size-3.5" />
                        {contest.total_submissions} submissions
                    </span>
                </div>
            </div>
            <Button variant={isLive ? "default" : "outline"} size="sm" className="w-full sm:w-auto">
                {isLive ? "Monitor" : "Manage"}
                <ArrowRight />
            </Button>
        </Link>
    );
}

function AttentionRow({ item }: { item: InstructorDashboardAttentionItem }) {
    const config = attentionConfig[item.type];
    const Icon = config.icon;

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-warning/20 bg-warning/[0.045] p-4 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                    <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold">{item.contest_name}</p>
                        {item.count !== null && item.count !== undefined && (
                            <Badge variant="secondary" className="text-[10px]">
                                {item.count}
                            </Badge>
                        )}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.message}</p>
                </div>
            </div>
            <Button
                asChild
                variant="outline"
                size="sm"
                className="shrink-0 border-warning/25 bg-background/60"
            >
                <Link href={config.href(item.contest_id)}>
                    {config.label}
                    <ArrowRight />
                </Link>
            </Button>
        </div>
    );
}

/** @instructor @admin Shared operational dashboard backed by the scoped instructor API. */
export function InstructorDashboardClient({
    firstName,
    audience,
}: {
    firstName: string;
    audience: DashboardAudience;
}) {
    const { data, isLoading, isError, refetch } =
        useGetInstructorDashboardApiV1InstructorsDashboardGet({
            contest_limit: 5,
            bank_limit: 4,
        });

    if (isLoading) return <DashboardSkeleton />;

    const dashboard = data?.data;
    if (isError || !dashboard) {
        return (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
                <AlertCircle className="mb-4 size-8 text-destructive" />
                <h1 className="text-lg font-semibold">Dashboard unavailable</h1>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    We couldn&apos;t load your dashboard overview.
                </p>
                <Button className="mt-5" variant="outline" onClick={() => refetch()}>
                    Try again
                </Button>
            </div>
        );
    }

    const { summary, contests } = dashboard;
    const live = contests.live ?? [];
    const upcoming = contests.upcoming ?? [];
    const completed = contests.completed ?? [];
    const attention = dashboard.needs_attention ?? [];
    const banks = dashboard.recent_banks ?? [];
    const roleLabel = audience === "admin" ? "Admin overview" : "Instructor overview";

    return (
        <div className="space-y-6 pb-8">
            <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_0%,color-mix(in_srgb,var(--primary)_15%,transparent),transparent_38%)]" />
                <div className="pointer-events-none absolute -right-10 -top-24 size-60 rounded-full border border-primary/10 motion-safe:animate-[spin_28s_linear_infinite]" />
                <div className="relative flex flex-col gap-6 px-6 py-7 sm:flex-row sm:items-end sm:justify-between sm:px-8">
                    <div>
                        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                            {audience === "admin" ? (
                                <ShieldCheck className="size-3.5" />
                            ) : (
                                <ClipboardCheck className="size-3.5" />
                            )}
                            {roleLabel}
                        </p>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Welcome back{firstName ? `, ${firstName}` : ""}
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">
                                {summary.live_contests} contests live
                            </span>{" "}
                            and {attention.length} items need attention.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <Link href="/banks">
                                <BookOpen />
                                Question banks
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/contest">
                                <Trophy />
                                Manage contests
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(310px,0.75fr)]">
                <div className="space-y-6">
                    <Card className="gap-0 border-warning/20 py-0 shadow-sm">
                        <CardHeader className="border-b border-warning/15 px-5 py-5 sm:px-6">
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="size-4 text-warning" />
                                Needs attention
                            </CardTitle>
                            <CardDescription>
                                Prioritized actions across the contests you can manage.
                            </CardDescription>
                            {attention.length > 0 && (
                                <CardAction>
                                    <Badge className="bg-warning text-warning-foreground">
                                        {attention.length}
                                    </Badge>
                                </CardAction>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-3 p-4 sm:p-5">
                            {attention.length ? (
                                attention
                                    .slice(0, 5)
                                    .map((item, index) => (
                                        <AttentionRow
                                            key={`${item.type}-${item.contest_id}-${index}`}
                                            item={item}
                                        />
                                    ))
                            ) : (
                                <EmptyState
                                    icon={CheckCircle2}
                                    title="Nothing needs attention"
                                    description="Your contests, evaluations, and team approvals are up to date."
                                />
                            )}
                        </CardContent>
                    </Card>

                    <Card className="gap-0 border-border/60 py-0 shadow-sm">
                        <CardHeader className="border-b px-5 py-5 sm:px-6">
                            <CardTitle>My contests</CardTitle>
                            <CardDescription>
                                Monitor and manage contests by their current run state.
                            </CardDescription>
                            <CardAction>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href="/contest">
                                        View all
                                        <ArrowRight />
                                    </Link>
                                </Button>
                            </CardAction>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-5">
                            <Tabs
                                defaultValue={
                                    live.length
                                        ? "live"
                                        : upcoming.length
                                          ? "upcoming"
                                          : "completed"
                                }
                            >
                                <TabsList className="mb-5 grid h-auto w-full grid-cols-3">
                                    <TabsTrigger value="live" className="gap-2 py-2.5">
                                        Live
                                        <Count value={live.length} />
                                    </TabsTrigger>
                                    <TabsTrigger value="upcoming" className="gap-2 py-2.5">
                                        Upcoming
                                        <Count value={upcoming.length} />
                                    </TabsTrigger>
                                    <TabsTrigger value="completed" className="gap-2 py-2.5">
                                        Completed
                                        <Count value={completed.length} />
                                    </TabsTrigger>
                                </TabsList>
                                <ContestTab value="live" contests={live} title="No live contests" />
                                <ContestTab
                                    value="upcoming"
                                    contests={upcoming}
                                    title="No upcoming contests"
                                />
                                <ContestTab
                                    value="completed"
                                    contests={completed}
                                    title="No completed contests"
                                />
                            </Tabs>
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
                                icon={Radio}
                                label="Live contests"
                                value={summary.live_contests}
                            />
                            <GlanceRow
                                icon={CalendarDays}
                                label="Upcoming"
                                value={summary.upcoming_contests}
                            />
                            <GlanceRow
                                icon={Users}
                                label="Team approvals"
                                value={summary.pending_team_approvals}
                            />
                            <GlanceRow
                                icon={ClipboardCheck}
                                label="Pending evaluations"
                                value={summary.pending_evaluations}
                            />
                            <GlanceRow
                                icon={Trophy}
                                label="Results ready"
                                value={summary.results_ready_to_publish}
                            />
                            <GlanceRow
                                icon={BookOpen}
                                label="Question banks"
                                value={summary.question_banks}
                            />
                        </CardContent>
                    </Card>

                    <Card className="gap-0 border-border/60 py-0 shadow-sm">
                        <CardHeader className="border-b px-5 py-5">
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="size-4 text-primary" />
                                Recent question banks
                            </CardTitle>
                            <CardDescription>
                                Recently updated banks available to you.
                            </CardDescription>
                            <CardAction>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href="/banks">View all</Link>
                                </Button>
                            </CardAction>
                        </CardHeader>
                        <CardContent className="space-y-2 p-4">
                            {banks.length ? (
                                banks.map((bank) => (
                                    <Link
                                        key={bank.id}
                                        href={`/banks/${bank.id}`}
                                        className="group flex items-center gap-3 rounded-lg border border-border/60 bg-background/60 p-3 transition-colors hover:border-primary/30 hover:bg-accent/40"
                                    >
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <BookOpen className="size-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium group-hover:text-primary">
                                                {bank.name}
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {bank.question_count} questions ·{" "}
                                                {bank.is_owner ? "Owned by you" : "Shared"}
                                            </p>
                                        </div>
                                        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                                    </Link>
                                ))
                            ) : (
                                <EmptyState
                                    icon={BookOpen}
                                    title="No question banks"
                                    description="Banks you own or can access will appear here."
                                    compact
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function Count({ value }: { value: number }) {
    return (
        <span className="rounded-full bg-background/70 px-1.5 text-[10px] tabular-nums">
            {value}
        </span>
    );
}

function ContestTab({
    value,
    contests,
    title,
}: {
    value: string;
    contests: InstructorDashboardContest[];
    title: string;
}) {
    return (
        <TabsContent value={value} className="space-y-3">
            {contests.length ? (
                contests.map((contest) => <ContestRow key={contest.id} contest={contest} />)
            ) : (
                <EmptyState
                    icon={Trophy}
                    title={title}
                    description="Contests in this state will appear here."
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
        <div className="flex items-center gap-3 py-3.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
            </div>
            <span className="flex-1 text-sm text-muted-foreground">{label}</span>
            <span className="text-lg font-semibold tabular-nums">{value}</span>
        </div>
    );
}

function EmptyState({
    icon: Icon,
    title,
    description,
    compact = false,
}: {
    icon: typeof Trophy;
    title: string;
    description: string;
    compact?: boolean;
}) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center rounded-xl border border-dashed px-5 text-center",
                compact ? "min-h-36" : "min-h-44",
            )}
        >
            <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Icon className="size-4" />
            </div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
    );
}

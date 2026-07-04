"use client";

import {
    Activity,
    AlertCircle,
    ArrowRight,
    Calendar,
    CheckCircle2,
    Clock,
    Shield,
    Sparkles,
    Trophy,
    Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
    useGetStudentContestByIdApiV1StudentsContestsContestIdGet,
    useGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGet,
    useStartContestSessionApiV1StudentsContestsContestIdStartPost,
} from "@/api/generated/students/students";
import { AsyncStateHandler } from "@/components/shared/async-state-handler";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";

import { ContestTeamCards } from "./contest-team-cards";
import { StudentContestDetailSkeleton } from "./student-contest-skeleton";

const RUN_STATUS_STYLES: Record<string, { dot: string; label: string }> = {
    LIVE: { dot: "bg-success", label: "Live Now" },
    UPCOMING: { dot: "bg-warning", label: "Upcoming" },
    ENDED: { dot: "bg-destructive", label: "Ended" },
};

function StatusPill({ dot, label, glow = false }: { dot: string; label: string; glow?: boolean }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-100 shadow-sm backdrop-blur-md">
            <span
                className={cn("size-2 rounded-full", dot, glow && "shadow-[0_0_9px_currentColor]")}
            />
            {label}
        </span>
    );
}

function QuickInfoCard({
    icon: Icon,
    label,
    value,
    color = "primary",
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color?: "primary" | "emerald" | "amber" | "rose" | "sky" | "violet" | "indigo";
}) {
    const colorStyles = {
        primary: "text-primary bg-primary/10",
        emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
        amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
        rose: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
        sky: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
        violet: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
        indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
    };

    return (
        <div className="flex flex-col gap-2 p-4 rounded-xl border border-border/50 bg-muted/40 hover:bg-muted/70 transition-all duration-200 group">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <div
                    className={cn(
                        "p-1.5 rounded-lg transition-all group-hover:scale-110",
                        colorStyles[color],
                    )}
                >
                    <Icon className="w-3.5 h-3.5" />
                </div>
                {label}
            </span>
            <span className="font-bold text-sm text-foreground leading-none">{value}</span>
        </div>
    );
}

function ContestRegistrationProgress({
    contest,
}: {
    contest: { teams_count?: number; max_teams?: number | null };
}) {
    const teamCount = contest.teams_count ?? 0;
    const maxTeams = contest.max_teams;
    const hasLimit = maxTeams !== null && maxTeams !== undefined && maxTeams > 0;
    const fillPercentage = hasLimit ? Math.min(100, Math.max(0, (teamCount / maxTeams) * 100)) : 0;
    const slotsRemaining = hasLimit ? Math.max(0, maxTeams - teamCount) : 0;

    return (
        <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-amber-500" />
                    Contest Progress
                </span>
                {hasLimit ? (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                        {slotsRemaining} Slots Left
                    </span>
                ) : (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-success">
                        Open Slots
                    </span>
                )}
            </div>

            <div className="mt-3 flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-foreground tracking-tight">
                        {teamCount}
                    </span>
                    <span className="text-sm font-bold text-muted-foreground">
                        {hasLimit ? `/ ${maxTeams} Teams` : "Teams Registered"}
                    </span>
                </div>
                {hasLimit && (
                    <span className="text-xs font-bold text-muted-foreground">
                        {Math.round(fillPercentage)}% Filled
                    </span>
                )}
            </div>

            {hasLimit && (
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full border border-border/50 bg-muted">
                    <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${fillPercentage}%` }}
                    />
                </div>
            )}
        </div>
    );
}

function TimelineItem({
    label,
    time,
    status,
    isLast = false,
    isCompleted = false,
    isActive = false,
    children,
}: {
    label: string;
    time: string;
    status: string;
    isLast?: boolean;
    isCompleted?: boolean;
    isActive?: boolean;
    children?: React.ReactNode;
}) {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div
                    className={cn(
                        "h-4 w-4 rounded-full border-2 transition-all duration-300 z-10",
                        isCompleted
                            ? "bg-primary border-primary shadow-[0_0_10px_rgba(var(--primary),0.4)]"
                            : isActive
                              ? "bg-background border-primary ring-4 ring-primary/10 animate-pulse"
                              : "bg-background border-muted-foreground/30",
                    )}
                />
                {!isLast && (
                    <div
                        className={cn(
                            "w-[2px] flex-1 my-1 rounded-full",
                            isCompleted ? "bg-primary/40" : "bg-muted-foreground/10",
                        )}
                    />
                )}
            </div>
            <div className={cn("flex-1 pb-8 flex justify-between items-start", isLast && "pb-0")}>
                <div className="flex flex-col gap-1">
                    <p
                        className={cn(
                            "text-sm font-bold tracking-tight",
                            isCompleted || isActive ? "text-foreground" : "text-muted-foreground",
                        )}
                    >
                        {label}
                    </p>
                    <p className="text-xs text-muted-foreground font-semibold tabular-nums">
                        {time}
                    </p>
                    {children}
                </div>
                <Badge
                    variant={isCompleted ? "secondary" : "outline"}
                    className={cn(
                        "text-[9px] font-extrabold uppercase tracking-widest",
                        isCompleted
                            ? "bg-success/10 text-success border-transparent dark:bg-success/20"
                            : "text-muted-foreground/70",
                    )}
                >
                    {status}
                </Badge>
            </div>
        </div>
    );
}

function fmt(dateStr: string | null | undefined) {
    if (!dateStr) return "Not Scheduled";
    return new Date(dateStr).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

const TimeBlock = ({ value, label }: { value: string; label: string }) => (
    <div className="flex flex-col items-center justify-center bg-card border border-border/50 rounded-xl px-3 py-2 min-w-[56px] shadow-sm transition-all duration-200 hover:border-primary/20">
        <span className="text-xl font-extrabold text-foreground tracking-tight tabular-nums">
            {value}
        </span>
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
            {label}
        </span>
    </div>
);

function CountdownTimer({ targetDate, label }: { targetDate: string; label: string }) {
    const [timeLeft, setTimeLeft] = useState<{
        days?: string;
        hours: string;
        minutes: string;
        seconds: string;
    } | null>(null);

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date().getTime();
            const target = new Date(targetDate).getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft({ hours: "00", minutes: "00", seconds: "00" });
                return;
            }

            const totalHours = Math.floor(diff / 3_600_000);
            const m = Math.floor((diff % 3_600_000) / 60_000);
            const s = Math.floor((diff % 60_000) / 1000);

            if (totalHours >= 24) {
                const days = Math.floor(totalHours / 24);
                const hours = totalHours % 24;
                setTimeLeft({
                    days: String(days).padStart(2, "0"),
                    hours: String(hours).padStart(2, "0"),
                    minutes: String(m).padStart(2, "0"),
                    seconds: String(s).padStart(2, "0"),
                });
            } else {
                setTimeLeft({
                    hours: String(totalHours).padStart(2, "0"),
                    minutes: String(m).padStart(2, "0"),
                    seconds: String(s).padStart(2, "0"),
                });
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) return null;

    return (
        <div className="flex flex-col gap-3 items-center p-4 bg-muted/30 rounded-2xl border border-border/40 backdrop-blur-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
                {label}
            </span>
            <div className="flex items-center gap-1.5">
                {timeLeft.days !== undefined && (
                    <>
                        <TimeBlock value={timeLeft.days} label="Days" />
                        <span className="text-muted-foreground/45 font-semibold text-lg">:</span>
                    </>
                )}
                <TimeBlock value={timeLeft.hours} label="Hrs" />
                <span className="text-muted-foreground/45 font-semibold text-lg">:</span>
                <TimeBlock value={timeLeft.minutes} label="Min" />
                <span className="text-muted-foreground/45 font-semibold text-lg">:</span>
                <TimeBlock value={timeLeft.seconds} label="Sec" />
            </div>
        </div>
    );
}

interface StudentContestDetailClientProps {
    contestId: string;
}

export function StudentContestDetailClient({ contestId }: StudentContestDetailClientProps) {
    const router = useRouter();
    const {
        data: contestRes,
        isLoading: isContestLoading,
        isError: isContestError,
        error: contestError,
        refetch: refetchContest,
    } = useGetStudentContestByIdApiV1StudentsContestsContestIdGet(contestId);

    const {
        data: statusRes,
        isLoading: isStatusLoading,
        isError: isStatusError,
        error: statusError,
        refetch: refetchStatus,
    } = useGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGet(contestId);

    const contest = contestRes?.data;
    const participation = statusRes?.data;
    const isLoading = isContestLoading || isStatusLoading;
    const isError = isContestError || isStatusError;
    const error = contestError || statusError;

    const startMutation = useStartContestSessionApiV1StudentsContestsContestIdStartPost({
        mutation: {
            onSuccess: () => {
                toast.success("Contest session started successfully");
                router.push(`/student/contest/${contestId}/session`);
            },
            onError: (err: any) => {
                toast.error(
                    err.response?.data?.message || err.message || "Failed to start contest session",
                );
            },
        },
    });

    const handleStartContest = () => {
        startMutation.mutate({ contestId });
    };

    const duration =
        contest && contest.end_time
            ? (() => {
                  const ms =
                      new Date(contest.end_time).getTime() - new Date(contest.start_time).getTime();
                  const h = Math.floor(ms / 3_600_000);
                  const m = Math.floor((ms % 3_600_000) / 60_000);
                  return h > 0 ? `${h}h ${m > 0 ? m + "m" : ""}`.trim() : `${m}m`;
              })()
            : "Not Scheduled";

    const canStart = !!participation?.session?.can_start;
    const effectiveReason = participation?.session?.reason;
    const effectiveRunStatus = contest?.run_status || "UPCOMING";

    return (
        <AsyncStateHandler
            isLoading={isLoading}
            isError={isError || (!isLoading && !contest)}
            error={error}
            onRetry={() => {
                refetchContest();
                refetchStatus();
            }}
            errorTitle="Contest Not Found"
            loadingComponent={<StudentContestDetailSkeleton />}
        >
            {contest && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (Hero & Content) */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="overflow-hidden border-border/60 shadow-sm transition-all p-0 py-0 gap-0">
                            {/* Banner Section — same visual language used across contest cards */}
                            <div className="relative flex min-h-[220px] flex-col justify-end overflow-hidden border-b border-primary/20 bg-[linear-gradient(118deg,color-mix(in_srgb,var(--primary)_65%,#0b1220),color-mix(in_srgb,var(--primary)_18%,#0b1220)_82%)] px-8 py-7">
                                {contest.image ? (
                                    <>
                                        <img
                                            src={contest.image}
                                            alt={contest.name}
                                            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                                        />
                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
                                    </>
                                ) : (
                                    <>
                                        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_center,white_1px,transparent_1.3px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
                                        <div className="pointer-events-none absolute -left-10 -top-24 size-72 rounded-full bg-primary/35 blur-3xl" />
                                    </>
                                )}

                                <div className="relative flex items-center justify-between gap-3">
                                    <StatusPill
                                        {...(RUN_STATUS_STYLES[contest.run_status ?? "UPCOMING"] ??
                                            RUN_STATUS_STYLES.UPCOMING)}
                                        glow
                                    />
                                </div>

                                <div className="relative mt-8">
                                    <h1 className="text-3xl font-extrabold tracking-tight text-white">
                                        {contest.name}
                                    </h1>
                                    {contest.description && (
                                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
                                            {contest.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <CardContent className="px-6 py-6 space-y-6">
                                {/* Mini Cards / Quick Info */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <QuickInfoCard
                                        icon={Users}
                                        label="Team Size"
                                        color="sky"
                                        value={
                                            contest.min_team_size === contest.max_team_size
                                                ? `${contest.min_team_size} Members`
                                                : `${contest.min_team_size} - ${contest.max_team_size} Members`
                                        }
                                    />

                                    <QuickInfoCard
                                        icon={Clock}
                                        label="Duration"
                                        color="amber"
                                        value={duration}
                                    />

                                    {contest.duration !== null &&
                                        contest.duration !== undefined && (
                                            <QuickInfoCard
                                                icon={Clock}
                                                label="Session Limit"
                                                color="indigo"
                                                value={(() => {
                                                    const h = Math.floor(contest.duration / 3600);
                                                    const m = Math.floor(
                                                        (contest.duration % 3600) / 60,
                                                    );
                                                    return h > 0
                                                        ? `${h}h ${m > 0 ? m + "m" : ""}`.trim()
                                                        : `${m}m`;
                                                })()}
                                            />
                                        )}

                                    {contest.contest_mode.toLowerCase() === "team" &&
                                        contest.participation_type && (
                                            <QuickInfoCard
                                                icon={Users}
                                                label="Participation Type"
                                                color="violet"
                                                value={contest.participation_type
                                                    .replace(/_/g, " ")
                                                    .toLowerCase()}
                                            />
                                        )}
                                </div>

                                {/* Contest-wide registration progress — moved in from the sidebar */}
                                <ContestRegistrationProgress contest={contest} />
                            </CardContent>
                        </Card>

                        {/* Timeline Card */}
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold tracking-tight">
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-8 pb-8">
                                <div className="mt-2">
                                    <TimelineItem
                                        label="Registration Opens"
                                        time={fmt(contest.registration_start)}
                                        status={
                                            new Date() > new Date(contest.registration_start || "")
                                                ? "Completed"
                                                : "Upcoming"
                                        }
                                        isCompleted={
                                            new Date() > new Date(contest.registration_start || "")
                                        }
                                        isActive={
                                            new Date() >=
                                                new Date(contest.registration_start || "") &&
                                            new Date() <= new Date(contest.registration_end || "")
                                        }
                                    />
                                    <TimelineItem
                                        label="Registration Closes"
                                        time={fmt(contest.registration_end)}
                                        status={
                                            new Date() > new Date(contest.registration_end || "")
                                                ? "Completed"
                                                : "Upcoming"
                                        }
                                        isCompleted={
                                            new Date() > new Date(contest.registration_end || "")
                                        }
                                    />
                                    <TimelineItem
                                        label="Contest Starts"
                                        time={fmt(contest.start_time)}
                                        status={
                                            new Date() > new Date(contest.start_time)
                                                ? "Completed"
                                                : "Upcoming"
                                        }
                                        isCompleted={new Date() > new Date(contest.start_time)}
                                        isActive={
                                            new Date() >= new Date(contest.start_time) &&
                                            (contest.end_time
                                                ? new Date() <= new Date(contest.end_time)
                                                : true)
                                        }
                                    />
                                    <TimelineItem
                                        label="Contest Ends"
                                        time={fmt(contest.end_time)}
                                        status={
                                            contest.end_time &&
                                            new Date() > new Date(contest.end_time)
                                                ? "Completed"
                                                : "Upcoming"
                                        }
                                        isCompleted={
                                            !!contest.end_time &&
                                            new Date() > new Date(contest.end_time)
                                        }
                                    />
                                    <TimelineItem
                                        label="Result Published"
                                        time={
                                            contest.results_published_at !== null &&
                                            contest.results_published_at !== undefined
                                                ? "Results are available"
                                                : "To be announced"
                                        }
                                        status={
                                            contest.results_published_at !== null &&
                                            contest.results_published_at !== undefined
                                                ? "Published"
                                                : "Not yet"
                                        }
                                        isCompleted={
                                            contest.results_published_at !== null &&
                                            contest.results_published_at !== undefined
                                        }
                                        isLast
                                    >
                                        {contest.results_published_at !== null &&
                                            contest.results_published_at !== undefined && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 font-semibold"
                                                    >
                                                        <Link
                                                            href={`/student/contest/${contestId}/results`}
                                                        >
                                                            Result
                                                        </Link>
                                                    </Button>
                                                    {contest.show_leaderboard && (
                                                        <Button
                                                            asChild
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 font-semibold"
                                                        >
                                                            <Link
                                                                href={`/student/contest/${contestId}/results/leaderboard`}
                                                            >
                                                                <Trophy className="h-3.5 w-3.5" />
                                                                Leaderboard
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                    </TimelineItem>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rules Card */}
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold tracking-tight">
                                    Rules
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 pb-6">
                                {contest.rules ? (
                                    <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {contest.rules}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed rounded-lg border-border/60 bg-muted/5">
                                        <Shield className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                        <p className="text-xs text-muted-foreground font-medium">
                                            No specific rules provided for this contest.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column (Cards) */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Contest Action Card */}
                        {(() => {
                            const headerDetails = (() => {
                                if (isStatusLoading) {
                                    return {
                                        title: "Checking Status...",
                                        icon: Clock,
                                        iconClass: "text-muted-foreground animate-pulse",
                                        bgClass: "bg-muted/40 border-b border-border/50",
                                    };
                                }

                                if (effectiveRunStatus === "LIVE") {
                                    if (participation?.session?.already_started && canStart) {
                                        return {
                                            title: "Session in Progress",
                                            icon: Activity,
                                            iconClass: "text-primary animate-pulse",
                                            bgClass:
                                                "bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20",
                                        };
                                    }
                                    if (canStart) {
                                        return {
                                            title: "You're all set to go!",
                                            icon: Sparkles,
                                            iconClass: "text-primary animate-pulse",
                                            bgClass:
                                                "bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20",
                                        };
                                    } else {
                                        return {
                                            title: "Contest is Live",
                                            icon: Activity,
                                            iconClass: "text-destructive animate-pulse",
                                            bgClass:
                                                "bg-gradient-to-r from-destructive/10 to-warning/10 border-b border-destructive/20",
                                        };
                                    }
                                }

                                if (effectiveRunStatus === "UPCOMING") {
                                    const regStatus = participation?.registration_status?.status;
                                    if (regStatus === "APPROVED") {
                                        return {
                                            title: "You're Registered!",
                                            icon: CheckCircle2,
                                            iconClass: "text-info",
                                            bgClass:
                                                "bg-gradient-to-r from-info/10 to-info/5 border-b border-info/20",
                                        };
                                    } else if (regStatus === "PENDING_APPROVAL") {
                                        return {
                                            title: "Registration Pending",
                                            icon: Clock,
                                            iconClass: "text-warning animate-pulse",
                                            bgClass:
                                                "bg-gradient-to-r from-warning/10 to-warning/5 border-b border-warning/20",
                                        };
                                    } else {
                                        return {
                                            title: "Upcoming Contest",
                                            icon: Calendar,
                                            iconClass: "text-info",
                                            bgClass: "bg-muted/40 border-b border-border/50",
                                        };
                                    }
                                }

                                if (effectiveRunStatus === "ENDED") {
                                    return {
                                        title: "Contest Ended",
                                        icon: Trophy,
                                        iconClass: "text-muted-foreground/60",
                                        bgClass: "bg-muted/50 border-b border-border/50",
                                    };
                                }

                                return {
                                    title: "Contest Status",
                                    icon: Shield,
                                    iconClass: "text-primary",
                                    bgClass: "bg-muted/40 border-b border-border/50",
                                };
                            })();

                            const HeaderIcon = headerDetails.icon;

                            return (
                                <Card className="border-border/60 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                                    <CardHeader className={cn("py-3.5", headerDetails.bgClass)}>
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                                            <HeaderIcon
                                                className={cn(
                                                    "h-5 w-5 shrink-0",
                                                    headerDetails.iconClass,
                                                )}
                                            />
                                            {headerDetails.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4">
                                        {isStatusLoading ? (
                                            <div className="h-28 flex items-center justify-center text-xs text-muted-foreground">
                                                Loading status...
                                            </div>
                                        ) : (
                                            <>
                                                {/* Countdown Logic */}
                                                {effectiveRunStatus === "UPCOMING" && (
                                                    <CountdownTimer
                                                        targetDate={contest.start_time}
                                                        label="Starts In"
                                                    />
                                                )}
                                                {effectiveRunStatus === "LIVE" && (
                                                    <CountdownTimer
                                                        targetDate={contest.end_time ?? ""}
                                                        label="Time Remaining"
                                                    />
                                                )}
                                                {effectiveRunStatus === "ENDED" && (
                                                    <div className="space-y-4 w-full">
                                                        <div className="flex flex-col items-center justify-center p-5 bg-muted/40 rounded-2xl border border-border/50 text-muted-foreground text-center">
                                                            <Trophy className="h-8 w-8 mb-2 text-muted-foreground/50 animate-pulse" />
                                                            <span className="text-sm font-bold text-foreground">
                                                                Contest Closed
                                                            </span>
                                                            <span className="text-[11px] text-muted-foreground/80 mt-1 font-medium">
                                                                {contest.results_published_at !==
                                                                    null &&
                                                                contest.results_published_at !==
                                                                    undefined
                                                                    ? "Submissions are disabled. Results are now available."
                                                                    : "Submissions are disabled. Results will be published soon."}
                                                            </span>
                                                        </div>
                                                        {contest.results_published_at !== null &&
                                                            contest.results_published_at !==
                                                                undefined && (
                                                                <div className="flex flex-col gap-2 sm:flex-row">
                                                                    <Button
                                                                        asChild
                                                                        className="w-full h-11 font-bold shadow-md transition-all duration-300 flex items-center justify-center gap-2 group bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
                                                                    >
                                                                        <Link
                                                                            href={`/student/contest/${contestId}/results`}
                                                                        >
                                                                            Result
                                                                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                                                        </Link>
                                                                    </Button>
                                                                    {contest.show_leaderboard && (
                                                                        <Button
                                                                            asChild
                                                                            variant="outline"
                                                                            className="w-full h-11 font-bold shadow-sm transition-all duration-300 flex items-center justify-center gap-2 group"
                                                                        >
                                                                            <Link
                                                                                href={`/student/contest/${contestId}/results/leaderboard`}
                                                                            >
                                                                                <Trophy className="h-4 w-4" />
                                                                                Leaderboard
                                                                            </Link>
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            )}
                                                    </div>
                                                )}

                                                {/* Start/Resume Contest Button */}
                                                {effectiveRunStatus !== "ENDED" && (
                                                    <Button
                                                        className={cn(
                                                            "w-full h-11 font-bold shadow-md transition-all duration-300 flex items-center justify-center gap-2 group",
                                                            canStart
                                                                ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
                                                                : "bg-muted text-muted-foreground cursor-not-allowed border border-border/60",
                                                        )}
                                                        disabled={
                                                            !canStart || startMutation.isPending
                                                        }
                                                        onClick={handleStartContest}
                                                    >
                                                        {startMutation.isPending
                                                            ? "Loading..."
                                                            : participation?.session
                                                                    ?.already_started
                                                              ? "Resume Contest"
                                                              : "Start Contest"}
                                                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                                    </Button>
                                                )}

                                                {/* If start is blocked, explain why */}
                                                {!canStart && effectiveReason && (
                                                    <div className="flex gap-3 p-3.5 rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive dark:bg-destructive/10">
                                                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-xs font-bold leading-tight">
                                                                Access Blocked
                                                            </span>
                                                            <span className="text-[11px] text-destructive/80 leading-normal font-medium">
                                                                {effectiveReason}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })()}

                        {/* Team Status / Roster Cards */}
                        <ContestTeamCards
                            participation={participation}
                            isStatusLoading={isStatusLoading}
                            contest={contest}
                        />
                    </div>
                </div>
            )}
        </AsyncStateHandler>
    );
}

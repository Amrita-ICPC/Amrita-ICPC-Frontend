"use client";

import { useEffect, useState } from "react";
import {
    useStartContestSessionApiV1StudentsContestsContestIdStartPost,
    useGetStudentContestByIdApiV1StudentsContestsContestIdGet,
    useGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGet,
} from "@/api/generated/students/students";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Share2,
    Bookmark,
    Clock,
    Users,
    Shield,
    Laptop,
    AlertCircle,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    Activity,
    Calendar,
    Trophy,
} from "lucide-react";
import { AsyncStateHandler } from "@/components/shared/async-state-handler";
import { cn } from "@/lib/utils";
import { StudentContestDetailSkeleton } from "./student-contest-skeleton";
import { OverallRegistrationProgressCard, ContestTeamCards } from "./contest-team-cards";

const BANNERS = [
    { from: "#162d68", to: "#0c1a40", accent: "#6f97ff" }, // Primary Blue
    { from: "#0891b2", to: "#164e63", accent: "#a5f3fc" }, // Cyan
    { from: "#059669", to: "#064e3b", accent: "#a7f3d0" }, // Emerald
    { from: "#2563eb", to: "#1e3a8a", accent: "#bfdbfe" }, // Blue
    { from: "#4338ca", to: "#312e81", accent: "#c7d2fe" }, // Indigo
];

function hashIndex(id: string, len: number) {
    return id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % len;
}

function HeroFallbackBanner({ id, name }: { id: string; name: string }) {
    const b = BANNERS[hashIndex(id, BANNERS.length)];
    const bgId = `hero-grid-${id}`;

    return (
        <div
            className="absolute inset-0 h-full w-full flex flex-col items-center justify-center overflow-hidden"
            style={{ background: `linear-gradient(to bottom right, ${b.from}, ${b.to})` }}
        >
            <svg
                className="absolute inset-0 h-full w-full pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <pattern id={bgId} width="40" height="40" patternUnits="userSpaceOnUse">
                        <path
                            d="M 40 0 L 0 0 0 40"
                            fill="none"
                            stroke="white"
                            strokeWidth="1"
                            strokeOpacity="0.05"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${bgId})`} />
                <circle cx="15%" cy="20%" r="150" fill={b.accent} fillOpacity="0.1" />
                <circle cx="85%" cy="80%" r="200" fill={b.accent} fillOpacity="0.05" />
                <circle cx="50%" cy="120%" r="300" fill={b.accent} fillOpacity="0.05" />
            </svg>

            <div className="relative z-10 flex flex-col items-center text-center px-4 w-full">
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-white/60 mb-2">
                    Amrita ICPC
                </span>
                <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight line-clamp-1 max-w-4xl drop-shadow-md">
                    {name}
                </h2>
            </div>
        </div>
    );
}

const CONTEST_STATUS_STYLES: Record<
    string,
    { bg: string; dot: string; label: string; text: string }
> = {
    PUBLISHED: {
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        dot: "bg-emerald-500",
        label: "Published",
        text: "text-emerald-700 dark:text-emerald-400",
    },
    DRAFT: {
        bg: "bg-amber-50 dark:bg-amber-500/10",
        dot: "bg-amber-500",
        label: "Draft",
        text: "text-amber-700 dark:text-amber-400",
    },
    PAUSED: {
        bg: "bg-sky-50 dark:bg-sky-500/10",
        dot: "bg-sky-600",
        label: "Paused",
        text: "text-sky-700 dark:text-sky-400",
    },
    CANCELLED: {
        bg: "bg-red-50 dark:bg-red-500/10",
        dot: "bg-red-500",
        label: "Cancelled",
        text: "text-red-700 dark:text-red-400",
    },
};

const RUN_STATUS_STYLES: Record<string, { bg: string; text: string; label: string; glow: string }> =
    {
        LIVE: {
            bg: "bg-emerald-500",
            text: "text-white",
            label: "Live Now",
            glow: "shadow-[0_0_15px_rgba(16,185,129,0.5)]",
        },
        UPCOMING: {
            bg: "bg-primary",
            text: "text-primary-foreground",
            label: "Upcoming",
            glow: "shadow-[0_0_15px_rgba(22,45,104,0.3)] dark:shadow-[0_0_15px_rgba(111,151,255,0.3)]",
        },
        ENDED: {
            bg: "bg-slate-600",
            text: "text-white",
            label: "Ended",
            glow: "shadow-none",
        },
    };

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
        <div className="flex flex-col gap-2 p-4 rounded-xl border border-border/50 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all duration-200 group">
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

function TimelineItem({
    label,
    time,
    status,
    isLast = false,
    isCompleted = false,
    isActive = false,
}: {
    label: string;
    time: string;
    status: string;
    isLast?: boolean;
    isCompleted?: boolean;
    isActive?: boolean;
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
                </div>
                <Badge
                    variant={isCompleted ? "secondary" : "outline"}
                    className={cn(
                        "text-[9px] font-extrabold uppercase tracking-widest",
                        isCompleted
                            ? "bg-emerald-500/10 text-emerald-600 border-transparent dark:bg-emerald-500/20 dark:text-emerald-400"
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
        <div className="flex flex-col gap-3 items-center p-4 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-border/40 backdrop-blur-sm">
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

    const cStatus = contest
        ? (CONTEST_STATUS_STYLES[contest.status as string] ?? CONTEST_STATUS_STYLES.DRAFT)
        : CONTEST_STATUS_STYLES.DRAFT;

    const rStatus = contest
        ? (RUN_STATUS_STYLES[contest.run_status ?? "UPCOMING"] ?? RUN_STATUS_STYLES.UPCOMING)
        : RUN_STATUS_STYLES.UPCOMING;

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
                        <Card className="overflow-hidden border-border/60 shadow-sm transition-all p-0 py-0">
                            {/* Banner Section */}
                            <div className="relative h-64 w-full border-b border-border/60 bg-muted/20">
                                {contest.image ? (
                                    <img
                                        src={contest.image}
                                        alt={contest.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <HeroFallbackBanner id={contest.id} name={contest.name} />
                                )}
                            </div>

                            <CardContent className="px-6 pb-6 pt-0">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* Run Status Badge */}
                                            <div
                                                className={cn(
                                                    "flex items-center rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest shadow-sm",
                                                    rStatus.bg,
                                                    rStatus.text,
                                                    rStatus.glow,
                                                )}
                                            >
                                                {rStatus.label}
                                            </div>
                                            {/* Contest Status Badge */}
                                            <div
                                                className={cn(
                                                    "flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border border-current/20 shadow-sm",
                                                    cStatus.bg,
                                                    cStatus.text,
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        "mr-1.5 h-1.5 w-1.5 rounded-full shadow-sm",
                                                        cStatus.dot,
                                                    )}
                                                />
                                                {cStatus.label}
                                            </div>
                                        </div>

                                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                                            {contest.name}
                                        </h1>
                                        {contest.description && (
                                            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                                                {contest.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-9 rounded-full shadow-sm hover:text-primary transition-colors"
                                        >
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-9 rounded-full shadow-sm hover:text-primary transition-colors"
                                        >
                                            <Bookmark className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Mini Cards / Quick Info */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3 gap-3 mt-8">
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

                                    <QuickInfoCard
                                        icon={Shield}
                                        label="Team Mode"
                                        color="emerald"
                                        value={contest.team_approval_mode
                                            .replace("_", " ")
                                            .toLowerCase()}
                                    />

                                    <QuickInfoCard
                                        icon={Laptop}
                                        label="Contest Mode"
                                        color="indigo"
                                        value={contest.contest_mode.toLowerCase()}
                                    />

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

                                    <QuickInfoCard
                                        icon={Trophy}
                                        label="Leaderboard during Contest"
                                        color="rose"
                                        value={
                                            contest.show_leaderboard_during_contest
                                                ? "Visible"
                                                : "Hidden"
                                        }
                                    />
                                </div>
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
                                        time="To be announced"
                                        status="Not yet"
                                        isLast
                                    />
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
                                        bgClass:
                                            "bg-slate-50/50 dark:bg-slate-900/30 border-b border-border/50",
                                    };
                                }

                                if (effectiveRunStatus === "LIVE") {
                                    if (participation?.session?.already_started && canStart) {
                                        return {
                                            title: "Session in Progress",
                                            icon: Activity,
                                            iconClass: "text-emerald-500 animate-pulse",
                                            bgClass:
                                                "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5 border-b border-emerald-500/20",
                                        };
                                    }
                                    if (canStart) {
                                        return {
                                            title: "You're all set to go!",
                                            icon: Sparkles,
                                            iconClass: "text-emerald-500 animate-pulse",
                                            bgClass:
                                                "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5 border-b border-emerald-500/20",
                                        };
                                    } else {
                                        return {
                                            title: "Contest is Live",
                                            icon: Activity,
                                            iconClass: "text-rose-500 animate-pulse",
                                            bgClass:
                                                "bg-gradient-to-r from-rose-500/10 to-amber-500/10 dark:from-rose-500/5 dark:to-amber-500/5 border-b border-rose-500/20",
                                        };
                                    }
                                }

                                if (effectiveRunStatus === "UPCOMING") {
                                    const regStatus = participation?.registration_status?.status;
                                    if (regStatus === "APPROVED") {
                                        return {
                                            title: "You're Registered!",
                                            icon: CheckCircle2,
                                            iconClass: "text-indigo-500",
                                            bgClass:
                                                "bg-gradient-to-r from-indigo-500/10 to-blue-500/10 dark:from-indigo-500/5 dark:to-blue-500/5 border-b border-indigo-500/20",
                                        };
                                    } else if (regStatus === "PENDING_APPROVAL") {
                                        return {
                                            title: "Registration Pending",
                                            icon: Clock,
                                            iconClass: "text-amber-500 animate-pulse",
                                            bgClass:
                                                "bg-gradient-to-r from-amber-500/10 to-yellow-500/10 dark:from-amber-500/5 dark:to-yellow-500/5 border-b border-amber-500/20",
                                        };
                                    } else {
                                        return {
                                            title: "Upcoming Contest",
                                            icon: Calendar,
                                            iconClass: "text-blue-500",
                                            bgClass:
                                                "bg-slate-50/50 dark:bg-slate-900/30 border-b border-border/50",
                                        };
                                    }
                                }

                                if (effectiveRunStatus === "ENDED") {
                                    return {
                                        title: "Contest Ended",
                                        icon: Trophy,
                                        iconClass: "text-slate-400 dark:text-slate-600",
                                        bgClass:
                                            "bg-slate-100/50 dark:bg-slate-900/40 border-b border-border/50",
                                    };
                                }

                                return {
                                    title: "Contest Status",
                                    icon: Shield,
                                    iconClass: "text-primary",
                                    bgClass:
                                        "bg-slate-50/50 dark:bg-slate-900/30 border-b border-border/50",
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
                                                    <div className="flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-border/50 text-muted-foreground text-center">
                                                        <Trophy className="h-8 w-8 mb-2 text-slate-400 dark:text-slate-600 animate-pulse" />
                                                        <span className="text-sm font-bold text-foreground">
                                                            Contest Closed
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground/80 mt-1 font-medium">
                                                            Submissions are disabled. Results will
                                                            be published soon.
                                                        </span>
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

                        {/* Overall Registrations Card */}
                        <OverallRegistrationProgressCard contest={contest} />

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

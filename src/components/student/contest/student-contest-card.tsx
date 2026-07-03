"use client";

import { ArrowRight, Clock3, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { StudentContestAvailableResponse } from "@/api/generated/model";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const RUN_STATUS_STYLES: Record<string, { dot: string; label: string }> = {
    LIVE: { dot: "bg-emerald-400", label: "Live" },
    UPCOMING: { dot: "bg-orange-500", label: "Upcoming" },
    ENDED: { dot: "bg-rose-400", label: "Completed" },
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

function getTimeRemaining(targetDate: string) {
    const diff = new Date(targetDate).getTime() - new Date().getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

    if (diff < 0) return null;
    if (days > 0) return `Starts in ${days} day${days > 1 ? "s" : ""}`;
    if (hours > 0) return `Starts in ${hours} hour${hours > 1 ? "s" : ""}`;
    return "Starting soon";
}

export type StudentContestCardData = StudentContestAvailableResponse;

interface StudentContestCardProps {
    contest: StudentContestCardData;
}

export function StudentContestCard({ contest }: StudentContestCardProps) {
    const [imgErr, setImgErr] = useState(false);

    const runStatus =
        RUN_STATUS_STYLES[contest.run_status ?? "UPCOMING"] ?? RUN_STATUS_STYLES.UPCOMING;
    const isLive = contest.run_status === "LIVE";
    const isEnded = contest.run_status === "ENDED";

    const timeRelative = useMemo(() => getTimeRemaining(contest.start_time), [contest.start_time]);

    const formatTime = (value: string) =>
        new Date(value).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

    const formattedDate = useMemo(() => {
        const date = new Date(contest.start_time);
        return {
            dateStr: date.toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
            }),
            timeStr: formatTime(contest.start_time),
            endTimeStr: contest.end_time ? formatTime(contest.end_time) : null,
        };
    }, [contest.start_time, contest.end_time]);

    const teamSizeText =
        contest.min_team_size === contest.max_team_size
            ? `${contest.min_team_size}`
            : `${contest.min_team_size}-${contest.max_team_size}`;

    const registrationProgress = useMemo(() => {
        if (!contest.max_teams || contest.max_teams === 0) return null;
        return Math.min(
            100,
            Math.max(0, Math.round(((contest.teams_count || 0) / contest.max_teams) * 100)),
        );
    }, [contest.teams_count, contest.max_teams]);

    return (
        <Link
            href={`/student/contest/${contest.id}`}
            aria-label={`View contest ${contest.name}`}
            className="group relative flex flex-col overflow-hidden rounded-[20px] border border-border bg-card shadow-[0_16px_32px_-18px_rgba(2,6,23,0.38)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/55 hover:shadow-[0_22px_42px_-18px_rgba(2,6,23,0.5)] dark:border-white/10 dark:shadow-[0_16px_32px_-18px_rgba(2,6,23,0.85)] dark:hover:shadow-[0_22px_42px_-18px_rgba(2,6,23,0.95)]"
        >
            <div className="relative flex min-h-[162px] flex-col overflow-hidden border-b border-primary/20 bg-[linear-gradient(118deg,color-mix(in_srgb,var(--primary)_65%,#0b1220),color-mix(in_srgb,var(--primary)_18%,#0b1220)_82%)] px-7 py-6">
                {contest.image && !imgErr ? (
                    <>
                        <img
                            src={contest.image}
                            alt=""
                            className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={() => setImgErr(true)}
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/30" />
                    </>
                ) : (
                    <>
                        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_center,white_1px,transparent_1.3px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
                        <div className="pointer-events-none absolute -left-10 -top-24 size-72 rounded-full bg-primary/35 blur-3xl" />
                        <Trophy
                            aria-hidden="true"
                            strokeWidth={1.65}
                            className="pointer-events-none absolute -bottom-4 -right-2 size-32 rotate-[-4deg] text-white/[0.13] drop-shadow-[0_0_18px_rgba(255,255,255,0.04)] transition-all duration-500 group-hover:-translate-x-1 group-hover:rotate-[-2deg] group-hover:text-white/[0.16]"
                        />
                    </>
                )}

                <div className="relative flex items-center justify-between gap-3">
                    <StatusPill {...runStatus} glow />
                </div>

                <div className="relative mt-auto min-w-0 pr-14 pt-6">
                    <h3 className="line-clamp-2 text-[20px] font-bold leading-tight tracking-[-0.02em] text-white">
                        {contest.name}
                    </h3>
                    <p className="mt-1.5 text-sm font-medium text-slate-300">
                        {formattedDate.dateStr}
                    </p>
                </div>
            </div>

            <div className="flex min-h-[60px] items-center border-b border-border px-7 py-3 dark:border-white/10">
                <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
                    {contest.description ||
                        "Join this exciting coding competition and showcase your skills."}
                </p>
            </div>

            <div className="flex min-h-[60px] items-center border-b border-border px-7 text-muted-foreground dark:border-white/10">
                <div className="flex min-w-0 flex-1 items-center gap-2.5 pr-3">
                    <Clock3 className="size-[18px] shrink-0" />
                    <div className="flex min-w-0 flex-col">
                        <span className="text-xs">Starts</span>
                        <strong className="truncate text-sm text-foreground">
                            {formattedDate.timeStr}
                        </strong>
                    </div>
                </div>
                <div className="h-5 w-px bg-border dark:bg-white/10" />
                <div className="flex min-w-0 flex-1 items-center justify-center gap-2.5 px-3">
                    <Clock3 className="size-[18px] shrink-0" />
                    <div className="flex min-w-0 flex-col">
                        <span className="text-xs">Ends</span>
                        <strong className="truncate text-sm text-foreground">
                            {formattedDate.endTimeStr ?? "—"}
                        </strong>
                    </div>
                </div>
                <div className="h-5 w-px bg-border dark:bg-white/10" />
                <div className="flex min-w-0 flex-1 items-center justify-end gap-2.5 pl-3">
                    <Users className="size-[18px] shrink-0" />
                    <div className="flex min-w-0 flex-col">
                        <span className="text-xs">Team</span>
                        <strong className="truncate text-sm text-foreground">{teamSizeText}</strong>
                    </div>
                </div>
            </div>

            <div className="flex min-h-[60px] flex-col justify-center border-b border-border px-7 py-3 dark:border-white/10">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        {registrationProgress !== null ? "Capacity" : "Registrations"}
                    </span>
                    <span className="text-sm font-bold tabular-nums text-foreground">
                        {registrationProgress !== null
                            ? `${contest.teams_count || 0}/${contest.max_teams}`
                            : `${contest.teams_count || 0} Teams Joined`}
                    </span>
                </div>
                <Progress
                    value={registrationProgress ?? (contest.teams_count ? 100 : 0)}
                    className="mt-2 h-1.5"
                />
            </div>

            <div className="flex flex-1 items-center justify-between px-7 py-4">
                {isLive ? (
                    <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-600 dark:text-amber-400">
                        <span className="size-1.5 animate-pulse rounded-full bg-amber-500" />
                        Live Now
                    </span>
                ) : isEnded || !timeRelative ? (
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        {isEnded ? "Ended" : "Registration Closed"}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        <Clock3 className="size-3.5" />
                        {timeRelative}
                    </span>
                )}
                <span className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground shadow-md shadow-primary/15 transition-transform duration-300 group-hover:translate-x-1">
                    View
                    <ArrowRight className="size-3.5" />
                </span>
            </div>
        </Link>
    );
}

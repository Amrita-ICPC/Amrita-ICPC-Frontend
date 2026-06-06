"use client";

import { ArrowRight, Calendar, Clock, Shield, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { StudentContestAvailableResponse } from "@/api/generated/model";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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

function FallbackBanner({ id, name }: { id: string; name: string }) {
    const b = BANNERS[hashIndex(id, BANNERS.length)];
    const bgId = `sb-${id}`;
    const display = name.length > 20 ? name.slice(0, 20) + "…" : name;

    return (
        <svg
            viewBox="0 0 280 280"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
        >
            <defs>
                <linearGradient id={bgId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={b.from} />
                    <stop offset="100%" stopColor={b.to} />
                </linearGradient>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="white"
                        strokeWidth="0.5"
                        strokeOpacity="0.1"
                    />
                </pattern>
            </defs>
            <rect width="280" height="280" fill={`url(#${bgId})`} />
            <rect width="280" height="280" fill="url(#grid)" />

            <circle cx="220" cy="60" r="100" fill={b.accent} fillOpacity="0.15" />
            <circle cx="60" cy="220" r="80" fill={b.accent} fillOpacity="0.1" />

            <g transform="translate(140, 140)" textAnchor="middle">
                <text
                    y="-40"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="Inter, system-ui"
                    letterSpacing="4"
                    fill="white"
                    fillOpacity="0.5"
                    style={{ textTransform: "uppercase" }}
                >
                    Amrita ICPC
                </text>
                <text
                    y="10"
                    fontSize="22"
                    fontWeight="800"
                    fontFamily="Inter, system-ui"
                    fill="white"
                    fillOpacity="1"
                >
                    {display.split(" ")[0]}
                </text>
                <text
                    y="40"
                    fontSize="16"
                    fontWeight="600"
                    fontFamily="Inter, system-ui"
                    fill="white"
                    fillOpacity="0.8"
                >
                    {display.split(" ").slice(1).join(" ") || "Contest"}
                </text>
            </g>
        </svg>
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

    const cStatus = CONTEST_STATUS_STYLES[contest.status] ?? CONTEST_STATUS_STYLES.DRAFT;
    const rStatus =
        RUN_STATUS_STYLES[contest.run_status ?? "UPCOMING"] ?? RUN_STATUS_STYLES.UPCOMING;

    const timeRelative = useMemo(() => getTimeRemaining(contest.start_time), [contest.start_time]);

    const formattedDate = useMemo(() => {
        const date = new Date(contest.start_time);
        return {
            dateStr: date.toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
            }),
            timeStr: date.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }),
        };
    }, [contest.start_time]);

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
        <div className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-card shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 dark:border-white/5 dark:bg-slate-900/60 dark:hover:border-primary/40 min-h-[16rem]">
            <Link
                href={`/student/contest/${contest.id}`}
                className="absolute inset-0 z-0"
                aria-label={`View contest ${contest.name}`}
            />

            <div className="flex flex-1 flex-col sm:flex-row">
                {/* Image Section */}
                <div className="relative h-40 w-full shrink-0 sm:h-auto sm:w-64 overflow-hidden border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-white/5">
                    {contest.image && !imgErr ? (
                        <img
                            src={contest.image}
                            alt={contest.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={() => setImgErr(true)}
                        />
                    ) : (
                        <FallbackBanner id={contest.id} name={contest.name} />
                    )}

                    {/* Run Status Badge — Solid for visibility on images */}
                    <div className="absolute left-3 top-3 flex flex-col gap-2">
                        <div
                            className={cn(
                                "flex items-center rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest shadow-xl border border-white/10",
                                rStatus.bg,
                                rStatus.text,
                                rStatus.glow,
                            )}
                        >
                            {rStatus.label}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-1 flex-col p-5 sm:p-7">
                    {/* Header: Title + Status */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                                {contest.name}
                            </h3>
                            {/* Contest Status Badge — Semi-solid for visibility */}
                            <div
                                className={cn(
                                    "hidden sm:flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border border-current/20 shadow-sm",
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
                        <p className="line-clamp-1 text-sm text-muted-foreground max-w-2xl">
                            {contest.description ||
                                "Join this exciting coding competition and showcase your skills."}
                        </p>
                    </div>

                    {/* Integrated Metadata Row */}
                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                        <div className="flex items-center gap-2 text-foreground/80">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Calendar className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-0.5">
                                    Start Time
                                </span>
                                <span className="text-xs font-bold tabular-nums">
                                    {formattedDate.dateStr} • {formattedDate.timeStr}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-foreground/80">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <Users className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-0.5">
                                    Team Size
                                </span>
                                <span className="text-xs font-bold">{teamSizeText} Members</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-foreground/80">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <Shield className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-0.5">
                                    Approval
                                </span>
                                <span className="text-xs font-bold capitalize">
                                    {contest.team_approval_mode.toLowerCase().replace("_", " ")}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Section */}
                    <div className="mt-7 flex flex-col gap-3">
                        {registrationProgress !== null ? (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Trophy className="h-3.5 w-3.5 text-primary" />
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                                            Registration Capacity
                                        </span>
                                    </div>
                                    <span className="text-xs font-bold text-primary tabular-nums">
                                        {contest.teams_count} / {contest.max_teams} Teams
                                    </span>
                                </div>
                                <Progress
                                    value={registrationProgress}
                                    indicatorClassName="bg-primary shadow-[0_0_8px_rgba(var(--primary),0.3)]"
                                    className="h-1.5"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-3.5 w-3.5 text-primary/50" />
                                    <span className="uppercase tracking-widest">
                                        Active Registrations
                                    </span>
                                </div>
                                <span className="text-primary">
                                    {contest.teams_count || 0} Teams Joined
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Footer: Timer + Action */}
                    <div className="mt-auto pt-6 flex items-center justify-between border-t border-border/50">
                        <div className="flex items-center gap-2.5">
                            {timeRelative ? (
                                <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-500/5 px-3 py-1.5 border border-amber-100 dark:border-amber-500/10">
                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                                        {timeRelative}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider">
                                        Registration Closed
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2.5 group/btn cursor-pointer">
                            <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] transition-all group-hover/btn:mr-1">
                                Enter Contest
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 group-hover/btn:scale-110 transition-transform">
                                <ArrowRight className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { Users, Shield, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import type { StudentContestAvailableResponse } from "@/api/generated/model";

const CONTEST_STATUS_STYLES: Record<string, { dot: string; label: string; text: string }> = {
    PUBLISHED: {
        dot: "bg-emerald-500",
        label: "Published",
        text: "text-emerald-700 dark:text-emerald-300",
    },
    DRAFT: { dot: "bg-amber-500", label: "Draft", text: "text-amber-700 dark:text-amber-300" },
    PAUSED: { dot: "bg-sky-600", label: "Paused", text: "text-sky-700 dark:text-sky-300" },
    CANCELLED: { dot: "bg-red-500", label: "Cancelled", text: "text-red-700 dark:text-red-300" },
};

const RUN_STATUS_STYLES: Record<string, { bg: string; text: string; label: string; glow: string }> =
    {
        LIVE: {
            bg: "bg-emerald-500/10",
            text: "text-emerald-600 dark:text-emerald-400",
            label: "Live Now",
            glow: "shadow-[0_0_12px_rgba(16,185,129,0.3)]",
        },
        UPCOMING: {
            bg: "bg-blue-500/10",
            text: "text-blue-600 dark:text-blue-400",
            label: "Upcoming",
            glow: "shadow-none",
        },
        ENDED: {
            bg: "bg-slate-500/10",
            text: "text-slate-600 dark:text-slate-400",
            label: "Ended",
            glow: "shadow-none",
        },
    };

const BANNERS = [
    { from: "#294892", to: "#162d68", accent: "#93b1ff" },
    { from: "#28458a", to: "#15285f", accent: "#a7bcff" },
    { from: "#223e80", to: "#142659", accent: "#89adff" },
    { from: "#315098", to: "#193066", accent: "#b5c7ff" },
    { from: "#26458a", to: "#13275b", accent: "#9ab6ff" },
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
                <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path
                        d="M 24 0 L 0 0 0 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="0.5"
                        strokeOpacity="0.08"
                    />
                </pattern>
            </defs>
            <rect width="280" height="280" fill={`url(#${bgId})`} />
            <rect width="280" height="280" fill="url(#grid)" />
            {/* Decorative Tech Elements */}
            <circle cx="240" cy="40" r="80" fill={b.accent} fillOpacity="0.1" />
            <circle cx="240" cy="40" r="50" fill={b.accent} fillOpacity="0.05" />
            <g transform="translate(140, 110)" opacity="0.15">
                <path d="M-30 -30 L30 -30 L30 30 L-30 30 Z" fill="white" />
                <path d="M0 -40 L40 0 L0 40 L-40 0 Z" stroke="white" strokeWidth="2" fill="none" />
            </g>{" "}
            {/* Content Centered */}
            <g textAnchor="middle">
                <text
                    x="140"
                    y="140"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="system-ui"
                    letterSpacing="3"
                    fill="white"
                    fillOpacity="0.4"
                    style={{ textTransform: "uppercase" }}
                >
                    Challenge
                </text>
                <text
                    x="140"
                    y="175"
                    fontSize="24"
                    fontWeight="800"
                    fontFamily="system-ui"
                    fill="white"
                    fillOpacity="0.95"
                >
                    {display.split(" ")[0]}
                </text>
                <text
                    x="140"
                    y="205"
                    fontSize="16"
                    fontWeight="600"
                    fontFamily="system-ui"
                    fill="white"
                    fillOpacity="0.7"
                >
                    {display.split(" ").slice(1).join(" ") || "Contest"}
                </text>
            </g>
            {/* Bottom Wave */}
            <path
                d="M0 240 Q 70 220, 140 240 T 280 240 L 280 280 L 0 280 Z"
                fill="white"
                fillOpacity="0.05"
            />
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
            day: date.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
            time: date.toLocaleTimeString(undefined, {
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

    const occupancyPercent = contest.max_teams
        ? Math.min(100, ((contest.teams_count || 0) / contest.max_teams) * 100)
        : 0;

    return (
        <div className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 dark:border-white/10 dark:bg-slate-900/50 dark:hover:border-primary/30 min-h-64 sm:h-72">
            <Link
                href={`/student/contest/${contest.id}`}
                className="absolute inset-0 z-0"
                aria-label={`View contest ${contest.name}`}
            />

            {/* Top Section: Content + Image */}
            <div className="flex flex-1 flex-col sm:flex-row overflow-hidden">
                {/* Content Section (Left) */}
                <div className="flex flex-1 flex-col p-6 z-10">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center gap-2 mb-1">
                                <div
                                    className={`flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${rStatus.bg} ${rStatus.text} border border-current/20 ${rStatus.glow}`}
                                >
                                    {rStatus.label}
                                </div>
                                {timeRelative && (
                                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider animate-pulse">
                                        • {timeRelative}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                                    {contest.name}
                                </h3>
                                <div
                                    className={`flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-slate-100 dark:bg-slate-800 ${cStatus.text} border border-current/20 shadow-sm`}
                                >
                                    <span
                                        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${cStatus.dot}`}
                                    />
                                    {cStatus.label}
                                </div>
                            </div>
                            <p className="line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-2xl mt-1">
                                {contest.description || "No description provided for this contest."}
                            </p>
                        </div>
                    </div>

                    {/* Information Layout */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-8 items-end sm:items-center">
                        {/* Refined Minimalist Date/Time Component */}
                        <div className="flex items-center gap-5 shrink-0 bg-slate-50/80 dark:bg-slate-800/40 px-5 py-3.5 rounded-2xl border border-slate-200/50 dark:border-white/5 backdrop-blur-sm">
                            <div className="flex flex-col items-start border-r border-slate-200 dark:border-white/10 pr-5">
                                <span className="text-[10px] font-extrabold text-primary/60 dark:text-primary/80 uppercase tracking-[0.2em] mb-1">
                                    {formattedDate.day.split(" ")[1]}
                                </span>
                                <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
                                    {formattedDate.day.split(" ")[0]}
                                </span>
                            </div>
                            <div className="flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="h-3 w-3 text-primary/50" />
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                        Start Time
                                    </span>
                                </div>
                                <span className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-none tabular-nums">
                                    {formattedDate.time}
                                </span>
                            </div>
                        </div>

                        {/* Secondary Details Grid */}
                        <div className="flex flex-wrap gap-x-10 gap-y-4 flex-1">
                            <div className="flex items-center gap-2.5">
                                <Users className="h-4 w-4 text-slate-400" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                        Team Size
                                    </span>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">
                                        {teamSizeText} Member{contest.max_team_size > 1 ? "s" : ""}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col min-w-[120px]">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                        Capacity
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                        {contest.teams_count ?? 0}/{contest.max_teams || "∞"}
                                    </span>
                                </div>
                                {contest.max_teams ? (
                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 rounded-full ${occupancyPercent > 80 ? "bg-rose-500" : "bg-primary"}`}
                                            style={{ width: `${occupancyPercent}%` }}
                                        />
                                    </div>
                                ) : (
                                    <span className="text-[10px] font-bold text-emerald-500">
                                        Unlimited Slots
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Shield className="h-4 w-4 text-slate-400" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                        Approval
                                    </span>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1 capitalize">
                                        {contest.team_approval_mode.toLowerCase().replace("_", " ")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image Section (Right) */}
                <div className="relative w-full shrink-0 sm:w-64 z-10">
                    <div className="m-4 h-[calc(100%-2rem)] overflow-hidden rounded-xl bg-primary/10 dark:bg-primary/20 shadow-inner">
                        {contest.image && !imgErr ? (
                            <img
                                src={contest.image}
                                alt={contest.name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={() => setImgErr(true)}
                            />
                        ) : (
                            <FallbackBanner id={contest.id} name={contest.name} />
                        )}
                    </div>
                </div>
            </div>

            {/* Full Width Footer */}
            <div className="z-10 mt-auto flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-white/5 bg-slate-50/30 dark:bg-slate-900/30">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                                Registration Closes:
                            </span>{" "}
                            {new Date(contest.registration_end || "").toLocaleDateString()}
                        </span>
                    </div>
                    {contest.audiences && contest.audiences.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <span>
                                {contest.audiences[0].name}
                                {contest.audiences.length > 1
                                    ? ` +${contest.audiences.length - 1}`
                                    : ""}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 font-bold text-primary transition-all group-hover:translate-x-1 dark:text-primary">
                    <span className="text-sm">Enter Contest</span>
                    <ArrowRight className="h-5 w-5 ml-1" />
                </div>
            </div>
        </div>
    );
}

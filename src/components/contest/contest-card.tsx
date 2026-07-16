"use client";

import { ArrowRight, Clock3, Code2, FileQuestion, Users } from "lucide-react";
import Link from "next/link";

import type { ContestSummaryResponse } from "@/api/generated/model";
import { cn } from "@/lib/utils";

const CONTEST_STATUS_STYLES: Record<string, { dot: string; label: string }> = {
    PUBLISHED: { dot: "bg-emerald-400", label: "Published" },
    DRAFT: { dot: "bg-amber-400", label: "Draft" },
    PAUSED: { dot: "bg-sky-400", label: "Paused" },
    CANCELLED: { dot: "bg-rose-400", label: "Cancelled" },
};

const RUN_STATUS_STYLES: Record<string, { dot: string; label: string }> = {
    LIVE: { dot: "bg-emerald-400", label: "Live" },
    UPCOMING: { dot: "bg-orange-500", label: "Upcoming" },
    ENDED: { dot: "bg-rose-400", label: "Completed" },
};

interface ContestCardProps {
    contest: ContestSummaryResponse;
}

function formatDuration(minutes?: number | null) {
    if (!minutes) return "—";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0
        ? `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ""}`
        : `${remainingMinutes}m`;
}

function formatDate(value?: string | null) {
    if (!value) return "Not scheduled";
    return new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}

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

export function ContestCard({ contest }: ContestCardProps) {
    const contestStatus = CONTEST_STATUS_STYLES[contest.status] ?? CONTEST_STATUS_STYLES.DRAFT;
    const runStatus = RUN_STATUS_STYLES[contest.run_status] ?? RUN_STATUS_STYLES.UPCOMING;
    const contestCode = contest.id.split("-")[0].toUpperCase();

    return (
        <Link
            href={`/contest/${contest.id}`}
            aria-label={`View contest ${contest.name}`}
            className="group relative flex min-h-[306px] flex-col overflow-hidden rounded-[20px] border border-border bg-white shadow-[0_16px_32px_-18px_rgba(2,6,23,0.38)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/55 hover:shadow-[0_22px_42px_-18px_rgba(2,6,23,0.5)] dark:border-border/80 dark:bg-card dark:shadow-sm dark:hover:border-primary/40 dark:hover:shadow-md"
        >
            <div className="relative min-h-[162px] overflow-hidden border-b border-primary/20 bg-[linear-gradient(118deg,color-mix(in_srgb,var(--primary)_62%,#17356b),#081326_82%)] px-7 py-6">
                {contest.image && (
                    <div
                        className="pointer-events-none absolute inset-0 hidden bg-cover bg-center opacity-30 dark:block"
                        style={{ backgroundImage: `url(${contest.image})` }}
                    />
                )}
                <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_center,white_1px,transparent_1.3px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
                <div className="pointer-events-none absolute -left-10 -top-24 size-72 rounded-full bg-primary/35 blur-3xl" />

                <Code2
                    aria-hidden="true"
                    strokeWidth={1.65}
                    className={cn(
                        "pointer-events-none absolute -bottom-4 -right-2 size-32 rotate-[-4deg] text-white/[0.13] drop-shadow-[0_0_18px_rgba(255,255,255,0.04)] transition-all duration-500 group-hover:-translate-x-1 group-hover:rotate-[-2deg] group-hover:text-white/[0.16] dark:text-white/[0.2] dark:group-hover:text-white/25",
                        contest.image && "dark:hidden",
                    )}
                />

                <div className="relative flex items-center justify-between gap-3">
                    <StatusPill {...runStatus} glow />
                    <StatusPill {...contestStatus} glow />
                </div>

                <div className="relative mt-6 min-w-0 pr-16">
                    <h3 className="truncate text-[20px] font-bold leading-tight tracking-[-0.02em] text-white">
                        {contest.name}
                    </h3>
                    <p className="mt-1.5 text-sm font-medium text-slate-300">
                        {formatDate(contest.start_time)}
                    </p>
                </div>
            </div>

            <div className="flex min-h-[60px] items-center border-b border-border px-7 text-slate-500 dark:border-border/80 dark:text-muted-foreground">
                <div className="flex min-w-0 flex-1 items-center gap-2.5 pr-3">
                    <Clock3 className="size-[18px] shrink-0" />
                    <span className="text-xs">Duration</span>
                    <strong className="truncate text-sm text-slate-900 dark:text-foreground">
                        {formatDuration(contest.duration)}
                    </strong>
                </div>
                <div className="h-5 w-px bg-border" />
                <div className="flex min-w-0 flex-1 items-center justify-center gap-2.5 px-3">
                    <FileQuestion className="size-[18px] shrink-0" />
                    <strong className="text-sm text-slate-900 dark:text-foreground">
                        {contest.question_count ?? "—"}
                    </strong>
                    <span className="text-xs">
                        Question{contest.question_count === 1 ? "" : "s"}
                    </span>
                </div>
                <div className="h-5 w-px bg-border" />
                <div className="flex min-w-0 flex-1 items-center justify-end gap-2.5 pl-3">
                    <Users className="size-[18px] shrink-0" />
                    <strong className="text-sm text-slate-900 dark:text-foreground">
                        {contest.team_count ?? "—"}
                    </strong>
                    <span className="text-xs">Teams</span>
                </div>
            </div>

            <div className="flex flex-1 items-center justify-between px-7 py-4">
                <span className="font-mono text-xs font-semibold tracking-[0.08em] text-slate-500 dark:text-slate-400">
                    {contestCode}
                </span>
                <span className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground shadow-md shadow-primary/15 transition-transform duration-300 group-hover:translate-x-1">
                    View
                    <ArrowRight className="size-3.5" />
                </span>
            </div>
        </Link>
    );
}

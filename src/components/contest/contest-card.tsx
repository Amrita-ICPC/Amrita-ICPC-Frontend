"use client";

import {
    ArrowRight,
    Trophy,
    Users,
    FileQuestion,
    Calendar,
    Clock,
    MoreVertical,
} from "lucide-react";
import Link from "next/link";
import type { ContestSummaryResponse } from "@/api/generated/model";
import { cn } from "@/lib/utils";

const CONTEST_STATUS_STYLES: Record<
    string,
    { bg: string; dot: string; label: string; text: string }
> = {
    PUBLISHED: {
        bg: "bg-emerald-500/10",
        dot: "bg-emerald-500",
        label: "Published",
        text: "text-emerald-700 dark:text-emerald-400",
    },
    DRAFT: {
        bg: "bg-amber-500/10",
        dot: "bg-amber-500",
        label: "Draft",
        text: "text-amber-700 dark:text-amber-400",
    },
    PAUSED: {
        bg: "bg-sky-500/10",
        dot: "bg-sky-600",
        label: "Paused",
        text: "text-sky-700 dark:text-sky-400",
    },
    CANCELLED: {
        bg: "bg-red-500/10",
        dot: "bg-red-500",
        label: "Cancelled",
        text: "text-red-700 dark:text-red-400",
    },
};

const RUN_STATUS_STYLES: Record<
    string,
    { bg: string; border: string; text: string; label: string }
> = {
    LIVE: {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        text: "text-emerald-600 dark:text-emerald-400",
        label: "Live",
    },
    UPCOMING: {
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        text: "text-orange-600 dark:text-orange-400",
        label: "Upcoming",
    },
    ENDED: {
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        text: "text-red-600 dark:text-red-400",
        label: "Completed",
    },
};

interface ContestCardProps {
    contest: ContestSummaryResponse;
}

const WaveBackground = () => (
    <div className="absolute inset-0 z-0 opacity-40 dark:opacity-30">
        <svg
            className="absolute h-full w-full object-cover"
            preserveAspectRatio="none"
            viewBox="0 0 1440 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M0,80 C320,160 560,-40 1440,100 L1440,200 L0,200 Z"
                fill="currentColor"
                className="text-primary"
                opacity="0.15"
            />
            <path
                d="M0,120 C400,200 800,0 1440,120 L1440,200 L0,200 Z"
                fill="currentColor"
                className="text-primary"
                opacity="0.1"
            />
            <path
                d="M0,160 C500,40 900,180 1440,140 L1440,200 L0,200 Z"
                fill="currentColor"
                className="text-primary"
                opacity="0.05"
            />
        </svg>
    </div>
);

export function ContestCard({ contest }: ContestCardProps) {
    const cStatus = CONTEST_STATUS_STYLES[contest.status] ?? CONTEST_STATUS_STYLES.DRAFT;
    const rStatus = RUN_STATUS_STYLES[contest.run_status] ?? RUN_STATUS_STYLES.UPCOMING;
    const contestCode = contest.id.split("-")[0].toUpperCase();

    const startDate = contest.start_time
        ? new Date(contest.start_time).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : "Not Scheduled";

    const startTimeStr = contest.start_time
        ? new Date(contest.start_time).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
          })
        : "";

    const endDateStr = contest.end_time
        ? new Date(contest.end_time).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : "";

    return (
        <Link
            href={`/contest/${contest.id}`}
            className="group relative flex flex-col overflow-hidden rounded-[16px] border border-border/60 bg-card shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-md block"
        >
            {/* Header Block (Waves + Badges) */}
            <div className="relative h-[96px] w-full bg-primary/5 dark:bg-primary/10">
                <WaveBackground />
                <div className="absolute inset-0 bg-[radial-gradient(theme(colors.primary.DEFAULT)_1px,transparent_1px)] bg-[size:14px_14px] opacity-20 [mask-image:linear-gradient(to_bottom,white_20%,transparent_80%)]" />

                <div className="relative z-10 flex items-start justify-between p-4">
                    {/* Run Status Badge */}
                    <div
                        className={cn(
                            "flex items-center rounded-lg border px-2.5 py-1 backdrop-blur-md shadow-sm",
                            rStatus.bg,
                            rStatus.border,
                        )}
                    >
                        <span
                            className={cn(
                                "text-[11px] font-bold uppercase tracking-wider",
                                rStatus.text,
                            )}
                        >
                            {rStatus.label}
                        </span>
                    </div>

                    {/* Contest Status Badge */}
                    <div
                        className={cn(
                            "flex items-center gap-1.5 rounded-lg border border-border/50 bg-background/60 px-2.5 py-1 backdrop-blur-md shadow-sm",
                            cStatus.bg,
                        )}
                    >
                        <span
                            className={cn(
                                "h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]",
                                cStatus.dot,
                            )}
                        />
                        <span
                            className={cn(
                                "text-[11px] font-bold uppercase tracking-wide",
                                cStatus.text,
                            )}
                        >
                            {cStatus.label}
                        </span>
                    </div>
                </div>
            </div>

            {/* Body Block */}
            <div className="relative flex flex-col gap-1.5 p-4 pt-6">
                {/* Overlapping Trophy Icon */}
                <div className="absolute -top-7 left-4 z-20 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-[6px] ring-primary/20 dark:ring-primary/30">
                    <Trophy className="h-6 w-6" />
                </div>

                <div className="flex justify-end items-center h-4">
                    <span className="text-[12px] font-medium text-muted-foreground">
                        {startDate}
                    </span>
                </div>

                <h3 className="mt-1 text-[16px] font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
                    {contest.name}
                </h3>

                <p className="mt-0.5 line-clamp-2 text-[12px] text-muted-foreground">
                    {contest.description ||
                        (contest.start_time
                            ? `Starts at ${startTimeStr} and ends ${endDateStr}.`
                            : "No description provided.")}
                </p>
            </div>

            {/* Stats Block */}
            <div className="grid grid-cols-3 gap-2 bg-muted/30 px-4 py-3 border-t border-border/40">
                <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-[11px] font-medium">Duration</span>
                    </div>
                    <span className="text-[14px] font-bold text-foreground pl-4">
                        {contest.duration ? `${Math.floor(contest.duration / 60)}h` : "—"}
                    </span>
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <FileQuestion className="h-3.5 w-3.5" />
                        <span className="text-[11px] font-medium">Questions</span>
                    </div>
                    <span className="text-[14px] font-bold text-foreground pl-4">—</span>
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span className="text-[11px] font-medium">Teams</span>
                    </div>
                    <span className="text-[14px] font-bold text-foreground pl-4">—</span>
                </div>
            </div>

            {/* Footer Block */}
            <div className="flex items-center justify-between border-t border-border/40 p-4 bg-card">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                        {contestCode.charAt(0)}
                    </div>
                    <span className="text-[12px] font-medium text-foreground uppercase tracking-wider">
                        {contestCode}
                    </span>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-primary-foreground shadow-sm transition-transform group-hover:scale-105 group-hover:shadow-md">
                    <span className="text-[12px] font-semibold">View</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                </div>
            </div>
        </Link>
    );
}

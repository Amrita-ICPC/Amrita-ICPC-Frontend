"use client";

import { Calendar, ArrowRight, Edit2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

import type { ContestSummaryResponse } from "@/api/generated/model";

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

const RUN_STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    LIVE: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        label: "Live",
    },
    UPCOMING: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", label: "Upcoming" },
    ENDED: { bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", label: "Ended" },
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
    const bgId = `b-${id}`;
    const display = name.length > 24 ? name.slice(0, 24) + "…" : name;

    return (
        <svg
            viewBox="0 0 400 140"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
            aria-hidden
        >
            <defs>
                <linearGradient id={bgId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={b.from} />
                    <stop offset="100%" stopColor={b.to} />
                </linearGradient>
            </defs>
            <rect width="400" height="140" fill={`url(#${bgId})`} />
            {/* Soft abstract overlays */}
            <circle cx="332" cy="26" r="44" fill={b.accent} fillOpacity="0.2" />
            <circle cx="78" cy="126" r="56" fill={b.accent} fillOpacity="0.15" />
            <path
                d="M0 106 C70 84, 150 82, 250 102 C310 114, 362 116, 400 110 L400 140 L0 140 Z"
                fill={b.accent}
                fillOpacity="0.2"
            />
            {/* Label */}
            <text
                x="200"
                y="55"
                textAnchor="middle"
                fontSize="9"
                fontFamily="system-ui"
                letterSpacing="4"
                fill={b.accent}
                fillOpacity="0.7"
            >
                CONTEST
            </text>
            <text
                x="200"
                y="78"
                textAnchor="middle"
                fontSize="15"
                fontWeight="700"
                fontFamily="system-ui"
                fill="white"
                fillOpacity="0.95"
            >
                {display}
            </text>
            <rect
                x="150"
                y="90"
                width="100"
                height="1.5"
                rx="0.75"
                fill={b.accent}
                fillOpacity="0.4"
            />
        </svg>
    );
}

interface ContestCardProps {
    contest: ContestSummaryResponse;
}

export function ContestCard({ contest }: ContestCardProps) {
    const [imgErr, setImgErr] = useState(false);
    const cStatus = CONTEST_STATUS_STYLES[contest.status] ?? CONTEST_STATUS_STYLES.DRAFT;
    const rStatus = RUN_STATUS_STYLES[contest.run_status] ?? RUN_STATUS_STYLES.UPCOMING;

    const startDate = new Date(contest.start_time).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
    const endDate = new Date(contest.end_time).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className="group relative flex h-70 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_24px_-18px_rgba(20,45,103,0.45)] transition-all duration-200 hover:-translate-y-1 hover:border-[#bdccee] hover:shadow-[0_18px_30px_-18px_rgba(16,35,82,0.58)] dark:border-white/12 dark:bg-slate-900 dark:hover:border-white/20">
            <Link
                href={`/contest/${contest.id}`}
                className="absolute inset-0 z-0"
                aria-label={`View contest ${contest.name}`}
            />

            {/* Banner — fixed 130px */}
            <div className="relative h-32.5 w-full shrink-0 overflow-hidden z-0 pointer-events-none">
                {contest.image && !imgErr ? (
                    <>
                        <img
                            src={contest.image}
                            alt={contest.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={() => setImgErr(true)}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#13285e]/88 via-[#13285e]/30 to-transparent" />
                    </>
                ) : (
                    <FallbackBanner id={contest.id} name={contest.name} />
                )}

                {/* Top overlays */}
                <div className="absolute inset-x-3 top-3 flex items-start justify-between pointer-events-none">
                    {/* Run Status Badge */}
                    <div className="flex flex-col gap-1.5 items-start">
                        <div
                            className={`flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${rStatus.bg} ${rStatus.text} border border-current/10 shadow-sm pointer-events-auto`}
                        >
                            {rStatus.label}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                        {/* Status */}
                        <div className="flex items-center gap-1.5 rounded-full border border-white/45 bg-white/95 px-2.5 py-1 shadow-sm backdrop-blur-sm dark:border-white/20 dark:bg-slate-900/80 pointer-events-auto">
                            <span className={`h-1.5 w-1.5 rounded-full ${cStatus.dot} shadow-sm`} />
                            <span
                                className={`text-[11px] font-semibold tracking-wide ${cStatus.text}`}
                            >
                                {cStatus.label}
                            </span>
                        </div>

                        {/* Edit Button */}
                        <Link
                            href={`/contest/${contest.id}/edit`}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/90 text-slate-600 shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-white hover:text-[#162d68] dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300 pointer-events-auto"
                            title="Edit Contest"
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col justify-between px-4 py-3">
                <div>
                    <h3 className="line-clamp-1 font-bold text-slate-900 transition-colors duration-200 group-hover:text-[#162d68] dark:text-slate-100 dark:group-hover:text-blue-300">
                        {contest.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300/90">
                        {contest.description || "No description provided."}
                    </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
                        <span>
                            {startDate} – {endDate}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 transition-colors group-hover:text-[#23428d] dark:text-slate-400 dark:group-hover:text-blue-300">
                        <span className="text-[11px] font-medium">View</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                </div>
            </div>
        </div>
    );
}

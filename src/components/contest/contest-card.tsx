"use client";

import { Calendar, ArrowRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

import type { ContestSummaryResponse } from "@/api/generated/model";

const STATUS: Record<string, { dot: string; label: string; text: string }> = {
    RUNNING:   { dot: "bg-emerald-400",     label: "Running",   text: "text-emerald-400" },
    SCHEDULED: { dot: "bg-sky-400",         label: "Scheduled", text: "text-sky-400"     },
    FINISHED:  { dot: "bg-slate-500",       label: "Finished",  text: "text-slate-400"   },
    DRAFT:     { dot: "bg-amber-400",       label: "Draft",     text: "text-amber-400"   },
};

const BANNERS = [
    { from: "#1e3a5f", to: "#0c1a2e", accent: "#3b82f6" },
    { from: "#1a1f4e", to: "#0c0f2e", accent: "#6366f1" },
    { from: "#12274a", to: "#0a1628", accent: "#0ea5e9" },
    { from: "#1e2d4a", to: "#0d1829", accent: "#818cf8" },
    { from: "#162040", to: "#0b1428", accent: "#38bdf8" },
];

function hashIndex(id: string, len: number) {
    return id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % len;
}

function FallbackBanner({ id, name }: { id: string; name: string }) {
    const b = BANNERS[hashIndex(id, BANNERS.length)];
    const bgId = `b-${id}`;
    const display = name.length > 24 ? name.slice(0, 24) + "…" : name;

    return (
        <svg viewBox="0 0 400 140" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" aria-hidden>
            <defs>
                <linearGradient id={bgId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={b.from} />
                    <stop offset="100%" stopColor={b.to} />
                </linearGradient>
            </defs>
            <rect width="400" height="140" fill={`url(#${bgId})`} />
            {/* Grid lines */}
            {[40, 80, 120, 160, 200, 240, 280, 320, 360].map(x => (
                <line key={x} x1={x} y1="0" x2={x} y2="140" stroke={b.accent} strokeOpacity="0.06" strokeWidth="1" />
            ))}
            {[35, 70, 105].map(y => (
                <line key={y} x1="0" y1={y} x2="400" y2={y} stroke={b.accent} strokeOpacity="0.06" strokeWidth="1" />
            ))}
            {/* Glow orb */}
            <ellipse cx="200" cy="60" rx="120" ry="55" fill={b.accent} fillOpacity="0.08" />
            {/* Label */}
            <text x="200" y="55" textAnchor="middle" fontSize="9" fontFamily="system-ui" letterSpacing="4"
                fill={b.accent} fillOpacity="0.7">CONTEST</text>
            <text x="200" y="78" textAnchor="middle" fontSize="15" fontWeight="700" fontFamily="system-ui"
                fill="white" fillOpacity="0.9">{display}</text>
            <rect x="150" y="90" width="100" height="1.5" rx="0.75" fill={b.accent} fillOpacity="0.4" />
        </svg>
    );
}

interface ContestCardProps {
    contest: ContestSummaryResponse;
}

export function ContestCard({ contest }: ContestCardProps) {
    const [imgErr, setImgErr] = useState(false);
    const status = STATUS[contest.status] ?? STATUS.DRAFT;

    const startDate = new Date(contest.start_time).toLocaleDateString(undefined, {
        month: "short", day: "numeric", year: "numeric",
    });
    const endDate = new Date(contest.end_time).toLocaleDateString(undefined, {
        month: "short", day: "numeric", year: "numeric",
    });

    return (
        <Link
            href={`/contest/${contest.id}`}
            className="group flex h-[280px] flex-col rounded-xl bg-[#0c1a2e] overflow-hidden shadow-lg shadow-black/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#060f1e]/60 hover:bg-[#0f2040]"
        >
            {/* Banner — fixed 130px */}
            <div className="relative h-[130px] w-full shrink-0 overflow-hidden">
                {contest.image && !imgErr ? (
                    <>
                        <img
                            src={contest.image}
                            alt={contest.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={() => setImgErr(true)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a2e]/90 to-transparent" />
                    </>
                ) : (
                    <FallbackBanner id={contest.id} name={contest.name} />
                )}

                {/* Status */}
                <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm border border-white/5">
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot} shadow-sm`} />
                    <span className={`text-[11px] font-semibold tracking-wide ${status.text}`}>{status.label}</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col justify-between px-4 py-3">
                <div>
                    <h3 className="line-clamp-1 font-bold text-slate-100 group-hover:text-sky-300 transition-colors duration-200">
                        {contest.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                        {contest.description || "No description provided."}
                    </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                        <span>{startDate} – {endDate}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 group-hover:text-sky-400 transition-colors">
                        <span className="text-[11px] font-medium">View</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

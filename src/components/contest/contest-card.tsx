"use client";

import { Calendar, Users, ArrowRight } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Contest } from "@/types/contest";

// ─── Fallback Banner ─────────────────────────────────────────────────────────

function ContestFallbackBanner({ id, name }: { id: string; name: string }) {
    const bgId = `cb-bg-${id}`;
    const glowId = `cb-glow-${id}`;
    const displayName = name.length > 28 ? name.slice(0, 28) + "…" : name;

    return (
        <svg
            viewBox="0 0 640 360"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id={bgId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1e1b4b" />
                    <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id={glowId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Background */}
            <rect width="640" height="360" fill={`url(#${bgId})`} />

            {/* Glow blob */}
            <ellipse cx="320" cy="130" rx="220" ry="120" fill={`url(#${glowId})`} />

            {/* Dot grid */}
            {Array.from({ length: 10 }, (_, col) =>
                Array.from({ length: 6 }, (_, row) => (
                    <circle
                        key={`${col}-${row}`}
                        cx={44 + col * 62}
                        cy={30 + row * 60}
                        r="1.5"
                        fill="#6366f1"
                        opacity="0.2"
                    />
                )),
            )}

            {/* Decorative brackets */}
            <text
                x="52"
                y="210"
                fontSize="120"
                fontFamily="monospace"
                fontWeight="bold"
                fill="#6366f1"
                opacity="0.12"
            >{`{`}</text>
            <text
                x="510"
                y="210"
                fontSize="120"
                fontFamily="monospace"
                fontWeight="bold"
                fill="#6366f1"
                opacity="0.12"
            >{`}`}</text>

            {/* Trophy icon */}
            <g transform="translate(296, 98)" fill="#a5b4fc" opacity="0.9">
                <path d="M24 0H0v18c0 9.9 6.9 18.2 16 20.5V44H8v4h32v-4H28V38.5C37.1 36.2 44 27.9 44 18V0H20zM4 18V4h12v24.3C10.1 26.6 4 22.7 4 18zm36 0c0 4.7-6.1 8.6-12 10.3V4h12v14z" />
            </g>

            {/* "CONTEST" label */}
            <text
                x="320"
                y="178"
                textAnchor="middle"
                fontSize="11"
                fontFamily="system-ui,sans-serif"
                letterSpacing="3"
                fill="#a5b4fc"
                opacity="0.7"
            >
                CONTEST
            </text>

            {/* Contest name */}
            <text
                x="320"
                y="215"
                textAnchor="middle"
                fontSize="22"
                fontWeight="bold"
                fontFamily="system-ui,sans-serif"
                fill="white"
                opacity="0.95"
            >
                {displayName}
            </text>

            {/* Accent underline */}
            <rect x="240" y="232" width="160" height="2" rx="1" fill="#6366f1" opacity="0.5" />
        </svg>
    );
}

// ─── Status colours ───────────────────────────────────────────────────────────

function getStatusColor(status: string): string {
    switch (status) {
        case "RUNNING":
            return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
        case "SCHEDULED":
            return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
        case "FINISHED":
            return "bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/20";
        default:
            return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20";
    }
}

// ─── ContestCard ─────────────────────────────────────────────────────────────

interface ContestCardProps {
    contest: Contest;
}

export function ContestCard({ contest }: ContestCardProps) {
    const [imageError, setImageError] = useState(false);

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

    // Use onError to handle any broken/invalid/unconfigured URL silently.
    const showImage = !!contest.image && !imageError;

    return (
        <Card className="group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5 border-transparent bg-gradient-to-b from-card to-card/50">
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {showImage ? (
                    <>
                        {}
                        {/* Plain <img> — no hostname config, onError silently falls back */}
                        <img
                            src={contest.image}
                            alt={contest.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={() => setImageError(true)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
                    </>
                ) : (
                    <ContestFallbackBanner id={contest.id} name={contest.name} />
                )}

                <div className="absolute right-3 top-3">
                    <Badge
                        variant="outline"
                        className={`border-transparent backdrop-blur-md font-semibold tracking-wide ${getStatusColor(contest.status)}`}
                    >
                        {contest.status.replace("_", " ")}
                    </Badge>
                </div>
            </div>

            <CardHeader className="p-5 pb-3">
                <h3 className="line-clamp-1 text-xl font-bold tracking-tight text-foreground/90 group-hover:text-primary transition-colors">
                    {contest.name}
                </h3>
                <p className="line-clamp-2 mt-1.5 text-sm text-muted-foreground/80 leading-relaxed">
                    {contest.description ||
                        "No specific details have been provided for this contest yet."}
                </p>
            </CardHeader>

            <CardContent className="flex-1 px-5 py-2">
                <div className="flex flex-col gap-3 text-sm font-medium text-muted-foreground/90">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Calendar className="h-4 w-4" />
                        </div>
                        <span>
                            {startDate} <span className="opacity-50 mx-1">—</span> {endDate}
                        </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Users className="h-4 w-4" />
                        </div>
                        <span className="capitalize">
                            {contest.team_approval_mode.replace("_", " ").toLowerCase()} Teams
                        </span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-5 pt-4 border-t border-border/40">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="default"
                            className="w-full group/btn shadow-md hover:shadow-lg transition-all"
                        >
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Explore contest info and rules</p>
                    </TooltipContent>
                </Tooltip>
            </CardFooter>
        </Card>
    );
}

"use client";

import { ArrowRight, FileCode2, Send, ShieldCheck, UserCircle2, Users } from "lucide-react";
import Link from "next/link";

import type { ContestDetailResponse } from "@/api/generated/model";

interface ContestNavStatsProps {
    contest: ContestDetailResponse;
}

function NavStatTile({
    href,
    value,
    label,
    icon: Icon,
}: {
    href: string;
    value: number | string;
    label: string;
    icon: React.ElementType;
}) {
    return (
        <Link
            href={href}
            className="group relative flex flex-col justify-between rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
            <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4.5 w-4.5" />
                </div>
                <span className="flex items-center gap-0.5 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
                    Open
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
            </div>
            <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
        </Link>
    );
}

function StatTile({
    value,
    label,
    icon: Icon,
}: {
    value: number | string;
    label: string;
    icon: React.ElementType;
}) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="h-4.5 w-4.5" />
            </div>
            <div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}

export function ContestNavStats({ contest }: ContestNavStatsProps) {
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <NavStatTile
                    href={`/contest/${contest.id}/teams`}
                    value={contest.team_count ?? 0}
                    label="Teams"
                    icon={Users}
                />
                <NavStatTile
                    href={`/contest/${contest.id}/questions`}
                    value={contest.question_count ?? 0}
                    label="Questions"
                    icon={FileCode2}
                />
                <NavStatTile
                    href={`/contest/${contest.id}/access`}
                    value="Set"
                    label="Access"
                    icon={ShieldCheck}
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <StatTile value={contest.submission_count ?? 0} label="Submissions" icon={Send} />
                <StatTile
                    value={contest.participant_count ?? 0}
                    label="Participants"
                    icon={UserCircle2}
                />
            </div>
        </div>
    );
}

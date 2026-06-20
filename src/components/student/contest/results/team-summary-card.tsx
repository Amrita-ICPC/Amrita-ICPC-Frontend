"use client";

import type { StudentTeamAnalytics } from "@/api/generated/model/studentTeamAnalytics";
import { numberValue } from "@/components/contest/team-member-analytics/member-detail-utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface TeamSummaryCardProps {
    analytics: StudentTeamAnalytics;
}

function getAcceptanceTone(rate: number) {
    if (rate >= 70) {
        return {
            label: "Strong",
            badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            text: "text-emerald-600 dark:text-emerald-400",
            progress: "bg-emerald-500",
        };
    }

    if (rate >= 40) {
        return {
            label: "Needs review",
            badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
            text: "text-amber-600 dark:text-amber-400",
            progress: "bg-amber-500",
        };
    }

    return {
        label: "At risk",
        badge: "bg-red-500/10 text-red-600 dark:text-red-400",
        text: "text-red-600 dark:text-red-400",
        progress: "bg-red-500",
    };
}

function HeroMetric({
    label,
    value,
    hint,
    tone = "neutral",
}: {
    label: string;
    value: string | number;
    hint: string;
    tone?: "neutral" | "primary" | "emerald" | "amber" | "red";
}) {
    const toneClass = {
        neutral: "border-border/70 bg-muted/30 text-foreground",
        primary: "border-primary/20 bg-primary/5 text-primary",
        emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
        amber: "border-amber-500/25 bg-amber-500/5 text-amber-600 dark:text-amber-400",
        red: "border-red-500/25 bg-red-500/5 text-red-600 dark:text-red-400",
    };

    return (
        <div className={cn("rounded-lg border p-3.5 shadow-xs", toneClass[tone])}>
            <p className="text-[11px] font-semibold uppercase text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums text-current">
                {value}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        </div>
    );
}

export function TeamSummaryCard({ analytics }: TeamSummaryCardProps) {
    const members = analytics.members ?? [];
    const totalSubmissions = numberValue(analytics.total_submissions);
    const acceptedSubmissions = numberValue(analytics.accepted_submission);
    const pendingSubmissions = numberValue(analytics.pending_submission);
    const participatedMembers = members.filter((member) => member.is_participated).length;
    const acceptanceRate =
        totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;
    const acceptanceTone = getAcceptanceTone(acceptanceRate);

    return (
        <Card className="self-start border-border/70 bg-card shadow-sm">
            <CardContent className="p-5 md:p-6">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                            {analytics.name}
                        </h1>
                        <Badge
                            variant="outline"
                            className="border-border/60 bg-muted/60 text-muted-foreground"
                        >
                            Team results
                        </Badge>
                    </div>
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        Your team&apos;s score, submission health, and member participation.
                    </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <HeroMetric
                        label="Team Score"
                        value={numberValue(analytics.score)}
                        hint="Evaluated score"
                        tone="primary"
                    />
                    <HeroMetric
                        label="Submissions"
                        value={totalSubmissions}
                        hint={`${acceptedSubmissions} accepted`}
                    />
                    <div className="rounded-lg border border-border/70 bg-muted/30 p-3.5 shadow-xs">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                                Acceptance
                            </p>
                            <Badge
                                variant="outline"
                                className={cn("border-transparent", acceptanceTone.badge)}
                            >
                                {acceptanceTone.label}
                            </Badge>
                        </div>
                        <p
                            className={cn(
                                "mt-1 text-2xl font-bold tracking-tight tabular-nums",
                                acceptanceTone.text,
                            )}
                        >
                            {acceptanceRate}%
                        </p>
                        <Progress
                            value={acceptanceRate}
                            max={100}
                            className="mt-2 h-2"
                            indicatorClassName={acceptanceTone.progress}
                        />
                    </div>
                    <HeroMetric
                        label="Pending"
                        value={pendingSubmissions}
                        hint="Waiting for evaluation"
                        tone="red"
                    />
                    <HeroMetric
                        label="Participation"
                        value={`${participatedMembers}/${members.length || 0}`}
                        hint="Members participated"
                        tone={participatedMembers === members.length ? "emerald" : "amber"}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

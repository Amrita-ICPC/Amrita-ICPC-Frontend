"use client";

import { CalendarClock, CheckCircle2, Clock3, Flag, Mail, Timer, Trophy, User } from "lucide-react";

import type { ContestTeamMemberDetail } from "@/api/generated/model/contestTeamMemberDetail";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { formatDateTime, formatDuration, numberValue } from "./member-detail-utils";

interface MemberDetailHeroProps {
    member: ContestTeamMemberDetail;
}

function initials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function HeroInfoTile({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string | number;
    icon: React.ElementType;
}) {
    return (
        <div className="rounded-lg border border-border/70 bg-muted/30 p-3.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </div>
            <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
        </div>
    );
}

function ScorePanel({ member }: { member: ContestTeamMemberDetail }) {
    const attempted = numberValue(member.question_statistics?.attempted);
    const solved = numberValue(member.question_statistics?.solved);
    const score = numberValue(member.score);
    const progress = attempted > 0 ? Math.round((solved / attempted) * 100) : 0;

    return (
        <div className="flex h-full min-h-[210px] flex-col items-center justify-center rounded-lg border border-primary/15 bg-primary/5 p-6 text-center">
            <p className="text-xs font-bold uppercase text-primary">Score</p>
            <p className="mt-2 text-sm text-muted-foreground">{progress}% solved questions</p>
            <div className="mt-5 flex h-28 w-28 items-center justify-center rounded-full border border-primary/15 bg-background shadow-inner">
                <div>
                    <p className="text-3xl font-bold text-primary tabular-nums">{score}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                </div>
            </div>
            <Progress value={progress} max={100} className="mt-5 h-2 w-full" />
        </div>
    );
}

export function MemberDetailHero({ member }: MemberDetailHeroProps) {
    const submissionStats = member.submission_statistics;
    const questionStats = member.question_statistics;
    const totalSubmissions = numberValue(submissionStats?.total);
    const acceptedSubmissions = numberValue(submissionStats?.accepted);
    const acceptanceRate =
        totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

    return (
        <Card className="border-border/70 bg-card shadow-sm">
            <CardContent className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="space-y-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xl font-bold text-primary shadow-sm">
                            {initials(member.name) || <User className="h-6 w-6" />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                    {member.name}
                                </h1>
                                {member.is_leader ? (
                                    <Badge className="border-transparent bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                        Team leader
                                    </Badge>
                                ) : null}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5" />
                                    {member.email}
                                </span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Badge
                                    className={cn(
                                        "border-transparent",
                                        member.is_participated
                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                            : "bg-muted text-muted-foreground",
                                    )}
                                >
                                    {member.is_participated ? "Participated" : "Not started"}
                                </Badge>
                                <Badge
                                    className={cn(
                                        "border-transparent",
                                        member.is_flagged
                                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                            : "bg-muted text-muted-foreground",
                                    )}
                                >
                                    <Flag className="h-3 w-3" />
                                    {member.is_flagged ? "Flagged" : "No flags"}
                                </Badge>
                                {member.flagged_reason ? (
                                    <Badge
                                        variant="outline"
                                        className="border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400"
                                    >
                                        {member.flagged_reason}
                                    </Badge>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <HeroInfoTile
                            label="Started"
                            value={formatDateTime(member.started_at)}
                            icon={CalendarClock}
                        />
                        <HeroInfoTile
                            label="Ended"
                            value={formatDateTime(member.ended_at)}
                            icon={CheckCircle2}
                        />
                        <HeroInfoTile
                            label="Extra Time"
                            value={formatDuration(member.extra_time_seconds)}
                            icon={Timer}
                        />
                        <HeroInfoTile
                            label="Remaining"
                            value={formatDuration(member.remaining_time_seconds)}
                            icon={Clock3}
                        />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <HeroInfoTile
                            label="Questions"
                            value={`${numberValue(questionStats?.attempted)} attempted`}
                            icon={Trophy}
                        />
                        <HeroInfoTile
                            label="Solved"
                            value={numberValue(questionStats?.solved)}
                            icon={CheckCircle2}
                        />
                        <HeroInfoTile label="Submissions" value={totalSubmissions} icon={Clock3} />
                        <HeroInfoTile
                            label="Acceptance"
                            value={`${acceptanceRate}%`}
                            icon={CheckCircle2}
                        />
                    </div>
                </div>

                <ScorePanel member={member} />
            </CardContent>
        </Card>
    );
}

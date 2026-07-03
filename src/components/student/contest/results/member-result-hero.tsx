"use client";

import { CalendarClock, CheckCircle2, Mail, Trophy, User } from "lucide-react";
import type { ElementType } from "react";

import type { StudentMemberDetail } from "@/api/generated/model/studentMemberDetail";
import {
    formatDateTime,
    numberValue,
} from "@/components/contest/team-member-analytics/member-detail-utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MemberResultHeroProps {
    member: StudentMemberDetail;
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
    icon: ElementType;
}) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5 shadow-xs">
            <div
                className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    label === "Started" && "bg-sky-500/10 text-sky-700 dark:text-sky-300",
                    label === "Ended" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                    label === "Questions" && "bg-amber-500/10 text-amber-700 dark:text-amber-300",
                    label === "Solved" && "bg-violet-500/10 text-violet-700 dark:text-violet-300",
                )}
            >
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-xs font-bold text-foreground truncate max-w-[140px] sm:max-w-none">
                    {value}
                </p>
            </div>
        </div>
    );
}

function ScorePanel({ member }: { member: StudentMemberDetail }) {
    const attempted = numberValue(member.question_statistics?.attempted);
    const solved = numberValue(member.question_statistics?.solved);
    const score = numberValue(member.score);
    const progress = attempted > 0 ? Math.round((solved / attempted) * 100) : 0;

    return (
        <div className="flex h-full min-h-[170px] flex-col items-center justify-center rounded-xl border border-primary/20 bg-primary/5 p-4 text-center shadow-xs">
            <p className="text-[10px] font-bold uppercase text-primary">Score</p>
            <p className="mt-1 text-xs text-muted-foreground">{progress}% solved questions</p>
            <div className="mt-3 flex h-20 w-20 items-center justify-center rounded-full border border-primary/15 bg-background shadow-inner">
                <div className="text-center">
                    <p className="text-xl font-extrabold text-primary tabular-nums leading-none">
                        {score}
                    </p>
                    <p className="mt-0.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                        pts
                    </p>
                </div>
            </div>
            <Progress value={progress} max={100} className="mt-4 h-1.5 w-full" />
        </div>
    );
}

export function MemberResultHero({ member }: MemberResultHeroProps) {
    const questionStats = member.question_statistics;

    return (
        <Card className="border-border/60 bg-card shadow-sm">
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
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                            label="Questions"
                            value={`${numberValue(questionStats?.attempted)} attempted`}
                            icon={Trophy}
                        />
                        <HeroInfoTile
                            label="Solved"
                            value={numberValue(questionStats?.solved)}
                            icon={CheckCircle2}
                        />
                    </div>
                </div>

                <ScorePanel member={member} />
            </CardContent>
        </Card>
    );
}

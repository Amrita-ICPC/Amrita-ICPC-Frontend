"use client";

import { CalendarClock, CheckCircle2, Clock3, Flag, Mail, Timer, User } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import type { ContestTeamMemberDetail } from "@/api/generated/model/contestTeamMemberDetail";
import { EvaluationScope } from "@/api/generated/model/evaluationScope";
import { EvaluationDialog } from "@/components/contest/evaluation-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

import { formatDateTime, formatDuration, numberValue } from "./member-detail-utils";

interface MemberDetailHeroProps {
    member: ContestTeamMemberDetail;
    contestId: string;
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
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
            <div
                className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    label === "Started" && "bg-sky-500/10 text-sky-700 dark:text-sky-300",
                    label === "Ended" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                    label === "Extra Time" && "bg-amber-500/10 text-amber-700 dark:text-amber-300",
                    label === "Remaining" &&
                        "bg-violet-500/10 text-violet-700 dark:text-violet-300",
                )}
            >
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
            </div>
        </div>
    );
}

const chartConfig = {
    value: { label: "Submissions", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

export function MemberVerdictAnalytics({ member }: { member: ContestTeamMemberDetail }) {
    const stats = member.submission_statistics;
    const total = numberValue(stats?.total);
    const accepted = numberValue(stats?.accepted);
    const acceptance = total > 0 ? Math.round((accepted / total) * 100) : 0;
    const data = [
        { name: "Accepted", value: accepted, fill: "hsl(160 84% 39%)" },
        { name: "Wrong Answer", value: numberValue(stats?.wrong_answer), fill: "hsl(350 89% 60%)" },
        {
            name: "Runtime Error",
            value: numberValue(stats?.runtime_error),
            fill: "hsl(24 95% 53%)",
        },
        {
            name: "Compilation Error",
            value: numberValue(stats?.compilation_error),
            fill: "hsl(262 83% 58%)",
        },
        {
            name: "Time Limit",
            value: numberValue(stats?.time_limit_exceeded),
            fill: "hsl(38 92% 50%)",
        },
        {
            name: "Memory Limit",
            value: numberValue(stats?.memory_limit_exceeded),
            fill: "hsl(199 89% 48%)",
        },
        { name: "Pending", value: numberValue(stats?.pending), fill: "hsl(215 16% 47%)" },
        { name: "System Error", value: numberValue(stats?.system_error), fill: "hsl(330 81% 60%)" },
    ];
    const chartData = data.map((item) => ({
        ...item,
        shortLabel:
            item.name === "Accepted"
                ? "AC"
                : item.name === "Wrong Answer"
                  ? "WA"
                  : item.name === "Runtime Error"
                    ? "RE"
                    : item.name === "Compilation Error"
                      ? "CE"
                      : item.name === "Time Limit"
                        ? "TLE"
                        : item.name === "Memory Limit"
                          ? "MLE"
                          : item.name === "System Error"
                            ? "SE"
                            : "Pending",
    }));

    return (
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
                <h2 className="mr-1 font-semibold">Verdict analytics</h2>
                <Badge variant="outline" className="border-border/60 bg-muted/40">
                    <span className="font-semibold">{total}</span> Total
                </Badge>
                {data.map((item) => (
                    <Badge
                        key={item.name}
                        variant="outline"
                        className="border-border/60 bg-background"
                    >
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: item.fill }}
                        />
                        {item.name}{" "}
                        <span className="font-semibold">
                            {item.value}
                            {item.name === "Accepted" ? ` · ${acceptance}%` : ""}
                        </span>
                    </Badge>
                ))}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
                Submission outcomes across this member&apos;s evaluated attempts.
            </p>
            <ChartContainer
                config={chartConfig}
                className="mt-3 h-[280px] w-full"
                initialDimension={{ width: 760, height: 280 }}
            >
                <BarChart data={chartData} margin={{ top: 12, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="4 4" />
                    <XAxis dataKey="shortLabel" tickLine={false} axisLine={false} tickMargin={10} />
                    <YAxis
                        allowDecimals={false}
                        domain={[0, (max: number) => Math.max(1, max)]}
                        tickLine={false}
                        axisLine={false}
                        width={34}
                    />
                    <ChartTooltip
                        cursor={{ fill: "var(--muted)", opacity: 0.45 }}
                        content={
                            <ChartTooltipContent
                                hideLabel
                                formatter={(value, _name, item) => (
                                    <>
                                        <span className="text-muted-foreground">
                                            {item.payload?.name}
                                        </span>
                                        <span className="ml-auto font-mono font-medium">
                                            {Number(value)} submissions
                                        </span>
                                    </>
                                )}
                            />
                        }
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={44}>
                        {chartData.map((item) => (
                            <Cell key={item.name} fill={item.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ChartContainer>
        </div>
    );
}

export function MemberDetailHero({ member, contestId }: MemberDetailHeroProps) {
    return (
        <Card className="rounded-2xl border-border/60 bg-card shadow-sm">
            <CardContent className="p-5">
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
                                <div className="ml-auto">
                                    <EvaluationDialog
                                        contestId={contestId}
                                        defaultScope={EvaluationScope.STUDENTS}
                                        defaultIds={[member.contest_team_member_id]}
                                    />
                                </div>
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
                </div>
            </CardContent>
        </Card>
    );
}

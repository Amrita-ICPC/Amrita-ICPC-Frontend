"use client";

import { CalendarClock, CheckCircle2, Clock3, Flag, Mail, Timer, User } from "lucide-react";
import { Cell, Label, Pie, PieChart } from "recharts";

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
    const chartData = data
        .map((item) => ({
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
        }))
        .filter((item) => item.value > 0);

    return (
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <h2 className="font-semibold">Verdict analytics</h2>
            <p className="mt-1 text-sm text-muted-foreground">
                Submission outcomes across this member&apos;s evaluated attempts.
            </p>
            {total === 0 ? (
                <div className="mt-3 flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                    No submissions yet.
                </div>
            ) : (
                <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(360px,670px)_340px] lg:items-center lg:justify-start xl:gap-10">
                    <div className="order-2 flex flex-col gap-1.5 sm:order-1">
                        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-sm">
                            <span className="text-muted-foreground">Total</span>
                            <span className="font-semibold tabular-nums text-foreground">
                                {total}
                            </span>
                        </div>
                        {data.map((item) => (
                            <div
                                key={item.name}
                                className="flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm hover:bg-muted/40"
                            >
                                <span className="flex min-w-0 items-center gap-2 text-foreground">
                                    <span
                                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                                        style={{ backgroundColor: item.fill }}
                                    />
                                    <span className="truncate">{item.name}</span>
                                </span>
                                <span className="shrink-0 font-semibold tabular-nums text-foreground">
                                    {item.value}
                                    {item.name === "Accepted" ? ` · ${acceptance}%` : ""}
                                </span>
                            </div>
                        ))}
                    </div>
                    <ChartContainer
                        config={chartConfig}
                        className="order-1 mx-auto h-[300px] w-[300px] max-w-full shrink-0 sm:h-[340px] sm:w-[340px] lg:order-2 lg:mx-0 [&_.recharts-pie-label-text]:fill-foreground"
                        initialDimension={{ width: 340, height: 340 }}
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
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
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={86}
                                strokeWidth={5}
                            >
                                {chartData.map((item) => (
                                    <Cell key={item.name} fill={item.fill} />
                                ))}
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-3xl font-bold font-sans"
                                                    >
                                                        {total.toLocaleString()}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-muted-foreground text-sm font-medium font-sans"
                                                    >
                                                        Submissions
                                                    </tspan>
                                                </text>
                                            );
                                        }
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </div>
            )}
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

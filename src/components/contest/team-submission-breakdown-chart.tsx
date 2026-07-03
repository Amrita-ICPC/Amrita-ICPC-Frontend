"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import type { ContestTeamAnalytics } from "@/api/generated/model/contestTeamAnalytics";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

interface TeamSubmissionBreakdownChartProps {
    analytics: ContestTeamAnalytics;
    embedded?: boolean;
}

const VERDICT_COLORS = {
    accepted: "hsl(160 84% 39%)",
    wrong_answer: "hsl(350 89% 60%)",
    runtime_error: "hsl(24 95% 53%)",
    compilation_error: "hsl(262 83% 58%)",
    time_limit_exceeded: "hsl(38 92% 50%)",
    memory_limit_exceeded: "hsl(199 89% 48%)",
    pending: "hsl(215 16% 47%)",
    system_error: "hsl(330 81% 60%)",
};

const chartConfig = {
    value: { label: "Submissions", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

function numberValue(value?: number) {
    return value ?? 0;
}

export function TeamSubmissionBreakdownChart({
    analytics,
    embedded = false,
}: TeamSubmissionBreakdownChartProps) {
    const totalSubmissions = numberValue(analytics.total_submissions);
    const acceptedSubmissions = numberValue(analytics.accepted_submission);
    const acceptanceRate =
        totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

    const chartData = React.useMemo(
        () => [
            {
                id: "accepted",
                label: "Accepted",
                shortLabel: "AC",
                value: numberValue(analytics.accepted_submission),
                fill: VERDICT_COLORS.accepted,
            },
            {
                id: "wrong_answer",
                label: "Wrong Answer",
                shortLabel: "WA",
                value: numberValue(analytics.wrong_answer),
                fill: VERDICT_COLORS.wrong_answer,
            },
            {
                id: "runtime_error",
                label: "Runtime Error",
                shortLabel: "RE",
                value: numberValue(analytics.runtime_error),
                fill: VERDICT_COLORS.runtime_error,
            },
            {
                id: "compilation_error",
                label: "Compilation Error",
                shortLabel: "CE",
                value: numberValue(analytics.compilation_error),
                fill: VERDICT_COLORS.compilation_error,
            },
            {
                id: "time_limit_exceeded",
                label: "Time Limit",
                shortLabel: "TLE",
                value: numberValue(analytics.time_limit_exceeded),
                fill: VERDICT_COLORS.time_limit_exceeded,
            },
            {
                id: "memory_limit_exceeded",
                label: "Memory Limit",
                shortLabel: "MLE",
                value: numberValue(analytics.memory_limit_exceeded),
                fill: VERDICT_COLORS.memory_limit_exceeded,
            },
            {
                id: "pending",
                label: "Pending",
                shortLabel: "Pending",
                value: numberValue(analytics.pending_submission),
                fill: VERDICT_COLORS.pending,
            },
            {
                id: "system_error",
                label: "System Error",
                shortLabel: "SE",
                value: numberValue(analytics.system_error),
                fill: VERDICT_COLORS.system_error,
            },
        ],
        [analytics],
    );

    return (
        <Card
            className={cn(
                "rounded-2xl border-border/60 bg-card shadow-sm",
                embedded && "rounded-none border-0 bg-transparent shadow-none",
            )}
        >
            <CardHeader className="gap-1.5 px-0 pb-2 pt-0">
                <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="mr-1 text-base">Verdict analytics</CardTitle>
                    <Badge
                        variant="outline"
                        className="border-border/60 bg-muted/40 px-2 py-0.5 text-muted-foreground"
                    >
                        <span className="font-semibold tabular-nums text-foreground">
                            {totalSubmissions}
                        </span>
                        Total
                    </Badge>
                    {chartData.map((item) => (
                        <Badge
                            key={item.id}
                            variant="outline"
                            className="border-border/60 bg-background px-2 py-0.5 text-foreground"
                        >
                            <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: item.fill }}
                            />
                            {item.label}
                            <span className="font-semibold tabular-nums">
                                {item.value}
                                {item.id === "accepted" ? ` · ${acceptanceRate}%` : ""}
                            </span>
                        </Badge>
                    ))}
                </div>
                <CardDescription>
                    Submission outcomes across the team&apos;s evaluated attempts.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="h-[260px] w-full"
                    initialDimension={{ width: 760, height: 260 }}
                >
                    <BarChart data={chartData} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="4 4" />
                        <XAxis
                            dataKey="shortLabel"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                        />
                        <YAxis
                            allowDecimals={false}
                            domain={[0, (dataMax: number) => Math.max(1, dataMax)]}
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
                                                {item.payload?.label}
                                            </span>
                                            <span className="ml-auto font-mono font-medium text-foreground">
                                                {Number(value)} submissions
                                            </span>
                                        </>
                                    )}
                                />
                            }
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={42}>
                            {chartData.map((entry) => (
                                <Cell key={entry.id} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

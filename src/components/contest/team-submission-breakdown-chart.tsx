"use client";

import * as React from "react";
import { Cell, Label, Pie, PieChart } from "recharts";

import type { ContestTeamAnalytics } from "@/api/generated/model/contestTeamAnalytics";
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

    const allChartData = React.useMemo(
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

    const chartData = React.useMemo(
        () => allChartData.filter((item) => item.value > 0),
        [allChartData],
    );

    return (
        <Card
            className={cn(
                "rounded-2xl border-border/60 bg-card shadow-sm",
                embedded && "rounded-none border-0 bg-transparent shadow-none",
            )}
        >
            <CardHeader className="gap-1.5 px-0 pb-2 pt-0">
                <CardTitle className="text-base">Verdict analytics</CardTitle>
                <CardDescription>
                    Submission outcomes across the team&apos;s evaluated attempts.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                {totalSubmissions === 0 ? (
                    <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                        No submissions yet.
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
                        <div className="flex flex-col gap-1.5 order-2 sm:order-1">
                            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-sm">
                                <span className="text-muted-foreground">Total</span>
                                <span className="font-semibold tabular-nums text-foreground">
                                    {totalSubmissions}
                                </span>
                            </div>
                            {allChartData.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm hover:bg-muted/40"
                                >
                                    <span className="flex min-w-0 items-center gap-2 text-foreground">
                                        <span
                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                            style={{ backgroundColor: item.fill }}
                                        />
                                        <span className="truncate">{item.label}</span>
                                    </span>
                                    <span className="shrink-0 font-semibold tabular-nums text-foreground">
                                        {item.value}
                                        {item.id === "accepted" ? ` · ${acceptanceRate}%` : ""}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <ChartContainer
                            config={chartConfig}
                            className="order-1 mx-auto h-[300px] w-[300px] max-w-full shrink-0 sm:h-[340px] sm:w-[340px] lg:order-2 [&_.recharts-pie-label-text]:fill-foreground"
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
                                <Pie
                                    data={chartData}
                                    dataKey="value"
                                    nameKey="label"
                                    innerRadius={86}
                                    strokeWidth={5}
                                >
                                    {chartData.map((entry) => (
                                        <Cell key={entry.id} fill={entry.fill} />
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
                                                            {totalSubmissions.toLocaleString()}
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
            </CardContent>
        </Card>
    );
}

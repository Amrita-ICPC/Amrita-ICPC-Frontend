"use client";

import * as React from "react";
import { Cell, Label, Pie, PieChart } from "recharts";

import type { ContestAnalyticsSchema } from "@/api/generated/model";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

interface ContestAnalyticsChartProps {
    analytics: ContestAnalyticsSchema;
}

const VERDICT_COLORS = {
    accepted: "hsl(142.1 76.2% 36.3%)", // Emerald
    wrong_answer: "hsl(346.8 77.2% 49.8%)", // Red
    time_limit_exceeded: "hsl(24.6 95% 53.1%)", // Orange
    runtime_error: "hsl(47.9 95.8% 53.1%)", // Yellow
    compilation_error: "hsl(271.5 81.3% 55.9%)", // Purple
    memory_limit_exceeded: "hsl(199 89% 48%)", // Sky
    system_error: "hsl(0 0% 50%)", // Gray
};

const chartConfig = {
    accepted: { label: "Accepted", color: VERDICT_COLORS.accepted },
    wrong_answer: { label: "Wrong Answer", color: VERDICT_COLORS.wrong_answer },
    time_limit_exceeded: { label: "Time Limit", color: VERDICT_COLORS.time_limit_exceeded },
    runtime_error: { label: "Runtime Error", color: VERDICT_COLORS.runtime_error },
    compilation_error: { label: "Compilation Error", color: VERDICT_COLORS.compilation_error },
    memory_limit_exceeded: { label: "Memory Limit", color: VERDICT_COLORS.memory_limit_exceeded },
    system_error: { label: "System Error", color: VERDICT_COLORS.system_error },
} satisfies ChartConfig;

export function ContestAnalyticsChart({ analytics }: ContestAnalyticsChartProps) {
    const chartData = React.useMemo(() => {
        return [
            {
                id: "accepted",
                label: "Accepted",
                value: analytics.accepted,
                fill: VERDICT_COLORS.accepted,
            },
            {
                id: "wrong_answer",
                label: "Wrong Answer",
                value: analytics.wrong_answer,
                fill: VERDICT_COLORS.wrong_answer,
            },
            {
                id: "time_limit_exceeded",
                label: "Time Limit",
                value: analytics.time_limit_exceeded,
                fill: VERDICT_COLORS.time_limit_exceeded,
            },
            {
                id: "runtime_error",
                label: "Runtime Error",
                value: analytics.runtime_error,
                fill: VERDICT_COLORS.runtime_error,
            },
            {
                id: "compilation_error",
                label: "Compilation Error",
                value: analytics.compilation_error,
                fill: VERDICT_COLORS.compilation_error,
            },
            {
                id: "memory_limit_exceeded",
                label: "Memory Limit",
                value: analytics.memory_limit_exceeded,
                fill: VERDICT_COLORS.memory_limit_exceeded,
            },
            {
                id: "system_error",
                label: "System Error",
                value: analytics.system_error,
                fill: VERDICT_COLORS.system_error,
            },
        ].filter((item) => item.value > 0);
    }, [analytics]);

    const totalSubmissions = analytics.total_submissions || 0;

    return (
        <Card className="flex h-full flex-col border-border/60 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="items-center pb-0">
                <CardTitle>Contest Analytics</CardTitle>
                <CardDescription>Overall Submission Verdicts</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pb-0">
                {totalSubmissions === 0 ? (
                    <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                        No submissions yet.
                    </div>
                ) : (
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="label"
                                innerRadius={60}
                                strokeWidth={5}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
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
                                                        className="fill-muted-foreground text-xs font-medium font-sans"
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
                )}
            </CardContent>
            {totalSubmissions > 0 && (
                <div className="flex-col items-center gap-2 text-sm px-6 pb-6 pt-4">
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-muted-foreground border-t pt-4 border-border/40">
                        {chartData.map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
                                    <div
                                        className="h-2.5 w-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: item.fill }}
                                    />
                                    <span className="truncate">{item.label}</span>
                                </div>
                                <span className="font-semibold text-foreground shrink-0">
                                    {Math.round((item.value / totalSubmissions) * 100)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
}

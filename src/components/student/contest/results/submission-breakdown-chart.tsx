"use client";

import * as React from "react";
import { Cell, Label, Pie, PieChart } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

interface VerdictCounts {
    total_submissions?: number;
    accepted_submission?: number;
    wrong_answer?: number;
    runtime_error?: number;
    compilation_error?: number;
    time_limit_exceeded?: number;
    memory_limit_exceeded?: number;
    pending_submission?: number;
}

interface SubmissionBreakdownChartProps {
    analytics: VerdictCounts;
    title?: string;
    description?: string;
}

const VERDICT_COLORS = {
    accepted: "hsl(160 84% 39%)",
    wrong_answer: "hsl(0 84% 60%)",
    runtime_error: "hsl(24 95% 53%)",
    compilation_error: "hsl(262 83% 58%)",
    time_limit_exceeded: "hsl(38 92% 50%)",
    memory_limit_exceeded: "hsl(199 89% 48%)",
    pending: "hsl(215 16% 47%)",
};

const chartConfig = {
    accepted: { label: "Accepted", color: VERDICT_COLORS.accepted },
    wrong_answer: { label: "Wrong Answer", color: VERDICT_COLORS.wrong_answer },
    runtime_error: { label: "Runtime Error", color: VERDICT_COLORS.runtime_error },
    compilation_error: { label: "Compilation Error", color: VERDICT_COLORS.compilation_error },
    time_limit_exceeded: { label: "Time Limit", color: VERDICT_COLORS.time_limit_exceeded },
    memory_limit_exceeded: { label: "Memory Limit", color: VERDICT_COLORS.memory_limit_exceeded },
    pending: { label: "Pending", color: VERDICT_COLORS.pending },
} satisfies ChartConfig;

function numberValue(value?: number) {
    return value ?? 0;
}

export function SubmissionBreakdownChart({
    analytics,
    title = "Submission Breakdown",
    description = "Verdict distribution for your team.",
}: SubmissionBreakdownChartProps) {
    const totalSubmissions = numberValue(analytics.total_submissions);

    const chartData = React.useMemo(
        () =>
            [
                {
                    id: "accepted",
                    label: "Accepted",
                    value: numberValue(analytics.accepted_submission),
                    fill: VERDICT_COLORS.accepted,
                },
                {
                    id: "wrong_answer",
                    label: "Wrong Answer",
                    value: numberValue(analytics.wrong_answer),
                    fill: VERDICT_COLORS.wrong_answer,
                },
                {
                    id: "runtime_error",
                    label: "Runtime Error",
                    value: numberValue(analytics.runtime_error),
                    fill: VERDICT_COLORS.runtime_error,
                },
                {
                    id: "compilation_error",
                    label: "Compilation Error",
                    value: numberValue(analytics.compilation_error),
                    fill: VERDICT_COLORS.compilation_error,
                },
                {
                    id: "time_limit_exceeded",
                    label: "Time Limit",
                    value: numberValue(analytics.time_limit_exceeded),
                    fill: VERDICT_COLORS.time_limit_exceeded,
                },
                {
                    id: "memory_limit_exceeded",
                    label: "Memory Limit",
                    value: numberValue(analytics.memory_limit_exceeded),
                    fill: VERDICT_COLORS.memory_limit_exceeded,
                },
                {
                    id: "pending",
                    label: "Pending",
                    value: numberValue(analytics.pending_submission),
                    fill: VERDICT_COLORS.pending,
                },
            ].filter((item) => item.value > 0),
        [analytics],
    );

    const dominantVerdict = chartData[0];

    return (
        <Card className="h-full border-border/70 bg-card shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex h-full flex-col px-4 pb-4">
                {totalSubmissions === 0 ? (
                    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/20 p-6 text-center">
                        <p className="text-sm font-medium text-foreground">No submissions yet</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Verdict analytics will appear after your team submits solutions.
                        </p>
                    </div>
                ) : (
                    <>
                        <ChartContainer
                            config={chartConfig}
                            className="mx-auto aspect-square h-[230px] max-h-[230px] w-full [&_.recharts-pie-sector]:transition-opacity [&_.recharts-pie-sector:hover]:opacity-90"
                            initialDimension={{ width: 260, height: 230 }}
                        >
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            hideLabel
                                            nameKey="id"
                                            formatter={(value, name, item) => {
                                                const numericValue = Number(value);
                                                const percentage =
                                                    totalSubmissions > 0
                                                        ? Math.round(
                                                              (numericValue / totalSubmissions) *
                                                                  100,
                                                          )
                                                        : 0;

                                                return (
                                                    <>
                                                        <span className="text-muted-foreground">
                                                            {item.payload?.label ?? name}
                                                        </span>
                                                        <span className="ml-auto font-mono font-medium text-foreground tabular-nums">
                                                            {numericValue} ({percentage}%)
                                                        </span>
                                                    </>
                                                );
                                            }}
                                        />
                                    }
                                />
                                <Pie
                                    data={chartData}
                                    dataKey="value"
                                    nameKey="id"
                                    innerRadius={62}
                                    outerRadius={92}
                                    paddingAngle={chartData.length > 1 ? 3 : 0}
                                    cornerRadius={8}
                                    strokeWidth={3}
                                >
                                    {chartData.map((entry) => (
                                        <Cell key={entry.id} fill={entry.fill} />
                                    ))}
                                    <Label
                                        content={({ viewBox }) => {
                                            if (
                                                !viewBox ||
                                                !("cx" in viewBox) ||
                                                !("cy" in viewBox)
                                            ) {
                                                return null;
                                            }

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
                                                        className="fill-foreground text-3xl font-bold"
                                                    >
                                                        {totalSubmissions}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 22}
                                                        className="fill-muted-foreground text-xs font-medium"
                                                    >
                                                        total
                                                    </tspan>
                                                </text>
                                            );
                                        }}
                                    />
                                </Pie>
                            </PieChart>
                        </ChartContainer>

                        <div className="mt-1 rounded-lg border border-border/60 bg-muted/20 p-3">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                                        Leading verdict
                                    </p>
                                    <p className="text-sm font-semibold text-foreground">
                                        {dominantVerdict?.label ?? "No verdicts"}
                                    </p>
                                </div>
                                <p className="text-xl font-bold tabular-nums">
                                    {dominantVerdict
                                        ? Math.round(
                                              (dominantVerdict.value / totalSubmissions) * 100,
                                          )
                                        : 0}
                                    %
                                </p>
                            </div>

                            <div className="grid gap-2">
                                {chartData.map((item) => {
                                    const percentage = Math.round(
                                        (item.value / totalSubmissions) * 100,
                                    );

                                    return (
                                        <div
                                            key={item.id}
                                            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-xs"
                                        >
                                            <div className="flex min-w-0 items-center gap-2">
                                                <span
                                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                    style={{ backgroundColor: item.fill }}
                                                />
                                                <span className="truncate text-muted-foreground">
                                                    {item.label}
                                                </span>
                                            </div>
                                            <div
                                                className={cn(
                                                    "flex items-center gap-2 font-medium tabular-nums",
                                                    item.id === "accepted"
                                                        ? "text-emerald-600 dark:text-emerald-400"
                                                        : "text-foreground",
                                                )}
                                            >
                                                <span>{item.value}</span>
                                                <span className="text-muted-foreground">
                                                    {percentage}%
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

"use client";

import { Activity, ArrowRight } from "lucide-react";
import Link from "next/link";

import type { ProblemHealthSchema } from "@/api/generated/model";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface ProblemHealthCardProps {
    problems: ProblemHealthSchema[];
    contestId: string;
}

const DIFFICULTY_MAP: Record<string, { label: string; className: string }> = {
    EASY: {
        label: "Easy",
        className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    MEDIUM: {
        label: "Medium",
        className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    },
    HARD: {
        label: "Hard",
        className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    },
};

export function ProblemHealthCard({ problems, contestId }: ProblemHealthCardProps) {
    return (
        <Card className="flex h-full flex-col border-border/60 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                        <Activity className="h-4 w-4" />
                    </div>
                    Problem Health
                </CardTitle>
                <Link
                    href={`/contest/${contestId}/questions`}
                    className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-violet-500 transition-colors"
                >
                    View All Problems
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[60px] py-3 pl-6 pr-4">#</TableHead>
                                <TableHead className="w-[200px] py-3 px-4">Problem Title</TableHead>
                                <TableHead className="py-3 px-4">Difficulty</TableHead>
                                <TableHead className="text-center py-3 px-4">Attempts</TableHead>
                                <TableHead className="text-center py-3 px-4">Accepted</TableHead>
                                <TableHead className="text-center py-3 px-4">Errors</TableHead>
                                <TableHead className="w-[150px] text-right py-3 pl-4 pr-6">
                                    Acceptance Rate
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {problems.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="h-32 text-center text-muted-foreground py-4 px-6"
                                    >
                                        No problem data available.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                problems.slice(0, 5).map((problem, index) => {
                                    const diffConfig = DIFFICULTY_MAP[problem.difficulty] || {
                                        label: problem.difficulty,
                                        className:
                                            "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
                                    };

                                    return (
                                        <TableRow
                                            key={problem.id}
                                            className="group transition-colors hover:bg-muted/20"
                                        >
                                            <TableCell className="py-4 pl-6 pr-4 font-mono text-muted-foreground text-sm">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium text-foreground py-4 px-4">
                                                {problem.title}
                                            </TableCell>
                                            <TableCell className="py-4 px-4">
                                                <Badge
                                                    variant="outline"
                                                    className={`${diffConfig.className} font-medium border text-xs shadow-none capitalize`}
                                                >
                                                    {diffConfig.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center text-muted-foreground py-4 px-4">
                                                {problem.attempts}
                                            </TableCell>
                                            <TableCell className="text-center font-semibold text-emerald-600 dark:text-emerald-500 py-4 px-4">
                                                {problem.accepted}
                                            </TableCell>
                                            <TableCell className="text-center font-semibold text-red-600 dark:text-red-500 py-4 px-4">
                                                {problem.system_errors}
                                            </TableCell>
                                            <TableCell className="py-4 pl-4 pr-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-sm font-medium text-foreground min-w-[3rem]">
                                                        {Math.round(problem.acceptance_rate)}%
                                                    </span>
                                                    <Progress
                                                        value={problem.acceptance_rate}
                                                        className="h-2 w-16"
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

"use client";

import { ArrowRight, Trophy } from "lucide-react";
import Link from "next/link";

import type { TeamPerformanceSchema } from "@/api/generated/model";
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

interface TeamPerformanceCardProps {
    teamPerformance: TeamPerformanceSchema[];
    contestId: string;
}

export function TeamPerformanceCard({ teamPerformance, contestId }: TeamPerformanceCardProps) {
    return (
        <Card className="flex h-full flex-col border-border/60 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                        <Trophy className="h-4 w-4" />
                    </div>
                    Team Performance
                </CardTitle>
                <Link
                    href={`/contest/${contestId}/teams`}
                    className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-blue-500 transition-colors"
                >
                    View All Teams
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[60px] py-3 pl-6 pr-4">#</TableHead>
                                <TableHead className="w-[200px] py-3 px-4">Team Name</TableHead>
                                <TableHead className="text-center py-3 px-4">Solved</TableHead>
                                <TableHead className="text-center py-3 px-4">Attempted</TableHead>
                                <TableHead className="w-[150px] text-right py-3 pl-4 pr-6">
                                    Acceptance Rate
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teamPerformance.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="h-32 text-center text-muted-foreground py-4 px-6"
                                    >
                                        No team data available.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                teamPerformance.slice(0, 5).map((team, index) => (
                                    <TableRow
                                        key={team.id}
                                        className="group transition-colors hover:bg-muted/20"
                                    >
                                        <TableCell className="py-4 pl-6 pr-4 font-mono text-muted-foreground text-sm">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="font-medium text-foreground py-4 px-4">
                                            {team.name}
                                        </TableCell>
                                        <TableCell className="text-center font-semibold text-emerald-600 dark:text-emerald-500 py-4 px-4">
                                            {team.solved}
                                        </TableCell>
                                        <TableCell className="text-center text-muted-foreground py-4 px-4">
                                            {team.attempted}
                                        </TableCell>
                                        <TableCell className="py-4 pl-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-sm font-medium text-foreground min-w-[3rem]">
                                                    {Math.round(team.acceptance_rate)}%
                                                </span>
                                                <Progress
                                                    value={team.acceptance_rate}
                                                    className="h-2 w-16"
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

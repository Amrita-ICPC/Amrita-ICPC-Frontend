"use client";

import { ArrowRight, Send } from "lucide-react";
import Link from "next/link";

import type { RecentSubmissionSchema } from "@/api/generated/model";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface RecentSubmissionsCardProps {
    submissions: RecentSubmissionSchema[];
    contestId: string;
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
    AC: {
        label: "Accepted",
        className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    WA: { label: "Wrong Answer", className: "bg-red-500/10 text-red-500 border-red-500/20" },
    TLE: {
        label: "Time Limit",
        className: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    },
    RE: {
        label: "Runtime Error",
        className: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    },
    CE: {
        label: "Compilation Error",
        className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    },
    MLE: {
        label: "Memory Limit",
        className: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    },
    SYSTEM_ERROR: {
        label: "System Error",
        className: "bg-red-500/10 text-red-500 border-red-500/20",
    },
    QUEUED: { label: "Queued", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    RUNNING: { label: "Running", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    PENDING: {
        label: "Pending",
        className: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    },
};

function formatTimeAgo(dateString: string) {
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const timeDiff = new Date(dateString).getTime() - Date.now();

    const minutes = Math.round(timeDiff / (1000 * 60));
    if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");

    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 24) return rtf.format(hours, "hour");

    const days = Math.round(hours / 24);
    return rtf.format(days, "day");
}

export function RecentSubmissionsCard({ submissions, contestId }: RecentSubmissionsCardProps) {
    return (
        <Card className="flex h-full flex-col border-border/60 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Send className="h-4 w-4" />
                    </div>
                    Recent Submissions
                </CardTitle>
                <Link
                    href={`/contest/${contestId}/submissions/all`} // Path to be updated later
                    className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                    View All Submissions
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[60px] py-3 pl-6 pr-4">#</TableHead>
                                <TableHead className="w-[200px] py-3 px-4">User / Team</TableHead>
                                <TableHead className="py-3 px-4">Question</TableHead>
                                <TableHead className="py-3 px-4">Language</TableHead>
                                <TableHead className="py-3 px-4">Status</TableHead>
                                <TableHead className="text-right py-3 pl-4 pr-6">Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-32 text-center text-muted-foreground py-4 px-6"
                                    >
                                        No recent submissions found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                submissions.slice(0, 10).map((submission, index) => {
                                    const statusKey = submission.status || "";
                                    const statusConfig = STATUS_MAP[statusKey] || {
                                        label: statusKey,
                                        className:
                                            "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
                                    };

                                    return (
                                        <TableRow
                                            key={submission.id}
                                            className="group transition-colors hover:bg-muted/20"
                                        >
                                            <TableCell className="py-4 pl-6 pr-4 font-mono text-muted-foreground text-sm">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="py-4 px-4">
                                                <div className="font-medium text-foreground">
                                                    {submission.team
                                                        ? submission.team.name
                                                        : submission.submitted_by.name}
                                                </div>
                                                {submission.team && (
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                        by {submission.submitted_by.name}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium py-4 px-4">
                                                {submission.question.title}
                                            </TableCell>
                                            <TableCell className="py-4 px-4">
                                                <span className="text-sm text-muted-foreground font-mono">
                                                    {submission.language}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4 px-4">
                                                <Badge
                                                    variant="outline"
                                                    className={`${statusConfig.className} font-medium border text-xs shadow-none`}
                                                >
                                                    {statusConfig.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 pl-4 pr-6 text-right text-sm text-muted-foreground">
                                                {formatTimeAgo(submission.created_at)}
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

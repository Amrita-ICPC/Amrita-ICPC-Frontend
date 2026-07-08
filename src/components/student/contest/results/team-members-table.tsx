"use client";

import { Users } from "lucide-react";
import { useRouter } from "next/navigation";

import type { StudentTeamMemberSummary } from "@/api/generated/model/studentTeamMemberSummary";
import {
    formatDateTime,
    numberValue,
} from "@/components/contest/team-member-analytics/member-detail-utils";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface TeamMembersTableProps {
    contestId: string;
    members: StudentTeamMemberSummary[];
    canViewSubmissions: boolean;
}

function ParticipationBadge({ participated }: { participated?: boolean }) {
    return participated ? (
        <Badge className="border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Participated
        </Badge>
    ) : (
        <Badge variant="outline" className="border-transparent bg-muted text-muted-foreground">
            Not started
        </Badge>
    );
}

export function TeamMembersTable({
    contestId,
    members,
    canViewSubmissions,
}: TeamMembersTableProps) {
    const router = useRouter();

    if (!members.length) {
        return (
            <Card className="border-border/70 bg-card shadow-sm">
                <CardContent className="p-0">
                    <EmptyState
                        icon={Users}
                        title="No member results found"
                        description="Member activity will appear once results are available."
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/70 bg-card shadow-sm">
            <CardHeader className="border-b border-border/70 px-5 py-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>
                            Participation, score, and session window for each accepted team member.
                        </CardDescription>
                    </div>
                    <Badge
                        variant="outline"
                        className="w-fit border-transparent bg-muted text-muted-foreground"
                    >
                        {members.length} members
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40">
                            <TableHead className="h-12 px-5">Member</TableHead>
                            <TableHead className="text-center">Score</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Session Window</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.map((member, index) => {
                            const row = (
                                <>
                                    <TableCell className="px-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {member.name}
                                                    </span>
                                                    {member.is_leader ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-transparent bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                                        >
                                                            Leader
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {member.email}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="inline-flex min-w-12 justify-center rounded-md bg-primary/10 px-2.5 py-1 text-sm font-bold tabular-nums text-primary">
                                            {numberValue(member.score)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <ParticipationBadge participated={member.is_participated} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1 text-sm leading-relaxed">
                                            <p className="font-medium">
                                                {formatDateTime(member.started_at)}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                Ended {formatDateTime(member.ended_at)}
                                            </p>
                                        </div>
                                    </TableCell>
                                </>
                            );

                            return (
                                <TableRow
                                    key={member.contest_team_member_id}
                                    className={cn(
                                        "h-[72px] transition-colors border-border/60",
                                        canViewSubmissions && "cursor-pointer hover:bg-muted/40",
                                    )}
                                    onClick={() => {
                                        if (canViewSubmissions) {
                                            router.push(
                                                `/student/contest/${contestId}/results/members/${member.contest_team_member_id}`,
                                            );
                                        }
                                    }}
                                >
                                    {row}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

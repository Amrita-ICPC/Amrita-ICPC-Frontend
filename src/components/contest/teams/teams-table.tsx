"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useContestTeams, useTeamMembers } from "@/query/team-query";
import { TeamRowActions } from "./team-row-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Users2 } from "lucide-react";
import { TeamApprovalStatus, TeamStatus } from "@/api/generated/model";

function TeamLeader({
    contestId,
    teamId,
    leaderId,
}: {
    contestId: string;
    teamId: string;
    leaderId: string | null;
}) {
    const { data: membersResponse, isLoading } = useTeamMembers(contestId, teamId);

    if (!leaderId) return <span className="text-muted-foreground">N/A</span>;
    if (isLoading) return <Skeleton className="h-4 w-24" />;

    const leader = membersResponse?.data?.find(
        (member) => member.id === leaderId || member.user_id === leaderId,
    );
    return <>{leader ? leader.name : "N/A"}</>;
}

interface TeamsTableProps {
    contestId: string;
    search: string;
    approvalStatus: "all" | "approved" | "pending";
    teamStatus: "all" | "DRAFT" | "CONFIRMED";
}

export function TeamsTable({ contestId, search, approvalStatus, teamStatus }: TeamsTableProps) {
    const { data, isLoading, error } = useContestTeams(contestId, {
        search: search,
        team_status: teamStatus === "all" ? undefined : teamStatus,
    });

    if (isLoading) {
        return (
            <div className="space-y-2 mt-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
            </Alert>
        );
    }

    const filteredTeams = (data?.data ?? []).filter((team) => {
        if (approvalStatus === "all") return true;
        if (approvalStatus === "approved")
            return team.approval_status === TeamApprovalStatus.APPROVED;
        if (approvalStatus === "pending")
            return team.approval_status === TeamApprovalStatus.WAITING;
        return false;
    });

    if (filteredTeams.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-xl bg-muted/20 mt-4">
                <Users2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold text-foreground/80">No Teams Found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                    No teams match the current filters.
                </p>
            </div>
        );
    }

    return (
        <div className="border rounded-md mt-4 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="pl-6">Team Name</TableHead>
                        <TableHead>Leader</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Approval</TableHead>
                        <TableHead className="text-right pr-6">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredTeams.map((team) => (
                        <TableRow key={team.id}>
                            <TableCell className="font-medium pl-6">{team.name}</TableCell>
                            <TableCell>
                                <TeamLeader
                                    contestId={contestId}
                                    teamId={team.id}
                                    leaderId={team.leader_id}
                                />
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        team.status === TeamStatus.CONFIRMED
                                            ? "outline"
                                            : "secondary"
                                    }
                                >
                                    {team.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        team.approval_status === TeamApprovalStatus.APPROVED
                                            ? "default"
                                            : "secondary"
                                    }
                                    className={
                                        team.approval_status === TeamApprovalStatus.APPROVED
                                            ? "bg-green-600"
                                            : ""
                                    }
                                >
                                    {team.approval_status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                                <TeamRowActions team={team} contestId={contestId} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

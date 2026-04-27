"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamActionBar } from "@/components/contest/teams/team-action-bar";
import { TeamsTable } from "@/components/contest/teams/teams-table";
import { useDebounce } from "@/hooks/use-debounce";

export function ContestTeamsPage({ contestId }: { contestId: string }) {
    const [search, setSearch] = useState("");
    const [approvalStatus, setApprovalStatus] = useState<"approved" | "pending" | "all">("all");
    const [teamStatus, setTeamStatus] = useState<"all" | "DRAFT" | "CONFIRMED">("all");
    const debouncedSearch = useDebounce(search, 300);

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Teams</CardTitle>
                    <CardDescription>
                        View, approve, and manage all teams participating in this contest.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TeamActionBar
                        search={search}
                        onSearchChange={setSearch}
                        approvalStatus={approvalStatus}
                        onApprovalStatusChange={setApprovalStatus}
                        teamStatus={teamStatus}
                        onTeamStatusChange={setTeamStatus}
                        contestId={contestId}
                    />
                    <TeamsTable
                        contestId={contestId}
                        search={debouncedSearch}
                        approvalStatus={approvalStatus}
                        teamStatus={teamStatus}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

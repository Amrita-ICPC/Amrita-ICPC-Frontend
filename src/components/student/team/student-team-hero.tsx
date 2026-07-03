"use client";

import { Mail, UserCog, Users } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";

import { StudentCreateTeamDialog } from "./student-create-team-dialog";
import { StudentInvitationsDrawer } from "./student-invitations-drawer";
import { StudentSearchTeamDialog } from "./student-search-team-dialog";

interface StudentTeamHeroProps {
    totalTeams: number;
    pendingInvitations?: number;
    pendingRequests?: number;
    isLoading?: boolean;
}

export function StudentTeamHero({
    totalTeams,
    pendingInvitations = 0,
    pendingRequests = 0,
    isLoading = false,
}: StudentTeamHeroProps) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 border-b border-primary/15 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Teams</h1>
                    <p className="text-sm text-muted-foreground">
                        Create, manage, and collaborate with your ICPC teams.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <StudentSearchTeamDialog />
                    <StudentInvitationsDrawer pendingCount={pendingInvitations} />
                    <StudentCreateTeamDialog />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                    icon={Users}
                    label="Total Teams"
                    value={isLoading ? "—" : totalTeams}
                    color="primary"
                    themed
                />
                <StatCard
                    icon={Mail}
                    label="Pending Invitations"
                    value={isLoading ? "—" : pendingInvitations}
                    color="emerald"
                />
                <StatCard
                    icon={UserCog}
                    label="Join Requests to Review"
                    value={isLoading ? "—" : pendingRequests}
                    color="amber"
                />
            </div>
        </div>
    );
}

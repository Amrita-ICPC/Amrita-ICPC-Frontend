"use client";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    Crown,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Clock,
    UserPlus,
    Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContestTeamCardsProps {
    participation: any;
    isStatusLoading: boolean;
    contest: {
        name: string;
        min_team_size: number;
        max_team_size: number;
    };
}

function TeamRegistrationProgressCard({ participation }: { participation: any }) {
    if (!participation || !participation.team) {
        return null;
    }

    const team = participation.team;
    const minTeamSize = team.min_team_size ?? 1;
    const maxTeamSize = team.max_team_size ?? 1;
    const memberCount = team.member_count ?? 0;
    const membersList = team.members ?? [];

    const minSizeMet = memberCount >= minTeamSize;
    const confirmedCount = membersList.filter((m: any) => m.confirmed).length;
    const totalCount = membersList.length;
    const allConfirmed = totalCount > 0 && confirmedCount === totalCount;
    const isApproved = !!participation.registration_status?.approved;
    const completionPercentage = Math.max(0, Math.min(100, team.completion_percentage ?? 0));

    return (
        <Card className="border-border/60 shadow-sm overflow-hidden bg-card">
            <CardHeader className="pb-3 border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/30">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    Registration Progress
                </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
                {/* Completion Indicator */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-muted-foreground uppercase tracking-wider text-[10px]">
                            Formation Status
                        </span>
                        <span className="text-primary font-black text-sm">
                            {Math.round(completionPercentage)}%
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-primary h-full rounded-full transition-all duration-500 bg-gradient-to-r from-primary to-indigo-500"
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Checklist Rules */}
                <div className="space-y-3 pt-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                        Requirements Checklist
                    </span>
                    <div className="space-y-2.5">
                        {/* Requirement 1: Min Size */}
                        <div className="flex items-start gap-3 p-2.5 border border-border/40 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl">
                            {minSizeMet ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            )}
                            <div className="flex flex-col leading-tight">
                                <span
                                    className={cn(
                                        "text-xs font-bold",
                                        minSizeMet ? "text-foreground" : "text-muted-foreground",
                                    )}
                                >
                                    Minimum size met ({minTeamSize} members)
                                </span>
                                <span className="text-[10px] text-muted-foreground mt-0.5 font-semibold">
                                    Current size: {memberCount} of {maxTeamSize} max
                                </span>
                            </div>
                        </div>

                        {/* Requirement 2: Confirmed Members */}
                        <div className="flex items-start gap-3 p-2.5 border border-border/40 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl">
                            {allConfirmed ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                                <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            )}
                            <div className="flex flex-col leading-tight">
                                <span
                                    className={cn(
                                        "text-xs font-bold",
                                        allConfirmed ? "text-foreground" : "text-muted-foreground",
                                    )}
                                >
                                    All members joined
                                </span>
                                <span className="text-[10px] text-muted-foreground mt-0.5 font-semibold">
                                    Confirmed: {confirmedCount} of {totalCount} members
                                </span>
                            </div>
                        </div>

                        {/* Requirement 3: Approval */}
                        <div className="flex items-start gap-3 p-2.5 border border-border/40 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl">
                            {isApproved ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                                <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            )}
                            <div className="flex flex-col leading-tight">
                                <span
                                    className={cn(
                                        "text-xs font-bold",
                                        isApproved ? "text-foreground" : "text-muted-foreground",
                                    )}
                                >
                                    Instructor approval
                                </span>
                                <span className="text-[10px] text-muted-foreground mt-0.5 font-semibold">
                                    {isApproved
                                        ? "Approved and ready to play"
                                        : "Awaiting approval review"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

interface OverallRegistrationProgressCardProps {
    contest:
        | {
              team_count?: number;
              max_teams?: number | null;
          }
        | null
        | undefined;
}

export function OverallRegistrationProgressCard({ contest }: OverallRegistrationProgressCardProps) {
    if (!contest) return null;

    const teamCount = contest.team_count ?? 0;
    const maxTeams = contest.max_teams;
    const hasLimit = maxTeams !== null && maxTeams !== undefined && maxTeams > 0;
    const fillPercentage = hasLimit ? Math.min(100, Math.max(0, (teamCount / maxTeams) * 100)) : 0;
    const slotsRemaining = hasLimit ? Math.max(0, maxTeams - teamCount) : 0;

    return (
        <Card className="border-border/60 shadow-sm overflow-hidden bg-card">
            <CardHeader className="pb-3 border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/30 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500 animate-bounce" />
                    Overall Registrations
                </CardTitle>
                {hasLimit ? (
                    <Badge
                        variant="outline"
                        className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary border-primary/20"
                    >
                        {slotsRemaining} Slots Left
                    </Badge>
                ) : (
                    <Badge
                        variant="outline"
                        className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400"
                    >
                        Open Slots
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="p-5 space-y-4">
                {hasLimit ? (
                    <div className="space-y-3">
                        <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-black text-foreground tracking-tight">
                                    {teamCount}
                                </span>
                                <span className="text-sm font-bold text-muted-foreground">
                                    / {maxTeams} Teams
                                </span>
                            </div>
                            <span className="text-xs font-bold text-muted-foreground">
                                {Math.round(fillPercentage)}% Filled
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden border border-border/50">
                            <div
                                className="bg-primary h-full rounded-full transition-all duration-500 bg-gradient-to-r from-violet-600 to-indigo-600"
                                style={{ width: `${fillPercentage}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 p-3.5 border border-border/40 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Users className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-2xl font-black text-foreground tracking-tight">
                                {teamCount}
                            </span>
                            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mt-0.5">
                                Active Teams Registered
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function ContestTeamCards({
    participation,
    isStatusLoading,
    contest,
}: ContestTeamCardsProps) {
    if (isStatusLoading) {
        return (
            <Card className="border-border/60 shadow-sm overflow-hidden bg-card">
                <CardContent className="p-6 flex items-center justify-center text-xs text-muted-foreground h-40">
                    Loading team status...
                </CardContent>
            </Card>
        );
    }

    if (participation?.registration_status?.registered && participation.team) {
        return (
            <>
                {/* Registration Progress Card */}
                <TeamRegistrationProgressCard participation={participation} />

                {/* Your Team Roster Card */}
                <Card className="border-border/60 shadow-sm overflow-hidden bg-card">
                    <CardHeader className="pb-3 border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/30 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            Your Team
                        </CardTitle>
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5",
                                participation.registration_status.approved
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400"
                                    : "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400",
                            )}
                        >
                            {participation.registration_status.approved
                                ? "Approved"
                                : "Pending Review"}
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-5 space-y-5">
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-foreground tracking-tight leading-none">
                                {participation.team.name}
                            </h3>
                            <span className="text-[11px] font-semibold text-muted-foreground">
                                Registered for {contest.name}
                            </span>
                        </div>

                        {/* Members List */}
                        <div className="space-y-2.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                                Team Members
                            </span>
                            <div className="space-y-2">
                                {participation.team.members.map((member: any) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-2.5 border border-border/40 hover:border-border rounded-xl transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                {member.name
                                                    .split(" ")
                                                    .map((n: string) => n[0])
                                                    .join("")
                                                    .slice(0, 2)
                                                    .toUpperCase()}
                                            </div>
                                            <div className="flex flex-col leading-none">
                                                <span className="text-xs font-bold text-foreground">
                                                    {member.name}
                                                </span>
                                                <span className="text-[9px] text-muted-foreground font-semibold mt-0.5 capitalize flex items-center gap-1">
                                                    {member.role === "LEADER" ? (
                                                        <>
                                                            <Crown className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                                                            Leader
                                                        </>
                                                    ) : (
                                                        "Member"
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0",
                                                member.confirmed
                                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/10 dark:bg-emerald-500/20 dark:text-emerald-400"
                                                    : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
                                            )}
                                        >
                                            {member.confirmed ? "Joined" : "Pending"}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </>
        );
    }

    /* User is not registered in any team */
    return (
        <Card className="shadow-sm border-border/60 overflow-hidden bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/30">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Team Status
                </CardTitle>
                <Badge
                    variant="outline"
                    className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-rose-500/10 text-rose-600 border-rose-500/20"
                >
                    Not Registered
                </Badge>
            </CardHeader>
            <CardContent className="p-6">
                <div className="py-8 flex flex-col items-center justify-center text-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                        <Users className="h-6 w-6 animate-pulse" />
                    </div>
                    <h4 className="text-sm font-bold text-foreground">
                        You haven&apos;t joined a team yet
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-[220px] leading-normal font-semibold">
                        This contest requires a team of{" "}
                        {contest.min_team_size === contest.max_team_size
                            ? `${contest.min_team_size}`
                            : `${contest.min_team_size} - ${contest.max_team_size}`}{" "}
                        members to participate.
                    </p>
                    <Button
                        asChild
                        size="sm"
                        className="mt-4 w-full font-bold shadow-md shadow-primary/15 hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                    >
                        <Link href="/student/teams">
                            <UserPlus className="h-4 w-4" />
                            Join or Create Team
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

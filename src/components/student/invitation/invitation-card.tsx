"use client";

import { Trophy, Users, CheckCircle2, XCircle, Loader2, AlertTriangle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { UserInvitationResponse } from "@/api/generated/model";
import {
    useUpdateContestTeamMemberStatusApiV1StudentsContestsContestIdTeamsContestTeamIdMembersContestTeamMemberIdStatusPatch,
    getGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGetQueryKey,
} from "@/api/generated/students/students";
import { getGetMyTeamInvitationsApiV1UsersMeTeamInvitationGetQueryKey } from "@/api/generated/users/users";
import { ContestTeamMemberStatus } from "@/api/generated/model";

interface StudentInvitationCardProps {
    invitation: UserInvitationResponse;
}

export function StudentInvitationCard({ invitation }: StudentInvitationCardProps) {
    const queryClient = useQueryClient();
    const { contest, team } = invitation;

    const { mutate: updateInvitation, isPending } =
        useUpdateContestTeamMemberStatusApiV1StudentsContestsContestIdTeamsContestTeamIdMembersContestTeamMemberIdStatusPatch(
            {
                mutation: {
                    onSuccess: (_, variables) => {
                        const action = variables.data.status.toLowerCase();
                        toast.success(`Successfully ${action} invitation for ${team.name}!`);
                        queryClient.invalidateQueries({
                            queryKey:
                                getGetMyTeamInvitationsApiV1UsersMeTeamInvitationGetQueryKey(),
                        });
                        if (contest.id) {
                            queryClient.invalidateQueries({
                                queryKey:
                                    getGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGetQueryKey(
                                        contest.id,
                                    ),
                            });
                        }
                    },
                    onError: (error: any) => {
                        const message =
                            error?.response?.data?.message || "Failed to respond to invitation.";
                        toast.error(message);
                    },
                },
            },
        );

    const handleAccept = () => {
        updateInvitation({
            contestId: invitation.contest.id,
            contestTeamId: invitation.team.id,
            contestTeamMemberId: invitation.id,
            data: {
                status: ContestTeamMemberStatus.ACCEPTED,
            },
        });
    };

    const handleReject = () => {
        updateInvitation({
            contestId: invitation.contest.id,
            contestTeamId: invitation.team.id,
            contestTeamMemberId: invitation.id,
            data: {
                status: ContestTeamMemberStatus.REJECTED,
            },
        });
    };

    return (
        <Card className="overflow-hidden border border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-300 bg-card flex flex-col h-full">
            {/* Header section with gradient */}
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent p-6 pb-4 border-b border-border/40">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500">
                                <Trophy className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                                Contest Invitation
                            </span>
                        </div>
                        <CardTitle className="text-lg font-black tracking-tight text-foreground mt-2">
                            {contest.name}
                        </CardTitle>
                    </div>
                    {contest.image && (
                        <div className="h-12 w-12 shrink-0 rounded-xl overflow-hidden border border-border/60">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={contest.image}
                                alt={contest.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-6 flex-1 flex flex-col space-y-6">
                {/* Description */}
                {contest.description && (
                    <div className="space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/80">
                            Contest Info
                        </span>
                        <p className="text-xs text-muted-foreground/90 font-medium leading-relaxed">
                            {contest.description}
                        </p>
                    </div>
                )}

                {/* Team Info */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/30 pb-2">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/80">
                                Team Invited To
                            </span>
                            <h4 className="font-extrabold text-base text-foreground">
                                {team.name}
                            </h4>
                        </div>
                        <div className="text-right space-y-0.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/80 block">
                                Roster Size
                            </span>
                            <Badge
                                variant="outline"
                                className="text-xs font-bold border-border/60 bg-muted/30"
                            >
                                {team.joined_members_count} / {contest.max_team_size} members
                            </Badge>
                        </div>
                    </div>

                    {/* Member Roster List */}
                    <div className="space-y-2.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/80 block">
                            Current Members
                        </span>
                        <div className="grid grid-cols-1 gap-2">
                            {team.members.map((member) => {
                                const isJoined = member.status === "ACCEPTED";
                                const isInvited = member.status === "INVITED";
                                const isLeader = member.role === "LEADER";

                                return (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-2.5 rounded-lg border border-border/30 bg-slate-500/5 hover:bg-slate-500/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 border border-border bg-background shadow-sm">
                                                <AvatarFallback className="text-[10px] font-black bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 dark:from-slate-800 dark:to-slate-900 dark:text-slate-350">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="text-left">
                                                <p className="text-xs font-bold text-foreground leading-none">
                                                    {member.name}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    {member.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            {isLeader && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-purple-500/10 text-purple-500 dark:bg-purple-500/20 border border-purple-500/20">
                                                    Leader
                                                </span>
                                            )}
                                            {isJoined ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 border border-emerald-500/20">
                                                    Joined
                                                </span>
                                            ) : isInvited ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 border border-amber-500/20">
                                                    Pending
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-slate-500/10 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                    {member.status.toLowerCase()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Constraint warnings */}
                {!invitation.can_accept_invitation && (
                    <div className="flex gap-2.5 p-3.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-semibold leading-relaxed">
                        <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                        <span>
                            {invitation.reason ||
                                "You cannot accept this invitation. You may already be registered in another team for this contest or the team is currently full."}
                        </span>
                    </div>
                )}

                {/* Divider Line */}
                <div className="border-t border-border/40 pt-4 mt-auto" />

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleReject}
                        disabled={isPending}
                        className="flex-1 h-10 font-extrabold border-rose-500/30 hover:bg-rose-500/10 text-rose-500 hover:text-rose-600 transition-all cursor-pointer rounded-xl"
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <XCircle className="h-4 w-4 mr-1.5" />
                                Reject
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={handleAccept}
                        disabled={isPending || !invitation.can_accept_invitation}
                        className="flex-1 h-10 font-extrabold bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition-all cursor-pointer rounded-xl shadow-md shadow-emerald-600/10"
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                Accept
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

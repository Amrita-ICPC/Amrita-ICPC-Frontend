"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    useGetTeamInvitationsApiV1StudentsTeamsInvitationsGet,
    useAcceptOrRejectTeamInvitationApiV1StudentsTeamsInvitationsIdPatch,
    getGetMyTeamsApiV1StudentsTeamsGetQueryKey,
    getGetTeamInvitationsApiV1StudentsTeamsInvitationsGetQueryKey,
} from "@/api/generated/students/students";
import type { StudentTeamCardResponse, StudentTeamInvitationResponse } from "@/api/generated/model";
import { Check, X, Loader2, Users, Inbox, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface StudentTeamRequestsDialogProps {
    team: StudentTeamCardResponse;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function getInitials(name: string): string {
    return name
        ? name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "?";
}

function getDecoratedBg(title: string): string {
    const charCode = title.charCodeAt(0) || 0;
    const colors = [
        "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/10 text-white",
        "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/10 text-white",
        "bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/10 text-white",
        "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-500/10 text-white",
        "bg-gradient-to-br from-amber-500 to-orange-600 shadow-orange-500/10 text-white",
    ];
    return colors[charCode % colors.length];
}

export function StudentTeamRequestsDialog({
    team,
    open,
    onOpenChange,
}: StudentTeamRequestsDialogProps) {
    const [actionId, setActionId] = useState<string | null>(null);

    // Fetch pending join requests specifically for this team
    const {
        data: requestsResponse,
        isLoading,
        isError,
        refetch,
    } = useGetTeamInvitationsApiV1StudentsTeamsInvitationsGet(
        {
            status: "PENDING",
            type: "REQUEST",
            team_id: team.id,
            sent: false,
        },
        {
            query: {
                enabled: open,
            },
        },
    );

    // Mutation to accept or reject requests
    const { mutate: respondToInvitation, isPending: isUpdating } =
        useAcceptOrRejectTeamInvitationApiV1StudentsTeamsInvitationsIdPatch({
            mutation: {
                meta: {
                    successMessage: "Join request processed successfully!",
                    invalidateKeys: [
                        getGetMyTeamsApiV1StudentsTeamsGetQueryKey(),
                        getGetTeamInvitationsApiV1StudentsTeamsInvitationsGetQueryKey({
                            status: "PENDING",
                            type: "REQUEST",
                            team_id: team.id,
                            sent: false,
                        }),
                    ],
                },
                onSuccess: () => {
                    refetch();
                    setActionId(null);
                },
                onError: () => {
                    setActionId(null);
                },
            },
        });

    const requests = requestsResponse?.data?.invitations || [];

    const handleApprove = (invitation: StudentTeamInvitationResponse) => {
        setActionId(invitation.id);
        respondToInvitation({
            id: invitation.id,
            data: { status: "ACCEPTED" },
        });
    };

    const handleReject = (invitation: StudentTeamInvitationResponse) => {
        setActionId(invitation.id);
        respondToInvitation({
            id: invitation.id,
            data: { status: "REJECTED" },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] gap-0 p-0 overflow-hidden border border-border/80 shadow-2xl bg-card rounded-xl">
                <DialogHeader className="p-6 pb-4 border-b border-border/40 text-left">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold leading-tight">
                                Join Requests &mdash; {team.title}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5 font-semibold">
                                Approve or reject requests from students wanting to join your
                                roster.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 py-4 flex flex-col min-h-[250px] max-h-[400px] overflow-hidden">
                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2">
                            <Loader2 className="h-6 w-6 text-primary animate-spin" />
                            <span className="text-xs text-muted-foreground font-bold">
                                Loading pending requests...
                            </span>
                        </div>
                    ) : isError ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 border border-destructive/20 bg-destructive/5 rounded-xl p-4">
                            <AlertCircle className="h-6 w-6 text-destructive" />
                            <h4 className="text-xs font-black text-destructive uppercase tracking-wider">
                                Error Fetching Requests
                            </h4>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => refetch()}
                                className="mt-1 text-xs font-extrabold h-8"
                            >
                                Retry
                            </Button>
                        </div>
                    ) : requests.length > 0 ? (
                        <ScrollArea className="flex-1 pr-2">
                            <div className="space-y-3 py-1">
                                {requests.map((request) => {
                                    const name = request.invited_by_name || "Anonymous User";
                                    const subtitle = "Wants to join your team";
                                    const initials = getInitials(name);
                                    const avatarBg = getDecoratedBg(name);
                                    const isCurrentAction = actionId === request.id;
                                    const isAnyActionPending = isUpdating || actionId !== null;

                                    return (
                                        <div
                                            key={request.id}
                                            className="group flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-slate-50/20 dark:bg-slate-900/10 hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="h-9 w-9 rounded-lg border border-black/5 dark:border-white/5 shrink-0 shadow-sm">
                                                    <AvatarFallback
                                                        className={`text-xs font-black rounded-lg ${avatarBg}`}
                                                    >
                                                        {initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="text-left min-w-0 leading-tight">
                                                    <h4 className="text-xs font-black text-foreground truncate max-w-[180px]">
                                                        {name}
                                                    </h4>
                                                    <p className="text-[10px] text-muted-foreground font-semibold truncate max-w-[180px] mt-0.5">
                                                        {subtitle}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 ml-4">
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    disabled={isAnyActionPending}
                                                    onClick={() => handleReject(request)}
                                                    className="h-8 w-8 rounded-lg border-border hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 cursor-pointer"
                                                    title="Reject Request"
                                                >
                                                    {isCurrentAction && !isUpdating ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <X className="h-4 w-4 stroke-[2.5]" />
                                                    )}
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    disabled={isAnyActionPending}
                                                    onClick={() => handleApprove(request)}
                                                    className="h-8 w-8 rounded-lg shadow-sm cursor-pointer"
                                                    title="Approve Request"
                                                >
                                                    {isCurrentAction && isUpdating ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Check className="h-4 w-4 stroke-[2.5]" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-2.5">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/10 blur-lg rounded-full scale-110" />
                                <div className="relative h-10 w-10 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center text-primary">
                                    <Inbox className="h-5 w-5 stroke-[1.8]" />
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-xs font-bold text-foreground">
                                    No Pending Requests
                                </h4>
                                <p className="text-[10px] text-muted-foreground font-semibold max-w-[240px] leading-normal">
                                    When other students request to join your public team, they will
                                    appear here.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-border/40 flex justify-end">
                    <Button
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="font-bold text-xs"
                    >
                        Close Window
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

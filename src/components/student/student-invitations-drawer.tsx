"use client";

import { useState } from "react";
import { Mail, Inbox, Check, X, Users, Calendar, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    useGetTeamInvitationsApiV1StudentsTeamsInvitationsGet,
    useUpdateTeamInvitationStatusApiV1StudentsTeamsInvitationsIdPatch,
    getGetMyTeamsApiV1StudentsTeamsGetQueryKey,
    getGetTeamInvitationsApiV1StudentsTeamsInvitationsGetQueryKey,
    getSearchTeamsByNameApiV1StudentsTeamsSearchGetQueryKey,
} from "@/api/generated/students/students";
import type { StudentTeamInvitationResponse, InvitationType } from "@/api/generated/model";

interface StudentInvitationsDrawerProps {
    pendingCount?: number;
}

// Visual helper for team logo fallback background
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

function formatTimeAgo(dateString: string): string {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return "just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days === 1) return "yesterday";
        if (days < 30) return `${days}d ago`;

        return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
        return "recently";
    }
}

export function StudentInvitationsDrawer({ pendingCount = 0 }: StudentInvitationsDrawerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [actionId, setActionId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<InvitationType>("INVITE");

    // Fetch pending received invitations (type = INVITE)
    const {
        data: invitesData,
        isLoading: isInvitesLoading,
        isError: isInvitesError,
        refetch: refetchInvites,
    } = useGetTeamInvitationsApiV1StudentsTeamsInvitationsGet(
        { status: "PENDING", type: "INVITE" },
        {
            query: {
                enabled: true,
            },
        },
    );

    // Fetch pending sent requests (type = REQUEST)
    const {
        data: requestsData,
        isLoading: isRequestsLoading,
        isError: isRequestsError,
        refetch: refetchRequests,
    } = useGetTeamInvitationsApiV1StudentsTeamsInvitationsGet(
        { status: "PENDING", type: "REQUEST", sent: true },
        {
            query: {
                enabled: isOpen,
            },
        },
    );

    const invites = invitesData?.data?.invitations || [];
    const requests = requestsData?.data?.invitations || [];

    const invitations = activeTab === "INVITE" ? invites : requests;
    const isLoading = activeTab === "INVITE" ? isInvitesLoading : isRequestsLoading;
    const isError = activeTab === "INVITE" ? isInvitesError : isRequestsError;
    const refetch = activeTab === "INVITE" ? refetchInvites : refetchRequests;

    const displayPendingCount = invitesData ? invites.length : pendingCount;

    // Respond to invitation mutation
    const { mutate: respondToInvitation, isPending: isUpdating } =
        useUpdateTeamInvitationStatusApiV1StudentsTeamsInvitationsIdPatch({
            mutation: {
                meta: {
                    successMessage: "Response submitted successfully!",
                    invalidateKeys: [
                        getGetMyTeamsApiV1StudentsTeamsGetQueryKey(),
                        getGetTeamInvitationsApiV1StudentsTeamsInvitationsGetQueryKey({
                            status: "PENDING",
                            type: "INVITE",
                        }),
                        getGetTeamInvitationsApiV1StudentsTeamsInvitationsGetQueryKey({
                            status: "PENDING",
                            type: "REQUEST",
                            sent: true,
                        }),
                        getSearchTeamsByNameApiV1StudentsTeamsSearchGetQueryKey(),
                    ],
                },
            },
        });

    const handleApprove = (invitation: StudentTeamInvitationResponse) => {
        setActionId(invitation.id);
        respondToInvitation(
            {
                id: invitation.id,
                data: { status: "ACCEPTED" },
            },
            {
                onSuccess: () => {
                    setActionId(null);
                },
                onError: () => {
                    setActionId(null);
                },
            },
        );
    };

    const handleReject = (invitation: StudentTeamInvitationResponse) => {
        setActionId(invitation.id);
        respondToInvitation(
            {
                id: invitation.id,
                data: { status: "REJECTED" },
            },
            {
                onSuccess: () => {
                    setActionId(null);
                },
                onError: () => {
                    setActionId(null);
                },
            },
        );
    };

    const handleCancel = (invitation: StudentTeamInvitationResponse) => {
        setActionId(invitation.id);
        respondToInvitation(
            {
                id: invitation.id,
                data: { status: "CANCELLED" },
            },
            {
                onSuccess: () => {
                    setActionId(null);
                },
                onError: () => {
                    setActionId(null);
                },
            },
        );
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    className="relative bg-slate-900/60 backdrop-blur-md text-slate-100 hover:text-white gap-1.5 h-9 px-4.5 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 transition-all font-extrabold text-xs rounded-lg cursor-pointer"
                >
                    <Mail className="h-4 w-4 stroke-[2]" />
                    Invitations
                    {displayPendingCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white border-2 border-slate-950 shadow-md animate-pulse">
                            {displayPendingCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>

            <SheetContent
                side="right"
                className="w-full sm:max-w-md flex flex-col h-full bg-card p-0"
            >
                <SheetHeader className="p-6 pb-4 border-b border-border/40 text-left">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <SheetTitle className="text-lg font-bold leading-tight">
                                Team Invitations
                            </SheetTitle>
                            <SheetDescription className="text-xs text-muted-foreground mt-0.5 font-semibold">
                                Filtered to pending invitations only. Accept to join their roster.
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-hidden p-6 py-4 flex flex-col gap-4">
                    {/* Glassmorphic Segmented Tabs */}
                    <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-inner">
                        <button
                            onClick={() => setActiveTab("INVITE")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-black transition-all duration-300 cursor-pointer ${
                                activeTab === "INVITE"
                                    ? "bg-white dark:bg-slate-800 text-primary shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Mail className="h-3.5 w-3.5" />
                            Received {displayPendingCount > 0 && `(${displayPendingCount})`}
                        </button>
                        <button
                            onClick={() => setActiveTab("REQUEST")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-black transition-all duration-300 cursor-pointer ${
                                activeTab === "REQUEST"
                                    ? "bg-white dark:bg-slate-800 text-primary shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Users className="h-3.5 w-3.5" />
                            Sent Requests {requests.length > 0 && `(${requests.length})`}
                        </button>
                    </div>
                    {isLoading ? (
                        /* Loading Skeletons */
                        <div className="flex-1 space-y-4 py-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="border border-border/40 rounded-2xl p-4 bg-slate-50/5 dark:bg-slate-900/5 space-y-3 animate-pulse"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 bg-muted rounded-xl" />
                                        <div className="space-y-1.5 flex-1">
                                            <div className="h-3 w-1/3 bg-muted rounded-md" />
                                            <div className="h-2.5 w-1/2 bg-muted rounded-md" />
                                        </div>
                                    </div>
                                    <div className="h-10 bg-muted rounded-xl w-full" />
                                </div>
                            ))}
                        </div>
                    ) : isError ? (
                        /* Error State */
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3 border border-destructive/20 bg-destructive/5 rounded-2xl">
                            <AlertCircle className="h-8 w-8 text-destructive animate-bounce" />
                            <h4 className="text-xs font-black text-destructive uppercase tracking-widest">
                                Failed to Load
                            </h4>
                            <p className="text-xs text-muted-foreground font-semibold max-w-xs">
                                There was an issue fetching your team invitations. Please try again.
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => refetch()}
                                className="mt-2 text-xs font-extrabold h-8"
                            >
                                Retry Connection
                            </Button>
                        </div>
                    ) : invitations.length > 0 ? (
                        /* List of Pending Invitation Cards */
                        <ScrollArea className="flex-1 pr-2">
                            <div className="space-y-4 py-2">
                                {invitations.map((invitation) => {
                                    const firstLetter = invitation.title
                                        ? invitation.title.charAt(0).toUpperCase()
                                        : "?";
                                    const decoratedBg = getDecoratedBg(invitation.title);
                                    const createdTimeAgo = formatTimeAgo(invitation.created_at);
                                    const isCurrentAction = actionId === invitation.id;
                                    const isAnyActionPending = isUpdating || actionId !== null;

                                    return (
                                        <div
                                            key={invitation.id}
                                            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-slate-50/20 dark:bg-slate-900/10 hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-all duration-300 p-4.5 flex flex-col gap-4.5 shadow-xs hover:shadow-sm"
                                        >
                                            {/* Top Metadata Row */}
                                            <div className="flex items-start gap-3.5">
                                                {invitation.logo ? (
                                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-950 dark:bg-slate-900 flex items-center justify-center border border-slate-800/40">
                                                        <img
                                                            src={invitation.logo}
                                                            alt={invitation.title}
                                                            className="h-full w-full object-cover rounded-xl"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${decoratedBg}`}
                                                    >
                                                        {firstLetter}
                                                    </div>
                                                )}

                                                <div className="flex-1 min-w-0 text-left leading-tight">
                                                    <h3 className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">
                                                        {invitation.title}
                                                    </h3>
                                                    <p className="text-[10px] text-muted-foreground font-semibold truncate mt-0.5 flex items-center gap-1.5">
                                                        {activeTab === "INVITE" ? (
                                                            <span>
                                                                Invited by{" "}
                                                                <strong className="text-foreground/90 font-bold">
                                                                    {invitation.invited_by_name}
                                                                </strong>
                                                            </span>
                                                        ) : (
                                                            <span>Requested to join</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Description (if present) */}
                                            {invitation.description && (
                                                <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed text-left line-clamp-2">
                                                    {invitation.description}
                                                </p>
                                            )}

                                            {/* Badges and Info Column */}
                                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-muted-foreground border-t border-border/30 pt-3">
                                                <Badge
                                                    variant="secondary"
                                                    className="h-5 gap-1 font-extrabold text-[9px] uppercase tracking-wider bg-primary/5 text-primary border-primary/10"
                                                >
                                                    <Users className="h-3 w-3 stroke-[2.5]" />
                                                    {invitation.member_count} members
                                                </Badge>

                                                <Badge
                                                    variant="outline"
                                                    className="h-5 gap-1 font-extrabold text-[9px] uppercase tracking-wider bg-slate-500/5 text-slate-500 border-slate-500/10 ml-auto"
                                                >
                                                    <Calendar className="h-3 w-3 stroke-[2.5]" />
                                                    {createdTimeAgo}
                                                </Badge>
                                            </div>

                                            {/* Bottom Interactive Decision Buttons */}
                                            {activeTab === "INVITE" ? (
                                                <div className="grid grid-cols-2 gap-3.5 pt-1">
                                                    <Button
                                                        onClick={() => handleReject(invitation)}
                                                        disabled={isAnyActionPending}
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8.5 rounded-xl text-xs font-black gap-1.5 border-border hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 cursor-pointer transition-colors"
                                                    >
                                                        {isCurrentAction && isUpdating ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <X className="h-3.5 w-3.5 stroke-[2.5]" />
                                                        )}
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleApprove(invitation)}
                                                        disabled={isAnyActionPending}
                                                        size="sm"
                                                        className="h-8.5 rounded-xl text-xs font-black gap-1.5 shadow-md shadow-primary/10 hover:shadow-lg transition-all cursor-pointer"
                                                    >
                                                        {isCurrentAction && isUpdating ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                                                        )}
                                                        Approve
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 pt-1 w-full">
                                                    <div className="flex-1 flex h-8.5 items-center justify-center gap-1.5 rounded-xl text-[10px] font-black bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 border border-amber-500/10 transition-all truncate px-2.5">
                                                        <span className="relative flex h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                                                        </span>
                                                        Pending Approval
                                                    </div>
                                                    <Button
                                                        onClick={() => handleCancel(invitation)}
                                                        disabled={isAnyActionPending}
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8.5 rounded-xl text-xs font-black gap-1.5 border-border hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 cursor-pointer transition-colors shrink-0"
                                                    >
                                                        {isCurrentAction && isUpdating ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <X className="h-3.5 w-3.5 stroke-[2.5]" />
                                                        )}
                                                        Cancel Request
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    ) : (
                        /* Empty State */
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full scale-110" />
                                <div className="relative h-12 w-12 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center text-primary">
                                    <Inbox className="h-6 w-6 stroke-[1.8]" />
                                </div>
                            </div>
                            <div className="space-y-1 max-w-xs">
                                <h4 className="text-sm font-bold text-foreground">
                                    {activeTab === "INVITE"
                                        ? "No Pending Invitations"
                                        : "No Sent Requests"}
                                </h4>
                                <p className="text-xs text-muted-foreground font-semibold leading-normal">
                                    {activeTab === "INVITE"
                                        ? "When other students invite you to join their team, they will show up here."
                                        : "When you request to join another team, your pending requests will show up here."}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="p-6 border-t border-border/40 flex flex-col gap-2">
                    <Button
                        onClick={() => setIsOpen(false)}
                        className="w-full font-bold shadow-md shadow-primary/15 hover:shadow-lg transition-all"
                    >
                        Close Panel
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

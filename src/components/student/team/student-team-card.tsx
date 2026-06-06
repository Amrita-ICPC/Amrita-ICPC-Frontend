"use client";

import { Copy, Loader2, LogOut, MoreVertical, Pencil, Trash2, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import type { StudentTeamCardResponse } from "@/api/generated/model";
import {
    getGetMyTeamsApiV1StudentsTeamsGetQueryKey,
    getSearchTeamsByNameApiV1StudentsTeamsSearchGetQueryKey,
    useDeleteTeamApiV1StudentsTeamsTeamIdDelete,
    useGetTeamInvitationsApiV1StudentsTeamsInvitationsGet,
    useLeaveTeamMeApiV1StudentsTeamsTeamIdMembersMeDelete,
} from "@/api/generated/students/students";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { StudentEditTeamDialog } from "./student-edit-team-dialog";
import { StudentInviteDialog } from "./student-invite-dialog";
import { StudentTeamRequestsDialog } from "./student-team-requests-dialog";

interface StudentTeamCardProps {
    team: StudentTeamCardResponse;
    onViewDetails: (teamId: string) => void;
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
        if (days < 30) return `${days}d ago`;

        return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
        return "recently";
    }
}

function getDecoratedBg(title: string): string {
    const charCode = title.charCodeAt(0) || 0;
    const colors = [
        "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/10 text-white",
        "bg-gradient-to-br from-pink-500 to-rose-600 shadow-rose-500/10 text-white",
        "bg-gradient-to-br from-sky-500 to-blue-600 shadow-blue-500/10 text-white",
        "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-teal-500/10 text-white",
        "bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-fuchsia-500/10 text-white",
        "bg-gradient-to-br from-amber-500 to-orange-600 shadow-orange-500/10 text-white",
    ];
    return colors[charCode % colors.length];
}

export function StudentTeamCard({ team, onViewDetails }: StudentTeamCardProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [isRequestsDialogOpen, setIsRequestsDialogOpen] = useState(false);
    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
    const timeAgo = formatTimeAgo(team.updated_at);

    // Fetch pending requests count (only for leaders)
    const { data: requestsData } = useGetTeamInvitationsApiV1StudentsTeamsInvitationsGet(
        {
            status: "PENDING",
            type: "REQUEST",
            team_id: team.id,
            sent: false,
        },
        {
            query: {
                enabled: team.is_leader,
            },
        },
    );
    const pendingRequestsCount = requestsData?.data?.invitations?.length || 0;

    const firstLetter = team.title ? team.title.charAt(0).toUpperCase() : "?";
    const logoBg = getDecoratedBg(team.title);

    const { mutate: deleteTeam, isPending: isDeleting } =
        useDeleteTeamApiV1StudentsTeamsTeamIdDelete({
            mutation: {
                meta: {
                    successMessage: `Team "${team.title}" deleted successfully!`,
                    invalidateKeys: [
                        getGetMyTeamsApiV1StudentsTeamsGetQueryKey(),
                        getSearchTeamsByNameApiV1StudentsTeamsSearchGetQueryKey(),
                    ],
                },
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                },
            },
        });

    const handleDelete = () => {
        deleteTeam({ teamId: team.id });
    };

    const { mutate: leaveTeam, isPending: isLeaving } =
        useLeaveTeamMeApiV1StudentsTeamsTeamIdMembersMeDelete({
            mutation: {
                meta: {
                    successMessage: `Successfully left team "${team.title}"`,
                    invalidateKeys: [
                        getGetMyTeamsApiV1StudentsTeamsGetQueryKey(),
                        getSearchTeamsByNameApiV1StudentsTeamsSearchGetQueryKey(),
                    ],
                },
                onSuccess: () => {
                    setIsLeaveDialogOpen(false);
                },
            },
        });

    const handleLeave = () => {
        leaveTeam({ teamId: team.id });
    };

    return (
        <Card className="overflow-hidden border border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-300 bg-card">
            <CardContent className="p-5 flex flex-col h-full space-y-5">
                {/* Header Section */}
                <div className="flex items-start gap-4">
                    {/* Logo/Icon Container */}
                    {team.logo ? (
                        <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-950 dark:bg-slate-900 flex items-center justify-center border border-slate-800/60 shadow-inner">
                            <img
                                src={team.logo}
                                alt={team.title}
                                className="h-full w-full object-cover rounded-xl"
                            />
                        </div>
                    ) : (
                        <div
                            className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center font-black text-lg shadow-sm border border-black/5 dark:border-white/5 ${logoBg}`}
                        >
                            {firstLetter}
                        </div>
                    )}

                    {/* Team title & details */}
                    <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-extrabold text-base text-foreground leading-tight">
                                {team.title}
                            </h3>
                            {team.is_leader ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-purple-500/10 text-purple-400 dark:bg-purple-500/20 border border-purple-500/20">
                                    Leader
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                    Member
                                </span>
                            )}
                            {team.is_public ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-sky-500/10 text-sky-500 dark:bg-sky-500/20 border border-sky-500/20">
                                    🌐 Public
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 border border-amber-500/20">
                                    🔒 Private
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-semibold">
                            Updated {timeAgo}
                        </p>
                    </div>
                </div>

                {/* Team Description */}
                <div className="flex-1">
                    <p className="text-xs text-muted-foreground/90 font-semibold line-clamp-2 min-h-[2rem]">
                        {team.description ||
                            "No description provided. Add one to describe your team."}
                    </p>
                </div>

                {/* Team Code Display */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/30 px-3 py-1.5 rounded-lg border border-border/30">
                    <span className="text-[10px] font-bold text-muted-foreground/85 uppercase tracking-wider">
                        Team Code
                    </span>
                    <div className="flex items-center gap-1.5">
                        <code className="text-xs font-bold font-mono tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 select-all">
                            {team.code}
                        </code>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(team.code);
                                toast.success("Team code copied to clipboard!");
                            }}
                            className="text-muted-foreground hover:text-primary transition-colors cursor-pointer p-0.5 rounded hover:bg-muted"
                            title="Copy Code"
                        >
                            <Copy className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* Roster & Members Info */}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center -space-x-2 overflow-hidden">
                        {team.members.map((member) => (
                            <Avatar
                                key={member.id}
                                className="h-7 w-7 border-2 border-card bg-muted shadow-sm"
                            >
                                <AvatarImage src={member.logo || undefined} alt={member.name} />
                                <AvatarFallback className="text-[9px] font-black bg-gradient-to-br from-slate-100 to-slate-250 text-slate-700 dark:from-slate-800 dark:to-slate-900 dark:text-slate-350">
                                    {member.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                        {team.has_more_members && (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-700 dark:text-slate-300 shadow-sm">
                                +{team.more_members_count}
                            </div>
                        )}
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {team.member_count} {team.member_count === 1 ? "Member" : "Members"}
                    </span>
                </div>

                {/* Divider Line */}
                <div className="border-t border-border/40" />

                {/* Join Requests or Role block */}
                <div className="flex items-center justify-between">
                    {team.is_leader ? (
                        <>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/80">
                                Join Requests
                            </span>
                            <div className="inline-flex">
                                {pendingRequestsCount > 0 ? (
                                    <Button
                                        onClick={() => setIsRequestsDialogOpen(true)}
                                        variant="outline"
                                        size="sm"
                                        className="h-7.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider gap-1.5 bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-500 transition-all cursor-pointer animate-pulse"
                                    >
                                        <UserPlus className="h-3.5 w-3.5" />
                                        {pendingRequestsCount} Pending
                                    </Button>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-500/10 text-slate-500 border border-slate-500/10">
                                        0 Pending
                                    </span>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/80">
                                Role
                            </span>
                            <div className="inline-flex">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 border border-indigo-500/20">
                                    Team Member
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Actions Bottom Bar */}
                <div className="flex items-center gap-2 pt-2">
                    <Button
                        onClick={() => onViewDetails(team.id)}
                        className="flex-1 h-9 px-5 font-extrabold border border-transparent bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 cursor-pointer"
                    >
                        View Team
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 shrink-0 border-border hover:bg-muted/50 rounded-xl cursor-pointer"
                            >
                                <MoreVertical className="h-4.5 w-4.5 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            {team.is_leader ? (
                                <>
                                    <DropdownMenuItem
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            setIsInviteDialogOpen(true);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Invite Student
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            setIsEditDialogOpen(true);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit Team
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            setIsLeaveDialogOpen(true);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Leave Team
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            setIsDeleteDialogOpen(true);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Team
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <DropdownMenuItem
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        setIsLeaveDialogOpen(true);
                                    }}
                                    className="cursor-pointer"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Leave Team
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Invite Student Dialog */}
                    <StudentInviteDialog
                        team={team}
                        open={isInviteDialogOpen}
                        onOpenChange={setIsInviteDialogOpen}
                    />

                    {/* Edit Team Dialog */}
                    <StudentEditTeamDialog
                        team={team}
                        open={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                    />

                    {/* Manage Requests Dialog */}
                    <StudentTeamRequestsDialog
                        team={team}
                        open={isRequestsDialogOpen}
                        onOpenChange={setIsRequestsDialogOpen}
                    />

                    {/* Delete Confirmation Alert Dialog */}
                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Team</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete the team{" "}
                                    <strong className="text-foreground">
                                        &quot;{team.title}&quot;
                                    </strong>
                                    ? This action is permanent and cannot be undone. All members
                                    will be removed.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="min-w-[100px]"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="mr-2.5 h-4 w-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        "Delete Team"
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Leave Confirmation Alert Dialog */}
                    <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Leave Team</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {team.is_leader ? (
                                        <>
                                            Are you sure you want to leave the team{" "}
                                            <strong className="text-foreground">
                                                &quot;{team.title}&quot;
                                            </strong>
                                            ? As the leader, leaving the team will dissolve it, and
                                            all members will lose access. This action is permanent
                                            and cannot be undone.
                                        </>
                                    ) : (
                                        <>
                                            Are you sure you want to leave the team{" "}
                                            <strong className="text-foreground">
                                                &quot;{team.title}&quot;
                                            </strong>
                                            ? You will lose access to this team and will need to
                                            request to join again or be invited by the leader to
                                            return.
                                        </>
                                    )}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isLeaving}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    variant="destructive"
                                    onClick={handleLeave}
                                    disabled={isLeaving}
                                    className="min-w-[100px]"
                                >
                                    {isLeaving ? (
                                        <>
                                            <Loader2 className="mr-2.5 h-4 w-4 animate-spin" />
                                            Leaving...
                                        </>
                                    ) : (
                                        "Leave Team"
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}

export function StudentTeamRowItem({ team, onViewDetails }: StudentTeamCardProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [isRequestsDialogOpen, setIsRequestsDialogOpen] = useState(false);
    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
    const timeAgo = formatTimeAgo(team.updated_at);

    // Fetch pending requests count (only for leaders)
    const { data: requestsData } = useGetTeamInvitationsApiV1StudentsTeamsInvitationsGet(
        {
            status: "PENDING",
            type: "REQUEST",
            team_id: team.id,
            sent: false,
        },
        {
            query: {
                enabled: team.is_leader,
            },
        },
    );
    const pendingRequestsCount = requestsData?.data?.invitations?.length || 0;

    const firstLetter = team.title ? team.title.charAt(0).toUpperCase() : "?";
    const logoBg = getDecoratedBg(team.title);

    const { mutate: deleteTeam, isPending: isDeleting } =
        useDeleteTeamApiV1StudentsTeamsTeamIdDelete({
            mutation: {
                meta: {
                    successMessage: `Team "${team.title}" deleted successfully!`,
                    invalidateKeys: [getGetMyTeamsApiV1StudentsTeamsGetQueryKey()],
                },
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                },
            },
        });

    const handleDelete = () => {
        deleteTeam({ teamId: team.id });
    };

    const { mutate: leaveTeam, isPending: isLeaving } =
        useLeaveTeamMeApiV1StudentsTeamsTeamIdMembersMeDelete({
            mutation: {
                meta: {
                    successMessage: `Successfully left team "${team.title}"`,
                    invalidateKeys: [getGetMyTeamsApiV1StudentsTeamsGetQueryKey()],
                },
                onSuccess: () => {
                    setIsLeaveDialogOpen(false);
                },
            },
        });

    const handleLeave = () => {
        leaveTeam({ teamId: team.id });
    };

    return (
        <tr className="group border-b border-border/40 hover:bg-muted/30 transition-colors">
            {/* Team Identity Column */}
            <td className="py-4 px-4 align-middle">
                <div className="flex items-center gap-3">
                    {team.logo ? (
                        <div className="h-9 w-9 shrink-0 rounded-lg bg-slate-950 dark:bg-slate-900 flex items-center justify-center border border-slate-800/40">
                            <img
                                src={team.logo}
                                alt={team.title}
                                className="h-full w-full object-cover rounded-lg"
                            />
                        </div>
                    ) : (
                        <div
                            className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center font-black text-sm ${logoBg}`}
                        >
                            {firstLetter}
                        </div>
                    )}
                    <div className="space-y-0.5 text-left">
                        <div className="flex items-center gap-2">
                            <span
                                className="font-extrabold text-sm text-foreground hover:text-primary transition-colors cursor-pointer"
                                onClick={() => onViewDetails(team.id)}
                            >
                                {team.title}
                            </span>
                            {team.is_leader ? (
                                <span className="inline-flex px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wide bg-purple-500/10 text-purple-400 dark:bg-purple-500/20">
                                    Leader
                                </span>
                            ) : (
                                <span className="inline-flex px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wide bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                    Member
                                </span>
                            )}
                            {team.is_public ? (
                                <span className="inline-flex px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wide bg-sky-500/10 text-sky-500 dark:bg-sky-500/20">
                                    🌐 Public
                                </span>
                            ) : (
                                <span className="inline-flex px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wide bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
                                    🔒 Private
                                </span>
                            )}
                        </div>
                        <span className="text-[9px] text-muted-foreground block font-medium">
                            Updated {timeAgo}
                        </span>
                    </div>
                </div>
            </td>

            {/* Description Column */}
            <td className="py-4 px-4 align-middle hidden md:table-cell text-left max-w-xs truncate text-xs text-muted-foreground font-semibold">
                {team.description || "No description provided."}
            </td>

            {/* Code Column */}
            <td className="py-4 px-4 align-middle">
                <div className="flex items-center gap-1.5">
                    <code className="text-xs font-bold font-mono tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 select-all">
                        {team.code}
                    </code>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(team.code);
                            toast.success("Team code copied to clipboard!");
                        }}
                        className="text-muted-foreground hover:text-primary transition-colors cursor-pointer p-0.5 rounded hover:bg-muted"
                        title="Copy Code"
                    >
                        <Copy className="h-3.5 w-3.5" />
                    </button>
                </div>
            </td>

            {/* Members Stack Column */}
            <td className="py-4 px-4 align-middle">
                <div className="flex items-center gap-2.5">
                    <div className="flex items-center -space-x-1.5 overflow-hidden">
                        {team.members.map((member) => (
                            <Avatar
                                key={member.id}
                                className="h-6 w-6 border border-card bg-muted shadow-sm"
                            >
                                <AvatarImage src={member.logo || undefined} alt={member.name} />
                                <AvatarFallback className="text-[8px] font-bold bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 dark:from-slate-800 dark:to-slate-900 dark:text-slate-300">
                                    {member.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                        {team.has_more_members && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-card bg-slate-100 dark:bg-slate-800 text-[8px] font-black text-slate-700 dark:text-slate-300 shadow-sm">
                                +{team.more_members_count}
                            </div>
                        )}
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">
                        {team.member_count} members
                    </span>
                </div>
            </td>

            {/* Join Requests Column */}
            <td className="py-4 px-4 align-middle">
                <div className="flex justify-start">
                    {team.is_leader ? (
                        pendingRequestsCount > 0 ? (
                            <Button
                                onClick={() => setIsRequestsDialogOpen(true)}
                                variant="outline"
                                size="sm"
                                className="h-7 px-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider gap-1 bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-500 transition-all cursor-pointer animate-pulse"
                            >
                                <UserPlus className="h-3 w-3" />
                                {pendingRequestsCount} Pending
                            </Button>
                        ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-500/10 text-slate-500 border border-slate-500/10">
                                0 Pending
                            </span>
                        )
                    ) : (
                        <span className="text-[10px] text-muted-foreground font-semibold">
                            &mdash;
                        </span>
                    )}
                </div>
            </td>

            {/* Actions Column */}
            <td className="py-4 px-4 align-middle text-right">
                <div className="flex items-center justify-end gap-2">
                    <Button
                        onClick={() => onViewDetails(team.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 font-bold text-xs hover:bg-muted text-primary hover:text-primary-hover cursor-pointer"
                    >
                        View
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:bg-muted cursor-pointer"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            {team.is_leader ? (
                                <>
                                    <DropdownMenuItem
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            setIsInviteDialogOpen(true);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Invite Student
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            setIsEditDialogOpen(true);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit Team
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            setIsLeaveDialogOpen(true);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Leave Team
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            setIsDeleteDialogOpen(true);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Team
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <DropdownMenuItem
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        setIsLeaveDialogOpen(true);
                                    }}
                                    className="cursor-pointer"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Leave Team
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Invite Student Dialog */}
                    <StudentInviteDialog
                        team={team}
                        open={isInviteDialogOpen}
                        onOpenChange={setIsInviteDialogOpen}
                    />

                    {/* Edit Team Dialog */}
                    <StudentEditTeamDialog
                        team={team}
                        open={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                    />

                    {/* Manage Requests Dialog */}
                    <StudentTeamRequestsDialog
                        team={team}
                        open={isRequestsDialogOpen}
                        onOpenChange={setIsRequestsDialogOpen}
                    />

                    {/* Delete Confirmation Alert Dialog */}
                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Team</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete the team{" "}
                                    <strong className="text-foreground">
                                        &quot;{team.title}&quot;
                                    </strong>
                                    ? This action is permanent and cannot be undone. All members
                                    will be removed.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="min-w-[100px]"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="mr-2.5 h-4 w-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        "Delete Team"
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Leave Confirmation Alert Dialog */}
                    <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Leave Team</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {team.is_leader ? (
                                        <>
                                            Are you sure you want to leave the team{" "}
                                            <strong className="text-foreground">
                                                &quot;{team.title}&quot;
                                            </strong>
                                            ? As the leader, leaving the team will dissolve it, and
                                            all members will lose access. This action is permanent
                                            and cannot be undone.
                                        </>
                                    ) : (
                                        <>
                                            Are you sure you want to leave the team{" "}
                                            <strong className="text-foreground">
                                                &quot;{team.title}&quot;
                                            </strong>
                                            ? You will lose access to this team and will need to
                                            request to join again or be invited by the leader to
                                            return.
                                        </>
                                    )}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isLeaving}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    variant="destructive"
                                    onClick={handleLeave}
                                    disabled={isLeaving}
                                    className="min-w-[100px]"
                                >
                                    {isLeaving ? (
                                        <>
                                            <Loader2 className="mr-2.5 h-4 w-4 animate-spin" />
                                            Leaving...
                                        </>
                                    ) : (
                                        "Leave Team"
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </td>
        </tr>
    );
}

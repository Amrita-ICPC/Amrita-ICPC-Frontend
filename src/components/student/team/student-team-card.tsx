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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { StudentEditTeamDialog } from "./student-edit-team-dialog";
import { StudentManageTeamDialog } from "./student-manage-team-dialog";
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

function StatusPill({ dot, label, glow = false }: { dot: string; label: string; glow?: boolean }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-100 shadow-sm backdrop-blur-md">
            <span
                className={cn("size-2 rounded-full", dot, glow && "shadow-[0_0_9px_currentColor]")}
            />
            {label}
        </span>
    );
}

export function StudentTeamCard({ team, onViewDetails: _onViewDetails }: StudentTeamCardProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isRequestsDialogOpen, setIsRequestsDialogOpen] = useState(false);
    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
    const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
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
        <div className="group relative flex flex-col overflow-hidden rounded-[20px] border border-border bg-card shadow-[0_16px_32px_-18px_rgba(2,6,23,0.38)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/55 hover:shadow-[0_22px_42px_-18px_rgba(2,6,23,0.5)] dark:border-white/10 dark:shadow-[0_16px_32px_-18px_rgba(2,6,23,0.85)] dark:hover:shadow-[0_22px_42px_-18px_rgba(2,6,23,0.95)]">
            {/* Banner */}
            <div className="relative flex min-h-[140px] flex-col overflow-hidden border-b border-primary/20 bg-[linear-gradient(118deg,color-mix(in_srgb,var(--primary)_65%,#0b1220),color-mix(in_srgb,var(--primary)_18%,#0b1220)_82%)] px-6 py-5">
                <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_center,white_1px,transparent_1.3px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
                <div className="pointer-events-none absolute -left-10 -top-24 size-72 rounded-full bg-primary/35 blur-3xl" />
                <Users
                    aria-hidden="true"
                    strokeWidth={1.65}
                    className="pointer-events-none absolute -bottom-4 -right-2 size-32 rotate-[-4deg] text-white/[0.13] drop-shadow-[0_0_18px_rgba(255,255,255,0.04)] transition-all duration-500 group-hover:-translate-x-1 group-hover:rotate-[-2deg] group-hover:text-white/[0.16]"
                />

                <div className="relative flex items-center justify-between gap-3">
                    <StatusPill
                        dot={team.is_leader ? "bg-violet-400" : "bg-sky-400"}
                        label={team.is_leader ? "Leader" : "Member"}
                        glow
                    />
                    <StatusPill
                        dot={team.is_public ? "bg-emerald-400" : "bg-amber-400"}
                        label={team.is_public ? "Public" : "Private"}
                        glow
                    />
                </div>

                <div className="relative mt-auto flex min-w-0 items-center gap-3 pt-6">
                    {team.logo ? (
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-sm backdrop-blur-md">
                            <img
                                src={team.logo}
                                alt={team.title}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-lg font-black text-white shadow-sm backdrop-blur-md">
                            {firstLetter}
                        </div>
                    )}
                    <div className="min-w-0">
                        <h3 className="truncate text-[20px] font-bold leading-tight tracking-[-0.02em] text-white">
                            {team.title}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-slate-300">Updated {timeAgo}</p>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="flex min-h-[60px] items-center border-b border-border px-7 py-3 dark:border-white/10">
                <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
                    {team.description || "No description provided. Add one to describe your team."}
                </p>
            </div>

            {/* Code + Members */}
            <div className="flex min-h-[60px] items-center border-b border-border px-7 text-muted-foreground dark:border-white/10">
                <div className="flex min-w-0 flex-1 items-center gap-2.5 pr-3">
                    <span className="text-xs">Code</span>
                    <code className="rounded border border-primary/10 bg-primary/5 px-2 py-0.5 font-mono text-xs font-bold tracking-widest text-primary select-all">
                        {team.code}
                    </code>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(team.code);
                            toast.success("Team code copied to clipboard!");
                        }}
                        className="cursor-pointer rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                        title="Copy Code"
                    >
                        <Copy className="h-3.5 w-3.5" />
                    </button>
                </div>
                <div className="h-5 w-px bg-border dark:bg-white/10" />
                <div className="flex min-w-0 flex-1 items-center justify-end gap-2.5 pl-3">
                    <div className="flex items-center -space-x-2 overflow-hidden">
                        {team.members.map((member) => (
                            <Avatar
                                key={member.id}
                                className="h-6 w-6 border-2 border-card bg-muted shadow-sm"
                            >
                                <AvatarImage src={member.logo || undefined} alt={member.name} />
                                <AvatarFallback className="text-[9px] font-black">
                                    {member.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                        {team.has_more_members && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[9px] font-black text-muted-foreground shadow-sm">
                                +{team.more_members_count}
                            </div>
                        )}
                    </div>
                    <strong className="text-sm text-foreground">{team.member_count}</strong>
                </div>
            </div>

            {/* Join Requests or Role */}
            <div className="flex min-h-[60px] items-center justify-between border-b border-border px-7 py-3 dark:border-white/10">
                {team.is_leader ? (
                    <>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/80">
                            Join Requests
                        </span>
                        {pendingRequestsCount > 0 ? (
                            <Button
                                onClick={() => setIsRequestsDialogOpen(true)}
                                variant="outline"
                                size="sm"
                                className="h-7.5 cursor-pointer gap-1.5 rounded-lg border-amber-500/20 bg-amber-500/10 px-3 text-[10px] font-black tracking-wider text-amber-600 uppercase transition-all hover:bg-amber-500/20 hover:text-amber-600 dark:text-amber-400"
                            >
                                <UserPlus className="h-3.5 w-3.5" />
                                {pendingRequestsCount} Pending
                            </Button>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-[10px] font-extrabold text-muted-foreground">
                                0 Pending
                            </span>
                        )}
                    </>
                ) : (
                    <>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/80">
                            Role
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-extrabold text-primary">
                            Team Member
                        </span>
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="flex flex-1 items-center gap-2 px-7 py-4">
                <Button
                    onClick={() => setIsManageDialogOpen(true)}
                    className="h-9 flex-1 cursor-pointer border border-transparent bg-primary font-extrabold text-primary-foreground shadow-md shadow-primary/15 hover:bg-primary/90 hover:shadow-primary/25"
                >
                    Manage Team
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 shrink-0 cursor-pointer rounded-xl border-border hover:bg-muted/50"
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

                {/* Manage Team Dialog */}
                <StudentManageTeamDialog
                    team={team}
                    open={isManageDialogOpen}
                    onOpenChange={setIsManageDialogOpen}
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
                                ? This action is permanent and cannot be undone. All members will be
                                removed.
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
                                        ? As the leader, leaving the team will dissolve it, and all
                                        members will lose access. This action is permanent and
                                        cannot be undone.
                                    </>
                                ) : (
                                    <>
                                        Are you sure you want to leave the team{" "}
                                        <strong className="text-foreground">
                                            &quot;{team.title}&quot;
                                        </strong>
                                        ? You will lose access to this team and will need to request
                                        to join again or be invited by the leader to return.
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
        </div>
    );
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

export function StudentTeamRowItem({ team, onViewDetails: _onViewDetails }: StudentTeamCardProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isRequestsDialogOpen, setIsRequestsDialogOpen] = useState(false);
    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
    const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
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
        <tr className="group border-b border-border/40 transition-colors hover:bg-muted/30">
            {/* Team Identity Column */}
            <td className="py-4 px-4 align-middle">
                <div className="flex items-center gap-3">
                    {team.logo ? (
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                            <img
                                src={team.logo}
                                alt={team.title}
                                className="h-full w-full object-cover"
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
                                className="cursor-pointer font-extrabold text-sm text-foreground transition-colors hover:text-primary"
                                onClick={() => setIsManageDialogOpen(true)}
                            >
                                {team.title}
                            </span>
                            {team.is_leader ? (
                                <span className="inline-flex rounded px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wide bg-primary/10 text-primary">
                                    Leader
                                </span>
                            ) : (
                                <span className="inline-flex rounded bg-muted px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wide text-muted-foreground">
                                    Member
                                </span>
                            )}
                            {team.is_public ? (
                                <span className="inline-flex rounded px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wide bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    Public
                                </span>
                            ) : (
                                <span className="inline-flex rounded px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wide bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                    Private
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
                                <AvatarFallback className="text-[8px] font-bold">
                                    {member.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                        {team.has_more_members && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-card bg-muted text-[8px] font-black text-muted-foreground shadow-sm">
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
                                className="h-7 px-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer animate-pulse"
                            >
                                <UserPlus className="h-3 w-3" />
                                {pendingRequestsCount} Pending
                            </Button>
                        ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold border border-border text-muted-foreground">
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
                        onClick={() => setIsManageDialogOpen(true)}
                        variant="ghost"
                        size="sm"
                        className="h-8 font-bold text-xs hover:bg-muted text-primary hover:text-primary-hover cursor-pointer"
                    >
                        Manage
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

                    {/* Manage Team Dialog */}
                    <StudentManageTeamDialog
                        team={team}
                        open={isManageDialogOpen}
                        onOpenChange={setIsManageDialogOpen}
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

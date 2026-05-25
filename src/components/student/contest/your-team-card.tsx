"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Users,
    Crown,
    Clock,
    Lock,
    ShieldCheck,
    ShieldX,
    Hourglass,
    LogOut,
    Trash2,
    Pencil,
    MoreVertical,
    UserPlus,
    Search,
    Loader2,
    Mail,
    CheckCircle2,
    UserCheck,
    Plus,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamStatus, ContestTeamMemberStatus } from "@/api/generated/model";
import type { TeamMemberStatus, TeamParticipationStatus } from "@/api/generated/model";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
    useTransferContestTeamLeaderApiV1StudentsContestsContestIdTeamsContestTeamIdLeaderPatch,
    useUpdateContestTeamMemberStatusApiV1StudentsContestsContestIdTeamsContestTeamIdMembersContestTeamMemberIdStatusPatch,
    getGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGetQueryKey,
    useLeaveTeamMeApiV1StudentsTeamsTeamIdMembersMeDelete,
    useGetTeamMembersApiV1StudentsTeamsTeamIdMembersGet,
    useInviteMembersToContestTeamApiV1StudentsContestsContestIdTeamsContestTeamIdInvitationPatch,
    useCreateContestTeamApiV1StudentsContestsContestIdTeamsPost,
    getGetStudentContestByIdApiV1StudentsContestsContestIdGetQueryKey,
} from "@/api/generated/students/students";
import {
    getGetMyTeamInvitationsApiV1UsersMeTeamInvitationGetQueryKey,
    useListStudentsApiV1UsersStudentsGet,
} from "@/api/generated/users/users";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDebounce } from "@/hooks/use-debounce";

// ─── Team-Status Badge ────────────────────────────────────────────────────────
function TeamStatusBadge({ status }: { status: string }) {
    const styles: Record<string, { label: string; className: string; icon: React.ElementType }> = {
        DRAFT: {
            label: "Draft",
            className:
                "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400",
            icon: Clock,
        },
        CONFIRMED: {
            label: "Confirmed",
            className:
                "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400",
            icon: Lock,
        },
        DISQUALIFIED: {
            label: "Disqualified",
            className:
                "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400",
            icon: ShieldX,
        },
    };

    const s = styles[status] ?? styles.DRAFT;
    const Icon = s.icon;

    return (
        <Badge
            variant="outline"
            className={cn(
                "text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 flex items-center gap-1",
                s.className,
            )}
        >
            <Icon className="h-2.5 w-2.5" />
            {s.label}
        </Badge>
    );
}

// ─── Approval-Status Badge ────────────────────────────────────────────────────
function ApprovalStatusBadge({ status }: { status: string }) {
    const styles: Record<string, { label: string; className: string; icon: React.ElementType }> = {
        WAITING: {
            label: "Pending Review",
            className:
                "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400",
            icon: Hourglass,
        },
        APPROVED: {
            label: "Approved",
            className:
                "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400",
            icon: ShieldCheck,
        },
        REJECTED: {
            label: "Rejected",
            className:
                "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400",
            icon: ShieldX,
        },
    };

    const s = styles[status] ?? styles.WAITING;
    const Icon = s.icon;

    return (
        <Badge
            variant="outline"
            className={cn(
                "text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 flex items-center gap-1",
                s.className,
            )}
        >
            <Icon className="h-2.5 w-2.5" />
            {s.label}
        </Badge>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface YourTeamCardProps {
    team: TeamParticipationStatus;
    contestName: string;
    contestId: string;
    currentUserId?: string;
    /** Callbacks — wired by the parent where mutations live */
    onConfirmTeam?: () => void;
    isConfirming?: boolean;
    onLeaveTeam?: () => void;
    onCancelTeam?: () => void;
    isCancelling?: boolean;
    onEditTeam?: (newName: string) => void;
    isEditingTeam?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function YourTeamCard({
    team,
    contestName,
    contestId,
    onConfirmTeam,
    isConfirming = false,
    onLeaveTeam,
    onCancelTeam,
    isCancelling = false,
    onEditTeam,
    isEditingTeam = false,
}: YourTeamCardProps) {
    const teamStatus: string = team.team_status ?? "DRAFT";
    const approvalStatus: string = team.team_approval_status ?? "WAITING";
    const isDraft = teamStatus === TeamStatus.DRAFT;
    const isConfirmedTeam = teamStatus === TeamStatus.CONFIRMED;

    const myMember = team.members.find((m) => m.is_current_user === true);
    const isLeader = myMember?.role === "LEADER";

    const queryClient = useQueryClient();
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

    return (
        <Card className="border-border/60 shadow-sm overflow-hidden bg-card">
            {/* Header row */}
            <CardHeader className="pb-3 border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Your Team
                    </CardTitle>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <TeamStatusBadge status={teamStatus} />
                        <ApprovalStatusBadge status={approvalStatus} />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-5 space-y-5">
                <div className="space-y-1">
                    {/* Team name */}
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-foreground tracking-tight leading-none">
                            {team.name}
                        </h3>
                        {/* Edit team — leader only, DRAFT only */}
                        {isLeader && onEditTeam && (
                            <EditTeamNameDialog
                                currentName={team.name}
                                onSave={onEditTeam}
                                isPending={isEditingTeam}
                            />
                        )}
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                        Registered for {contestName}
                    </span>
                </div>

                {/* Members list */}
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                            Team Members
                        </span>
                        {isLeader && !isConfirmedTeam && (
                            <Button
                                id="invite-members-btn"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-primary hover:bg-primary/10 rounded-md cursor-pointer"
                                onClick={() => setInviteDialogOpen(true)}
                                title="Invite Members"
                            >
                                <UserPlus className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <div className="space-y-2">
                        {team.members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-2.5 border border-border/40 hover:border-border rounded-xl transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className={cn(
                                            "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold",
                                            member.is_current_user
                                                ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                                                : "bg-primary/10 text-primary",
                                        )}
                                    >
                                        {member.name
                                            .split(" ")
                                            .map((n: string) => n[0])
                                            .join("")
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </div>
                                    <div className="flex flex-col leading-none">
                                        <span className="text-xs font-bold text-foreground flex items-center gap-1">
                                            {member.name}
                                            {member.is_current_user && (
                                                <span className="text-[8px] font-extrabold text-primary/70 uppercase tracking-wider">
                                                    (you)
                                                </span>
                                            )}
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
                                <div className="flex items-center gap-1.5">
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

                                    {(isLeader || member.is_current_user) && (
                                        <MemberActionsDropdown
                                            teamId={team.id}
                                            contestId={contestId}
                                            member={member}
                                            isLeader={isLeader}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                {(isLeader || isDraft) && (
                    <div className="mt-6 pt-5 border-t border-border/50">
                        {isLeader && (
                            <div className="flex items-center gap-2">
                                {isDraft && onConfirmTeam && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                size="sm"
                                                className="font-bold"
                                                disabled={isConfirming}
                                            >
                                                {isConfirming ? "Confirming..." : "Confirm Team"}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Confirm Your Team?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will lock your team. You won&apos;t be able
                                                    to add or remove members after this. Are you
                                                    sure you want to proceed?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={onConfirmTeam}>
                                                    Yes, Confirm Team
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                                {(isDraft || isConfirmedTeam) && onCancelTeam && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="font-bold"
                                                disabled={isCancelling}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1.5" />
                                                {isCancelling ? "Cancelling..." : "Cancel Team"}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Cancel Your Team Registration?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will cancel your team&apos;s registration
                                                    for this contest. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Back</AlertDialogCancel>
                                                <AlertDialogAction onClick={onCancelTeam}>
                                                    Yes, Cancel Registration
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        )}

                        {!isLeader && isDraft && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/5 border border-rose-500/20">
                                <p className="text-xs font-bold text-rose-500">
                                    Want to leave this team?
                                </p>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="font-bold"
                                    onClick={() => setLeaveDialogOpen(true)}
                                >
                                    <LogOut className="h-3.5 w-3.5 mr-1.5" />
                                    Leave Team
                                </Button>
                            </div>
                        )}
                    </div>
                )}
                {teamStatus === "CANCELLED" && (
                    <div className="mt-6 pt-5 border-t border-border/50">
                        <div className="flex flex-col items-center justify-center p-5 border border-dashed border-border/80 rounded-xl bg-slate-50/50 dark:bg-slate-950/10 text-center gap-3">
                            <p className="text-xs font-semibold text-muted-foreground max-w-[280px]">
                                This team has been cancelled. Create a new team to register and
                                participate in the contest.
                            </p>
                            <CreateContestTeamDialog contestId={contestId} />
                        </div>
                    </div>
                )}
            </CardContent>
            {myMember && (
                <LeaveTeamDialog
                    teamId={team.id}
                    contestId={contestId}
                    memberId={myMember.id}
                    open={leaveDialogOpen}
                    setOpen={setLeaveDialogOpen}
                />
            )}
            <ContestTeamInviteDialog
                team={team}
                contestId={contestId}
                open={inviteDialogOpen}
                setOpen={setInviteDialogOpen}
            />
        </Card>
    );
}

// ─── Create Contest Team Dialog ───────────────────────────────────────────────
export function CreateContestTeamDialog({
    contestId,
    trigger,
}: {
    contestId: string;
    trigger?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const queryClient = useQueryClient();

    const { mutate: createContestTeam, isPending } =
        useCreateContestTeamApiV1StudentsContestsContestIdTeamsPost({
            mutation: {
                meta: {
                    successMessage: "Contest team created successfully!",
                    invalidateKeys: [
                        getGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGetQueryKey(
                            contestId,
                        ),
                        getGetStudentContestByIdApiV1StudentsContestsContestIdGetQueryKey(
                            contestId,
                        ),
                    ],
                },
                onSuccess: () => {
                    setOpen(false);
                    setName("");
                    setError("");
                },
                onError: (err: any) => {
                    setError(err?.response?.data?.message || "Failed to create team.");
                },
            },
        });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Team name is required");
            return;
        }
        createContestTeam({
            contestId,
            data: {
                name: name.trim(),
                team_status: "DRAFT",
            },
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (!isOpen) {
                    setName("");
                    setError("");
                }
            }}
        >
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        size="sm"
                        className="font-bold bg-primary hover:bg-primary/90 text-white gap-1.5 shadow-sm"
                    >
                        <Plus className="h-4 w-4 stroke-[2.5]" />
                        Create New Team
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
                <form onSubmit={handleCreate} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold">Create New Team</DialogTitle>
                        <DialogDescription className="text-xs">
                            Create a new team to register and participate in this contest.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <Label htmlFor="team-name" className="text-xs font-bold">
                            Team Name
                        </Label>
                        <Input
                            id="team-name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (error) setError("");
                            }}
                            placeholder="Enter team name..."
                            maxLength={100}
                            className="h-9 text-xs"
                        />
                        {error && (
                            <p className="text-[11px] font-semibold text-destructive mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {error}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isPending}
                            className="bg-primary hover:bg-primary/90 text-white font-bold"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                                    Creating...
                                </>
                            ) : (
                                "Create Team"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Edit Team Name Dialog ────────────────────────────────────────────────────
function EditTeamNameDialog({
    currentName,
    onSave,
    isPending,
}: {
    currentName: string;
    onSave: (newName: string) => void;
    isPending: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(currentName);
    const [error, setError] = useState("");

    const handleOpen = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) {
            setName(currentName);
            setError("");
        }
    };

    const handleSubmit = () => {
        const trimmed = name.trim();
        if (!trimmed) {
            setError("Team name cannot be empty.");
            return;
        }
        if (trimmed === currentName) {
            setOpen(false);
            return;
        }
        onSave(trimmed);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
                <Button
                    id="edit-team-btn"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors"
                    disabled={isPending}
                >
                    <Pencil className="h-3.5 w-3.5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Team Name</DialogTitle>
                    <DialogDescription>
                        Update your team&apos;s display name. This won&apos;t affect team members or
                        registration status.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-2">
                    <Label htmlFor="team-name" className="text-xs font-bold">
                        Team Name
                    </Label>
                    <Input
                        id="team-name"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (error) setError("");
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                        placeholder="Enter team name"
                        className={cn(
                            "h-9",
                            error && "border-destructive focus-visible:ring-destructive",
                        )}
                        autoFocus
                    />
                    {error && <p className="text-[11px] font-semibold text-destructive">{error}</p>}
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <DialogClose asChild>
                        <Button variant="outline" size="sm">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        id="save-team-name-btn"
                        size="sm"
                        className="font-bold"
                        disabled={isPending || !name.trim()}
                        onClick={handleSubmit}
                    >
                        {isPending ? "Saving…" : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Member Actions Dropdown ──────────────────────────────────────────────────
function MemberActionsDropdown({
    teamId,
    contestId,
    member,
    isLeader,
}: {
    teamId: string;
    contestId: string;
    member: TeamMemberStatus;
    isLeader: boolean;
}) {
    const [alertOpen, setAlertOpen] = useState(false);
    const [removeAlertOpen, setRemoveAlertOpen] = useState(false);
    const [leaveAlertOpen, setLeaveAlertOpen] = useState(false);

    // Leader managing other team members
    const canManageOthers = isLeader && !member.is_current_user;

    // Current user leaving the team
    const isCurrentUser = member.is_current_user;

    if (!canManageOthers && !isCurrentUser) return null;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all rounded-md cursor-pointer flex items-center justify-center"
                    >
                        <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                    {canManageOthers && (
                        <>
                            {member.confirmed && (
                                <DropdownMenuItem
                                    onClick={() => setAlertOpen(true)}
                                    className="cursor-pointer flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 focus:text-amber-700 focus:bg-amber-500/10"
                                >
                                    <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                    Transfer Leadership
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={() => setRemoveAlertOpen(true)}
                                className="cursor-pointer flex items-center gap-2 text-xs font-semibold text-rose-600 focus:text-rose-700 focus:bg-rose-500/10"
                            >
                                <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                {member.confirmed ? "Remove Member" : "Cancel Invitation"}
                            </DropdownMenuItem>
                        </>
                    )}

                    {isCurrentUser && isLeader && (
                        <DropdownMenuItem
                            onClick={() => setLeaveAlertOpen(true)}
                            className="cursor-pointer flex items-center gap-2 text-xs font-semibold text-rose-600 focus:text-rose-700 focus:bg-rose-500/10"
                        >
                            <LogOut className="h-3.5 w-3.5 text-rose-500" />
                            Leave Team
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {canManageOthers && member.confirmed && (
                <TransferLeadershipDialog
                    teamId={teamId}
                    contestId={contestId}
                    member={member}
                    open={alertOpen}
                    setOpen={setAlertOpen}
                />
            )}

            {canManageOthers && (
                <RemoveMemberDialog
                    teamId={teamId}
                    contestId={contestId}
                    member={member}
                    open={removeAlertOpen}
                    setOpen={setRemoveAlertOpen}
                />
            )}

            {isCurrentUser && (
                <LeaveTeamDialog
                    teamId={teamId}
                    contestId={contestId}
                    memberId={member.id}
                    open={leaveAlertOpen}
                    setOpen={setLeaveAlertOpen}
                />
            )}
        </>
    );
}

// ─── Transfer Team Leadership Dialog ──────────────────────────────────────────
function TransferLeadershipDialog({
    teamId,
    contestId,
    member,
    open,
    setOpen,
}: {
    teamId: string;
    contestId: string;
    member: TeamMemberStatus;
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const queryClient = useQueryClient();

    const { mutate: transferLeadership, isPending } =
        useTransferContestTeamLeaderApiV1StudentsContestsContestIdTeamsContestTeamIdLeaderPatch({
            mutation: {
                onSuccess: () => {
                    toast.success(`Successfully transferred leadership to ${member.name}!`);
                    setOpen(false);
                    if (contestId) {
                        queryClient.invalidateQueries({
                            queryKey:
                                getGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGetQueryKey(
                                    contestId,
                                ),
                        });
                    }
                },
                onError: (error: any) => {
                    const message =
                        error?.response?.data?.message ||
                        `Failed to transfer leadership to ${member.name}.`;
                    toast.error(message);
                },
            },
        });

    const handleTransfer = () => {
        transferLeadership({
            contestId,
            contestTeamId: teamId,
            data: {
                new_leader_id: member.user_id,
            },
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-amber-500 fill-amber-500" />
                        Transfer Team Leadership?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to transfer leadership to{" "}
                        <strong className="text-foreground">{member.name}</strong>? You will lose
                        owner privileges and become a regular team member. This action cannot be
                        undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleTransfer();
                        }}
                        disabled={isPending}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
                    >
                        {isPending ? "Transferring..." : "Yes, Transfer Leadership"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// ─── Remove Member / Cancel Invitation Dialog ──────────────────────────────────
function RemoveMemberDialog({
    teamId,
    contestId,
    member,
    open,
    setOpen,
}: {
    teamId: string;
    contestId: string;
    member: TeamMemberStatus;
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const queryClient = useQueryClient();

    const { mutate: removeMember, isPending } =
        useUpdateContestTeamMemberStatusApiV1StudentsContestsContestIdTeamsContestTeamIdMembersContestTeamMemberIdStatusPatch(
            {
                mutation: {
                    onSuccess: () => {
                        const msg = member.confirmed
                            ? `Successfully removed ${member.name} from the team.`
                            : `Successfully cancelled invitation for ${member.name}.`;
                        toast.success(msg);
                        setOpen(false);
                        if (contestId) {
                            queryClient.invalidateQueries({
                                queryKey:
                                    getGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGetQueryKey(
                                        contestId,
                                    ),
                            });
                        }
                    },
                    onError: (error: any) => {
                        const fallback = member.confirmed
                            ? `Failed to remove ${member.name}.`
                            : `Failed to cancel invitation for ${member.name}.`;
                        const message = error?.response?.data?.message || fallback;
                        toast.error(message);
                    },
                },
            },
        );

    const handleRemove = () => {
        removeMember({
            contestId,
            contestTeamId: teamId,
            contestTeamMemberId: member.id,
            data: {
                status: member.confirmed
                    ? ContestTeamMemberStatus.REMOVED
                    : ContestTeamMemberStatus.CANCELLED,
            },
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-rose-500" />
                        {member.confirmed ? "Remove Team Member?" : "Cancel Invitation?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {member.confirmed ? (
                            <>
                                Are you sure you want to remove{" "}
                                <strong className="text-foreground">{member.name}</strong> from the
                                team? They will need to be invited again if they want to rejoin.
                            </>
                        ) : (
                            <>
                                Are you sure you want to cancel the invitation for{" "}
                                <strong className="text-foreground">{member.name}</strong>? They
                                will not be able to join unless you invite them again.
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleRemove();
                        }}
                        disabled={isPending}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
                    >
                        {isPending
                            ? member.confirmed
                                ? "Removing..."
                                : "Cancelling..."
                            : member.confirmed
                              ? "Yes, Remove Member"
                              : "Yes, Cancel Invitation"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// ─── Leave Team Dialog ────────────────────────────────────────────────────────
function LeaveTeamDialog({
    teamId,
    contestId,
    memberId,
    open,
    setOpen,
}: {
    teamId: string;
    contestId: string;
    memberId: string;
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const queryClient = useQueryClient();

    const { mutate: leaveTeam, isPending } =
        useUpdateContestTeamMemberStatusApiV1StudentsContestsContestIdTeamsContestTeamIdMembersContestTeamMemberIdStatusPatch(
            {
                mutation: {
                    onSuccess: () => {
                        toast.success("Successfully left the team.");
                        setOpen(false);
                        if (contestId) {
                            queryClient.invalidateQueries({
                                queryKey:
                                    getGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGetQueryKey(
                                        contestId,
                                    ),
                            });
                        }
                    },
                    onError: (error: any) => {
                        const message =
                            error?.response?.data?.message || "Failed to leave the team.";
                        toast.error(message);
                    },
                },
            },
        );

    const handleLeave = () => {
        leaveTeam({
            contestId,
            contestTeamId: teamId,
            contestTeamMemberId: memberId,
            data: {
                status: ContestTeamMemberStatus.LEFT,
            },
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <LogOut className="h-5 w-5 text-rose-500" />
                        Leave Team?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to leave the team? If you are the leader, this will
                        cancel and disband the team. Otherwise, you will be removed from the team
                        and will need to be invited again to rejoin.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleLeave();
                        }}
                        disabled={isPending}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
                    >
                        {isPending ? "Leaving..." : "Yes, Leave Team"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// ─── Invite Members to Contest Team Dialog ───────────────────────────────────
function ContestTeamInviteDialog({
    team,
    contestId,
    open,
    setOpen,
}: {
    team: TeamParticipationStatus;
    contestId: string;
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedQuery = useDebounce(searchQuery, 300);
    const [invitedUserIds, setInvitedUserIds] = useState<Set<string>>(new Set());

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setSearchQuery("");
            setInvitedUserIds(new Set());
        }
    };

    // Query 1: Fetch all student users (if team_id is None)
    const { data: studentsData, isLoading: isSearching } = useListStudentsApiV1UsersStudentsGet(
        {
            q: debouncedQuery || undefined,
            page: 1,
            page_size: 50,
        },
        {
            query: {
                enabled: open && !team.team_id,
            },
        },
    );
    const students = studentsData?.data || [];

    // Query 2: Fetch team members (if team_id is NOT None)
    const { data: membersData, isLoading: isMembersLoading } =
        useGetTeamMembersApiV1StudentsTeamsTeamIdMembersGet(
            team.team_id!,
            { contest_id: contestId },
            {
                query: {
                    enabled: open && !!team.team_id,
                },
            },
        );
    const members = membersData?.data || [];

    // Normalizing either data source
    const normalizedList = (() => {
        if (team.team_id) {
            // Filter members locally by searchQuery
            const filteredMembers = members.filter(
                (m) =>
                    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    m.email.toLowerCase().includes(searchQuery.toLowerCase()),
            );
            return filteredMembers.map((m) => {
                const existingInContestTeam = team.members.find((tm) => tm.user_id === m.id);
                const isInTeam = existingInContestTeam ? existingInContestTeam.confirmed : false;
                const isAlreadyInvited = existingInContestTeam
                    ? !existingInContestTeam.confirmed
                    : false;
                return {
                    id: m.id,
                    name: m.name,
                    email: m.email,
                    isInTeam,
                    isAlreadyInvited,
                    isInContest: !!m.is_in_contest,
                    isLeader: m.team_role === "LEADER",
                };
            });
        } else {
            return students.map((s) => {
                const existingInContestTeam = team.members.find((tm) => tm.user_id === s.id);
                const isInTeam = existingInContestTeam ? existingInContestTeam.confirmed : false;
                const isAlreadyInvited = existingInContestTeam
                    ? !existingInContestTeam.confirmed
                    : false;
                return {
                    id: s.id,
                    name: s.name,
                    email: s.email,
                    isInTeam,
                    isAlreadyInvited,
                    isInContest: false,
                    isLeader: false,
                };
            });
        }
    })();

    const isLoadingList = team.team_id ? isMembersLoading : isSearching;

    // Mutation to invite a member
    const { mutate: inviteMembers, isPending: isInviting } =
        useInviteMembersToContestTeamApiV1StudentsContestsContestIdTeamsContestTeamIdInvitationPatch(
            {
                mutation: {
                    onSuccess: () => {
                        toast.success("Invitation sent successfully!");
                        if (contestId) {
                            queryClient.invalidateQueries({
                                queryKey:
                                    getGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGetQueryKey(
                                        contestId,
                                    ),
                            });
                        }
                    },
                    onError: (error: any) => {
                        const message =
                            error?.response?.data?.message || "Failed to send invitation.";
                        toast.error(message);
                    },
                },
            },
        );

    const [activeInviteId, setActiveInviteId] = useState<string | null>(null);

    const handleInvite = (studentUserId: string) => {
        setActiveInviteId(studentUserId);
        inviteMembers(
            {
                contestId,
                contestTeamId: team.id,
                data: {
                    user_ids: [studentUserId],
                },
            },
            {
                onSuccess: () => {
                    setActiveInviteId(null);
                    setInvitedUserIds((prev) => {
                        const next = new Set(prev);
                        next.add(studentUserId);
                        return next;
                    });
                },
                onError: () => {
                    setActiveInviteId(null);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 border-b border-border/40">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <UserPlus className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                            <DialogTitle className="text-lg font-bold leading-tight">
                                Invite Team Members
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                {team.team_id
                                    ? `Search and invite members of your team to participate in this contest.`
                                    : `Search all students by name or email to invite them to your team.`}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 py-4 flex flex-col gap-4 flex-1 overflow-hidden">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Type student name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10 w-full"
                        />
                        {isLoadingList && (
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                        )}
                    </div>

                    {/* Results Container */}
                    <ScrollArea className="flex-1 min-h-[250px] max-h-[350px] pr-2.5">
                        {normalizedList.length > 0 ? (
                            <div className="space-y-2">
                                {normalizedList.map((student) => {
                                    const isInvitedLocally = invitedUserIds.has(student.id);
                                    const isInvitingNow = activeInviteId === student.id;

                                    return (
                                        <div
                                            key={student.id}
                                            className={cn(
                                                "flex items-center justify-between p-3 border rounded-xl transition-all duration-200 bg-card",
                                                student.isInTeam
                                                    ? "border-emerald-500/20 bg-emerald-500/[0.02]"
                                                    : student.isAlreadyInvited || isInvitedLocally
                                                      ? "border-indigo-500/20 bg-indigo-500/[0.02]"
                                                      : student.isInContest
                                                        ? "opacity-60 bg-slate-50 dark:bg-slate-900/40 border-border/60"
                                                        : "border-border/60 hover:border-primary/30",
                                            )}
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <Avatar className="h-8 w-8 border border-border/80 shadow-xs shrink-0">
                                                    <AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary">
                                                        {student.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")
                                                            .toUpperCase()
                                                            .slice(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col leading-none text-left min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs font-bold text-foreground truncate">
                                                            {student.name}
                                                        </span>
                                                        {student.isLeader && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[8px] font-bold uppercase tracking-wider text-indigo-500 border-indigo-500/25 bg-indigo-500/10 py-0 px-1.5 h-3.5"
                                                            >
                                                                Leader
                                                            </Badge>
                                                        )}
                                                        {student.isInContest &&
                                                            !student.isInTeam &&
                                                            !student.isAlreadyInvited && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-[8px] font-bold uppercase tracking-wider text-amber-500 border-amber-500/25 bg-amber-500/10 py-0 px-1.5 h-3.5"
                                                                >
                                                                    Already Registered
                                                                </Badge>
                                                            )}
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground font-semibold truncate mt-1">
                                                        {student.email}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="shrink-0 pl-2">
                                                {student.isInTeam ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border-emerald-500/20 py-0.5 px-2 flex items-center gap-1"
                                                    >
                                                        <UserCheck className="h-3 w-3 stroke-[2.5]" />
                                                        In Team
                                                    </Badge>
                                                ) : student.isAlreadyInvited || isInvitedLocally ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border-indigo-500/20 py-0.5 px-2 flex items-center gap-1"
                                                    >
                                                        <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
                                                        Invited
                                                    </Badge>
                                                ) : student.isInContest ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border-amber-500/20 py-0.5 px-2 flex items-center gap-1"
                                                    >
                                                        <AlertCircle className="h-3 w-3" />
                                                        Registered
                                                    </Badge>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleInvite(student.id)}
                                                        disabled={isInvitingNow || isInviting}
                                                        className="h-7 px-3.5 text-[10px] font-extrabold gap-1 cursor-pointer"
                                                    >
                                                        {isInvitingNow ? (
                                                            <>
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                                Inviting
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Mail className="h-3 w-3" />
                                                                Invite
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : searchQuery.trim().length > 0 && !isLoadingList ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                                <Search className="h-8 w-8 text-muted-foreground/30" />
                                <p className="text-xs font-bold text-muted-foreground">
                                    No members found matching &quot;{searchQuery}&quot;
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                                <Search className="h-8 w-8 text-muted-foreground/20" />
                                <p className="text-xs font-bold text-muted-foreground">
                                    {team.team_id
                                        ? "Team roster is empty or all members are registered."
                                        : "Search by typing student name or email"}
                                </p>
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}

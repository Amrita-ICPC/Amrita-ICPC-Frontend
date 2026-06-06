"use client";

import { AlertCircle, CheckCircle2, Clock, Loader2, Sparkles, Trophy, Users } from "lucide-react";
import { Download, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { TeamApprovalStatus, TeamStatus } from "@/api/generated/model";
import {
    getGetStudentContestByIdApiV1StudentsContestsContestIdGetQueryKey,
    getGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGetQueryKey,
    useCreateContestTeamApiV1StudentsContestsContestIdTeamsPost,
    useUpdateContestTeamApiV1StudentsContestsContestIdTeamsContestTeamIdPatch,
    useUpdateContestTeamStatusApiV1StudentsContestsContestIdTeamsContestTeamIdStatusPatch,
} from "@/api/generated/students/students";
import { useGetMeApiV1UsersMeGet } from "@/api/generated/users/users";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { StudentImportTeamDialog } from "./student-import-team-dialog";
import { CreateContestTeamDialog, YourTeamCard } from "./your-team-card";

interface ContestTeamCardsProps {
    participation: any;
    isStatusLoading: boolean;
    contest: {
        id?: string;
        name: string;
        min_team_size: number;
        max_team_size: number;
        contest_mode?: string;
        registration_end?: string | null;
    };
}

// ─── Registration Progress Card ───────────────────────────────────────────────
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
    const isApproved = team.team_approval_status === TeamApprovalStatus.APPROVED;
    const isTeamConfirmed = team.team_status === TeamStatus.CONFIRMED;
    const requirements = [minSizeMet, allConfirmed, isTeamConfirmed, isApproved];
    const completedCount = requirements.filter(Boolean).length;
    const completionPercentage = (completedCount / requirements.length) * 100;

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
                            className="bg-primary h-full rounded-full transition-all duration-500"
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

                        {/* Requirement 3: Team Confirmed */}
                        <div className="flex items-start gap-3 p-2.5 border border-border/40 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl">
                            {isTeamConfirmed ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                                <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            )}
                            <div className="flex flex-col leading-tight">
                                <span
                                    className={cn(
                                        "text-xs font-bold",
                                        isTeamConfirmed
                                            ? "text-foreground"
                                            : "text-muted-foreground",
                                    )}
                                >
                                    Team confirmed
                                </span>
                                <span className="text-[10px] text-muted-foreground mt-0.5 font-semibold">
                                    {isTeamConfirmed
                                        ? "Team is locked and finalised"
                                        : "Waiting for leader to confirm the team"}
                                </span>
                            </div>
                        </div>

                        {/* Requirement 4: Instructor Approval */}
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

function formatRegisteredAt(dateStr?: string) {
    const d = dateStr ? new Date(dateStr) : new Date();
    if (isNaN(d.getTime()))
        return new Date().toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    return d.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

function RegistrationTimeRemaining({ targetDate }: { targetDate: string }) {
    const [text, setText] = useState("");

    useEffect(() => {
        const update = () => {
            const diff = new Date(targetDate).getTime() - Date.now();
            if (diff <= 0) {
                setText("Registration closed");
                return;
            }
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            if (hours > 24) {
                const days = Math.floor(hours / 24);
                setText(`${days}d ${hours % 24}h`);
            } else {
                setText(`${hours}h ${minutes}m`);
            }
        };
        update();
        const interval = setInterval(update, 60000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return <span>{text}</span>;
}

interface IndividualRegistrationStatusCardProps {
    team: any;
    contest: any;
    onCancelRegistration: () => void;
    isCancelling: boolean;
}

function IndividualRegistrationStatusCard({
    team,
    contest,
    onCancelRegistration,
    isCancelling,
}: IndividualRegistrationStatusCardProps) {
    const registeredAt = (team as any).created_at;

    return (
        <Card className="border-border/60 shadow-sm overflow-hidden bg-card">
            <CardHeader className="pb-3 border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/30">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 animate-pulse" />
                    Registration Status
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="flex flex-col items-center justify-center text-center py-4 gap-2">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2">
                        <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
                    </div>
                    <h4 className="text-base font-bold text-foreground flex items-center gap-1.5 justify-center">
                        Registered
                    </h4>
                    <p className="text-xs text-muted-foreground font-semibold mt-1">
                        Display Name: <span className="text-foreground font-bold">{team.name}</span>
                    </p>
                </div>

                <div className="space-y-1.5 p-3.5 border border-border/40 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                        Registered At
                    </span>
                    <span className="text-xs font-bold text-foreground tabular-nums">
                        {formatRegisteredAt(registeredAt)}
                    </span>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            className="w-full font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                            disabled={isCancelling}
                        >
                            Cancel Registration
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Registration?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will cancel your registration for this contest. This action
                                cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Back</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={onCancelRegistration}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                                Yes, Cancel Registration
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}

function IndividualNotRegisteredCard({ contest, contestId }: { contest: any; contestId: string }) {
    const { data: session } = useSession();
    const { data: meData } = useGetMeApiV1UsersMeGet();
    const me = meData;
    const defaultDisplayName = me?.name || session?.user?.name || "";

    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    // Pre-fill the name field once the user's name is loaded when the dialog opens
    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) {
            setName(defaultDisplayName);
        } else {
            setName("");
            setError("");
        }
    };

    const { mutate: registerIndividual, isPending } =
        useCreateContestTeamApiV1StudentsContestsContestIdTeamsPost({
            mutation: {
                meta: {
                    successMessage: "Registered successfully!",
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
                    setError(err?.response?.data?.message || "Failed to register.");
                },
            },
        });

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Display name is required");
            return;
        }
        registerIndividual({
            contestId,
            data: {
                name: name.trim(),
                team_status: "CONFIRMED", // For individual, immediately confirm
            },
        });
    };

    return (
        <Card className="shadow-sm border-border/60 overflow-hidden bg-card">
            <CardHeader className="pb-3 border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/30 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Registration Status
                </CardTitle>
                <Badge
                    variant="outline"
                    className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-rose-500/10 text-rose-600 border-rose-500/20"
                >
                    Not Registered
                </Badge>
            </CardHeader>
            <CardContent className="p-6">
                <div className="py-6 flex flex-col items-center justify-center text-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                        <Users className="h-6 w-6 animate-pulse" />
                    </div>
                    <h4 className="text-sm font-bold text-foreground">Not Registered</h4>
                    {contest.registration_end && (
                        <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 mt-1">
                            Registration closes in:{" "}
                            <span className="text-foreground font-bold">
                                <RegistrationTimeRemaining targetDate={contest.registration_end} />
                            </span>
                        </p>
                    )}

                    <Dialog open={open} onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                            <Button
                                size="sm"
                                className="w-full mt-6 font-bold shadow-md shadow-primary/15 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-white"
                            >
                                Register Now
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[420px]">
                            <form onSubmit={handleRegister} className="space-y-4">
                                <DialogHeader>
                                    <DialogTitle className="text-base font-bold">
                                        Contest Registration
                                    </DialogTitle>
                                    <DialogDescription className="text-xs">
                                        Please confirm your display name for this individual
                                        contest.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-2">
                                    <Label htmlFor="display-name" className="text-xs font-bold">
                                        Display Name
                                    </Label>
                                    <Input
                                        id="display-name"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            if (error) setError("");
                                        }}
                                        placeholder="Enter display name..."
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
                                                Registering...
                                            </>
                                        ) : (
                                            "Confirm & Register"
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Overall Registrations Progress Card (exported for the detail page) ───────
interface OverallRegistrationProgressCardProps {
    contest:
        | {
              teams_count?: number;
              max_teams?: number | null;
          }
        | null
        | undefined;
}

export function OverallRegistrationProgressCard({ contest }: OverallRegistrationProgressCardProps) {
    if (!contest) return null;

    const teamCount = contest.teams_count ?? 0;
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
                                className="bg-primary h-full rounded-full transition-all duration-500"
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

// ─── Main exported component ──────────────────────────────────────────────────
export function ContestTeamCards({
    participation,
    isStatusLoading,
    contest,
}: ContestTeamCardsProps) {
    const { data: session } = useSession();
    const currentUserId = session?.user?.id;
    const contestId = contest.id;
    const team = participation?.team;

    // ── Mutation hooks ────────────────────────────────────────────────────────
    const participationQueryKey = contestId
        ? getGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGetQueryKey(
              contestId,
          )
        : undefined;

    const { mutate: updateTeamStatus, isPending: isUpdatingStatus } =
        useUpdateContestTeamStatusApiV1StudentsContestsContestIdTeamsContestTeamIdStatusPatch({
            mutation: {
                meta: {
                    invalidateKeys: participationQueryKey ? [participationQueryKey] : [],
                },
            },
        });

    const { mutate: editTeam, isPending: isEditingTeam } =
        useUpdateContestTeamApiV1StudentsContestsContestIdTeamsContestTeamIdPatch({
            mutation: {
                meta: {
                    successMessage: "Team updated successfully.",
                    invalidateKeys: participationQueryKey ? [participationQueryKey] : [],
                },
            },
        });

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleConfirmTeam = () => {
        if (!contestId || !team?.id) return;
        toast.promise(
            new Promise((resolve, reject) =>
                updateTeamStatus(
                    {
                        contestId,
                        contestTeamId: team.id,
                        data: { status: TeamStatus.CONFIRMED },
                    },
                    { onSuccess: resolve, onError: reject },
                ),
            ),
            {
                loading: "Confirming team...",
                success: "Team confirmed! Your team is now locked.",
                error: "Failed to confirm team.",
            },
        );
    };

    const handleEditTeam = (newName: string) => {
        if (!contestId || !team?.id) return;
        editTeam({ contestId, contestTeamId: team.id, data: { name: newName } });
    };

    const handleLeaveTeam = () => {
        toast.info("Leave Team endpoint not yet available.");
    };

    const handleCancelTeam = () => {
        if (!contestId || !team?.id) return;
        toast.promise(
            new Promise((resolve, reject) =>
                updateTeamStatus(
                    {
                        contestId,
                        contestTeamId: team.id,
                        data: { status: TeamStatus.CANCELLED },
                    },
                    { onSuccess: resolve, onError: reject },
                ),
            ),
            {
                loading: "Cancelling team...",
                success: "Team has been cancelled.",
                error: "Failed to cancel team.",
            },
        );
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (isStatusLoading) {
        return (
            <Card className="border-border/60 shadow-sm overflow-hidden bg-card">
                <CardContent className="p-6 flex items-center justify-center text-xs text-muted-foreground h-40">
                    Loading team status...
                </CardContent>
            </Card>
        );
    }

    // ── Registered with a team ────────────────────────────────────────────────
    if (participation?.registration_status?.registered && team) {
        if (contest.contest_mode === "individual") {
            return (
                <IndividualRegistrationStatusCard
                    team={team}
                    contest={contest}
                    onCancelRegistration={handleCancelTeam}
                    isCancelling={isUpdatingStatus}
                />
            );
        }

        return (
            <>
                {/* Your Team card — shown FIRST */}
                <YourTeamCard
                    team={team}
                    contestName={contest.name}
                    contestId={contestId ?? ""}
                    currentUserId={currentUserId}
                    onConfirmTeam={handleConfirmTeam}
                    isConfirming={isUpdatingStatus}
                    onLeaveTeam={handleLeaveTeam}
                    onCancelTeam={handleCancelTeam}
                    isCancelling={isUpdatingStatus}
                    onEditTeam={(newName) => handleEditTeam(newName)}
                    isEditingTeam={isEditingTeam}
                />

                {/* Registration Progress card — shown BELOW */}
                <TeamRegistrationProgressCard participation={participation} />
            </>
        );
    }

    /* User is not registered in any team */
    if (contest.contest_mode === "individual") {
        return <IndividualNotRegisteredCard contest={contest} contestId={contestId ?? ""} />;
    }
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
                    <div className="flex flex-col gap-2 mt-4 w-full">
                        {contest.id && (
                            <StudentImportTeamDialog
                                contestId={contest.id}
                                maxTeamSize={contest.max_team_size}
                                trigger={
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <Download className="h-4 w-4" />
                                        Import Team
                                    </Button>
                                }
                            />
                        )}
                        {contest.id && (
                            <CreateContestTeamDialog
                                contestId={contest.id || ""}
                                trigger={
                                    <Button
                                        size="sm"
                                        className="w-full font-bold shadow-md shadow-primary/15 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-white"
                                    >
                                        <Plus className="h-4 w-4 stroke-[2.5]" />
                                        Create New Team
                                    </Button>
                                }
                            />
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

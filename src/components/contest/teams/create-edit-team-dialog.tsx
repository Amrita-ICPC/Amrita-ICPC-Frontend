"use client";

import { useState, useMemo } from "react";
import { Loader2, Search, UserPlus, UserMinus, Check, Users, Star, StarOff } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { useDebounce } from "@/hooks/use-debounce";
import {
    useCreateTeam,
    useUpdateTeam,
    useAddTeamMembers,
    useRemoveTeamMembers,
} from "@/mutation/team-mutation";
import { useUsers } from "@/query/user-query";
import { useTeamMembers, useAllContestMembers } from "@/query/team-query";
import { toast } from "@/lib/hooks/use-toast";
import { toApiError } from "@/lib/api/error";
import type { ContestTeamResponse } from "@/api/generated/model";

const teamSchema = z.object({
    name: z.string().min(3, "Team name must be at least 3 characters long"),
    leader_id: z.string().nullable(),
});

interface CreateEditTeamDialogProps {
    contestId: string;
    team?: ContestTeamResponse;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Inner content component that handles form state and searching.
 * Extracted to ensure fresh state when the dialog mounts/opens.
 */
function CreateEditTeamDialogContent({
    contestId,
    team,
    onOpenChange,
}: Omit<CreateEditTeamDialogProps, "isOpen">) {
    const isEditMode = !!team;
    const [localSearch, setLocalSearch] = useState("");
    const debouncedSearch = useDebounce(localSearch, 300);
    const [page, setPage] = useState(1);

    // Track membership toggles (Set of user IDs)
    const [selectedToModify, setSelectedToModify] = useState<Set<string>>(new Set());

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        control,
    } = useForm<z.infer<typeof teamSchema>>({
        resolver: zodResolver(teamSchema),
        defaultValues: {
            name: team?.name ?? "",
            leader_id: team?.leader_id ?? null,
        },
    });

    const currentLeaderId = useWatch({ control, name: "leader_id" });

    const {
        data: usersResponse,
        isLoading: isLoadingUsers,
        isError: isErrorUsers,
        refetch: refetchUsers,
    } = useUsers({
        page,
        page_size: 5,
        role: "student",
        ...(debouncedSearch && { q: debouncedSearch }),
    });

    const { data: currentMembersResponse, isLoading: isLoadingMembers } = useTeamMembers(
        contestId,
        team?.id ?? "",
        { page_size: 100 },
        { enabled: isEditMode },
    );

    const { data: allContestMembers, isLoading: isLoadingAllMembers } =
        useAllContestMembers(contestId);

    const createTeamMutation = useCreateTeam();
    const updateTeamMutation = useUpdateTeam();
    const addMembersMutation = useAddTeamMembers();
    const removeMembersMutation = useRemoveTeamMembers();

    const users = usersResponse?.data ?? [];
    const pagination = usersResponse?.pagination;

    const currentMemberIds = useMemo(
        () => new Set(currentMembersResponse?.data?.map((m) => m.user_id) ?? []),
        [currentMembersResponse],
    );

    const toggleUserMembership = (userId: string, isDisabled: boolean) => {
        if (isDisabled) return;

        const next = new Set(selectedToModify);
        if (next.has(userId)) {
            next.delete(userId);
        } else {
            next.add(userId);
        }
        setSelectedToModify(next);

        // If user is being removed and they were the leader, unset leader
        const isCurrentlyMember = currentMemberIds.has(userId);
        const willBeMember = isCurrentlyMember ? !next.has(userId) : next.has(userId);

        if (!willBeMember && currentLeaderId === userId) {
            setValue("leader_id", null);
        }
    };

    const handleSetLeader = (userId: string) => {
        if (currentLeaderId === userId) {
            setValue("leader_id", null);
        } else {
            setValue("leader_id", userId);
        }
    };

    const toAdd = useMemo(
        () => Array.from(selectedToModify).filter((id) => !currentMemberIds.has(id)),
        [selectedToModify, currentMemberIds],
    );
    const toRemove = useMemo(
        () => Array.from(selectedToModify).filter((id) => currentMemberIds.has(id)),
        [selectedToModify, currentMemberIds],
    );

    const onSubmit = async (values: z.infer<typeof teamSchema>) => {
        try {
            if (isEditMode && team) {
                // 1. Update team basic info (name, leader)
                await updateTeamMutation.mutateAsync({
                    contestId,
                    teamId: team.id,
                    payload: { name: values.name, leader_id: values.leader_id },
                });

                // 2. Handle member additions/removals
                const promises = [];
                if (toAdd.length > 0) {
                    promises.push(
                        addMembersMutation.mutateAsync({
                            contestId,
                            teamId: team.id,
                            payload: { member_ids: toAdd },
                        }),
                    );
                }
                if (toRemove.length > 0) {
                    promises.push(
                        removeMembersMutation.mutateAsync({
                            contestId,
                            teamId: team.id,
                            payload: { member_ids: toRemove },
                        }),
                    );
                }
                await Promise.all(promises);

                toast.success("Team updated successfully");
            } else {
                // Create mode
                await createTeamMutation.mutateAsync({
                    contestId,
                    payload: {
                        name: values.name,
                        leader_id: values.leader_id,
                        member_ids: Array.from(selectedToModify),
                    },
                });
                toast.success("Team created successfully");
            }
            onOpenChange(false);
        } catch (err: unknown) {
            const apiError = toApiError(err);
            toast.error(apiError.detail ?? apiError.message ?? "Failed to save team");
        }
    };

    const isLoading = isLoadingUsers || (isEditMode && isLoadingMembers) || isLoadingAllMembers;

    return (
        <DialogContent className="sm:max-w-3xl flex flex-col gap-0 p-0 overflow-hidden shadow-2xl rounded-xl border-border bg-background">
            <DialogHeader className="px-6 py-6 pb-4">
                <div className="flex items-center gap-2 mb-1">
                    <Users className="h-5 w-5 text-primary" />
                    <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
                        {isEditMode ? "Edit Team" : "Create New Team"}
                    </DialogTitle>
                </div>
                <DialogDescription className="text-muted-foreground mt-0.5">
                    {isEditMode
                        ? "Update team details, manage members, and assign a leader."
                        : "Define your team name and select initial student members."}
                </DialogDescription>
            </DialogHeader>

            <div className="px-6 pb-4 flex flex-col gap-4">
                <div className="space-y-2">
                    <Label htmlFor="team-name" className="text-sm font-medium">
                        Team Name
                    </Label>
                    <Input
                        id="team-name"
                        placeholder="Enter a catchy team name..."
                        className={`h-10 ${errors.name ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                        {...register("name")}
                    />
                    {errors.name && (
                        <p className="text-xs text-destructive font-medium">
                            {errors.name.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 px-6 py-4 border-y border-border bg-muted/30">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground/70" />
                    <Input
                        placeholder="Search students to add to team..."
                        className="pl-10 shadow-sm h-10 border-border bg-background focus-visible:ring-primary/20"
                        value={localSearch}
                        onChange={(e) => {
                            setLocalSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-md text-xs font-medium text-muted-foreground shadow-sm">
                    <Badge
                        variant="outline"
                        className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/5"
                    >
                        Student
                    </Badge>
                    <span>Role locked</span>
                </div>
            </div>

            <div className="px-6 py-4 flex-1 overflow-auto bg-muted/10 min-h-[300px] max-h-[400px]">
                <div className="rounded-xl border shadow-sm border-border bg-card overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/40 border-b border-border">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[50px] text-center pl-4">Member</TableHead>
                                <TableHead className="font-semibold text-foreground">
                                    Student Info
                                </TableHead>
                                <TableHead className="font-semibold text-foreground">
                                    Leader
                                </TableHead>
                                <TableHead className="font-semibold text-foreground text-right pr-6">
                                    Status
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow
                                        key={i}
                                        className="border-b border-border/60 last:border-0 hover:bg-transparent"
                                    >
                                        <TableCell className="w-[50px] text-center pl-4">
                                            <Skeleton className="h-4 w-4 rounded-sm mx-auto" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Skeleton className="h-[22px] w-[80px] rounded-full ml-auto" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : isErrorUsers ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-40 text-center">
                                        <div className="flex flex-col gap-2 items-center justify-center text-destructive/90">
                                            <p className="font-medium">Failed to load students</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setPage(1);
                                                    void refetchUsers();
                                                }}
                                                className="mt-2 h-8"
                                            >
                                                Retry
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="h-40 text-center text-muted-foreground"
                                    >
                                        <Search className="h-8 w-8 mx-auto mb-3 opacity-20" />
                                        <p>No students found matching your search</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => {
                                    const isAlreadyMemberOfThisTeam = currentMemberIds.has(user.id);
                                    const otherTeam = allContestMembers?.get(user.user_id);
                                    const isAlreadyInAnotherTeam =
                                        otherTeam && otherTeam.id !== team?.id;

                                    const isDisabled = isAlreadyInAnotherTeam;
                                    const isToggled = selectedToModify.has(user.id);
                                    const willBeMember = isAlreadyMemberOfThisTeam
                                        ? !isToggled
                                        : isToggled;
                                    const isLeader = currentLeaderId === user.id;

                                    return (
                                        <TableRow
                                            key={user.id}
                                            className={`border-b border-border/60 last:border-0 transition-colors ${
                                                isDisabled
                                                    ? "opacity-50 cursor-not-allowed bg-muted/20"
                                                    : "cursor-pointer"
                                            } ${
                                                isToggled
                                                    ? isAlreadyMemberOfThisTeam
                                                        ? "bg-destructive/5 hover:bg-destructive/10"
                                                        : "bg-primary/5 hover:bg-primary/10"
                                                    : isLeader
                                                      ? "bg-amber-500/5"
                                                      : !isDisabled
                                                        ? "hover:bg-muted/50"
                                                        : ""
                                            }`}
                                            onClick={() =>
                                                toggleUserMembership(user.id, !!isDisabled)
                                            }
                                        >
                                            <TableCell className="w-[50px] text-center pl-4">
                                                <Checkbox
                                                    checked={willBeMember}
                                                    disabled={!!isDisabled}
                                                    onCheckedChange={() =>
                                                        toggleUserMembership(user.id, !!isDisabled)
                                                    }
                                                    onClick={(e) => e.stopPropagation()}
                                                    className={`border-primary/40 ${isAlreadyMemberOfThisTeam && isToggled ? "data-[state=unchecked]:border-destructive" : "data-[state=checked]:bg-primary"}`}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-sm text-foreground">
                                                    {user.name}
                                                </div>
                                                <div className="text-[12px] text-muted-foreground mt-0.5">
                                                    {user.email}
                                                </div>
                                            </TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={!willBeMember || !!isDisabled}
                                                    className={`h-8 w-8 rounded-full transition-all ${isLeader ? "text-amber-500 hover:text-amber-600 bg-amber-500/10" : "text-muted-foreground/30 hover:text-muted-foreground"}`}
                                                    onClick={() => handleSetLeader(user.id)}
                                                    title={
                                                        isLeader
                                                            ? "Current Leader"
                                                            : "Assign as Leader"
                                                    }
                                                >
                                                    {isLeader ? (
                                                        <Star className="h-4 w-4 fill-current" />
                                                    ) : (
                                                        <StarOff className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                {isAlreadyInAnotherTeam ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] uppercase font-bold px-1.5 py-0 border-muted-foreground/30 text-muted-foreground"
                                                    >
                                                        In: {otherTeam.name}
                                                    </Badge>
                                                ) : isAlreadyMemberOfThisTeam ? (
                                                    isToggled ? (
                                                        <Badge
                                                            variant="destructive"
                                                            className="text-[10px] uppercase font-bold px-1.5 py-0"
                                                        >
                                                            Removing
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] uppercase font-bold px-1.5 py-0"
                                                        >
                                                            Member
                                                        </Badge>
                                                    )
                                                ) : isToggled ? (
                                                    <Badge className="bg-primary text-primary-foreground text-[10px] uppercase font-bold px-1.5 py-0">
                                                        Adding
                                                    </Badge>
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground uppercase font-bold">
                                                        Non-Member
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="px-6 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
                <div className="text-[13px] font-medium text-muted-foreground">
                    {pagination?.total ? (
                        <>
                            Showing <span className="text-foreground">{(page - 1) * 5 + 1}</span> to{" "}
                            <span className="text-foreground">
                                {Math.min(page * 5, pagination.total)}
                            </span>{" "}
                            of <span className="text-foreground">{pagination.total}</span> students
                        </>
                    ) : null}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs shadow-sm bg-background border-border"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page <= 1 || isLoadingUsers}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-4 text-xs shadow-sm bg-background border-border"
                        onClick={() => setPage(page + 1)}
                        disabled={!pagination?.has_next || isLoadingUsers}
                    >
                        Next
                    </Button>
                </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t border-border bg-background flex flex-row items-center justify-between sm:justify-between w-full">
                <div className="flex flex-col gap-1">
                    {!isEditMode && selectedToModify.size > 0 && (
                        <span className="flex items-center gap-1.5 text-primary text-xs font-semibold">
                            <UserPlus className="h-3 w-3" />
                            {selectedToModify.size} initial members
                        </span>
                    )}
                    {isEditMode && toAdd.length > 0 && (
                        <span className="flex items-center gap-1.5 text-primary text-xs font-semibold">
                            <UserPlus className="h-3 w-3" />
                            {toAdd.length} to add
                        </span>
                    )}
                    {isEditMode && toRemove.length > 0 && (
                        <span className="flex items-center gap-1.5 text-destructive text-xs font-semibold">
                            <UserMinus className="h-3 w-3" />
                            {toRemove.length} to remove
                        </span>
                    )}
                </div>
                <div className="flex flex-row items-center gap-2">
                    <Button
                        variant="ghost"
                        className="font-medium hover:bg-muted/50 text-sm"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={
                            createTeamMutation.isPending ||
                            updateTeamMutation.isPending ||
                            addMembersMutation.isPending ||
                            removeMembersMutation.isPending
                        }
                        className="min-w-[140px] font-semibold shadow-md transition-all active:scale-[0.98] bg-primary hover:bg-primary/90"
                    >
                        {createTeamMutation.isPending || updateTeamMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Check className="h-4 w-4" />
                                {isEditMode ? "Save Changes" : "Create Team"}
                            </span>
                        )}
                    </Button>
                </div>
            </DialogFooter>
        </DialogContent>
    );
}

export function CreateEditTeamDialog({
    contestId,
    team,
    isOpen,
    onOpenChange,
}: CreateEditTeamDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            {isOpen && (
                <CreateEditTeamDialogContent
                    key={team?.id ?? "new"}
                    contestId={contestId}
                    team={team}
                    onOpenChange={onOpenChange}
                />
            )}
        </Dialog>
    );
}

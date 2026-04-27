"use client";

import { Button } from "@/components/ui/button";
import { Edit, ShieldCheck, CheckSquare, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApproveTeam, useUpdateTeam, useDeleteTeam } from "@/mutation/team-mutation";
import { ContestTeamResponse, TeamApprovalStatus, TeamStatus } from "@/api/generated/model";
import { CreateEditTeamDialog } from "./create-edit-team-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TeamRowActionsProps {
    team: ContestTeamResponse;
    contestId: string;
}

export function TeamRowActions({ team, contestId }: TeamRowActionsProps) {
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const { mutate: approveTeam, isPending: isApproving } = useApproveTeam();
    const { mutate: updateTeam, isPending: isFinalizing } = useUpdateTeam();
    const { mutate: deleteTeam, isPending: isDeleting } = useDeleteTeam();

    const handleApprove = () => {
        approveTeam(
            { contestId, teamId: team.id },
            {
                onSuccess: () => {
                    toast.success("Team Approved", {
                        description: `Team "${team.name}" has been approved.`,
                    });
                },
                onError: (error) => {
                    toast.error("Approval Failed", { description: error.message });
                },
            },
        );
    };

    const handleFinalize = () => {
        updateTeam(
            { contestId, teamId: team.id, payload: { status: TeamStatus.CONFIRMED } },
            {
                onSuccess: () => {
                    toast.success("Team Finalized", {
                        description: `Team "${team.name}" has been finalized.`,
                    });
                },
                onError: (error) => {
                    toast.error("Finalization Failed", { description: error.message });
                },
            },
        );
    };

    const handleDelete = () => {
        deleteTeam(
            { contestId, teamId: team.id },
            {
                onSuccess: () => {
                    toast.success("Team Deleted", {
                        description: `Team "${team.name}" has been successfully removed.`,
                    });
                    setDeleteDialogOpen(false);
                },
                onError: (error) => {
                    toast.error("Deletion Failed", { description: error.message });
                },
            },
        );
    };

    return (
        <div className="flex items-center justify-end gap-2">
            <TooltipProvider delayDuration={300}>
                {/* Finalize Button */}
                {team.status === TeamStatus.DRAFT && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                onClick={handleFinalize}
                                disabled={isFinalizing}
                            >
                                {isFinalizing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckSquare className="h-4 w-4" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Finalize Team</TooltipContent>
                    </Tooltip>
                )}

                {/* Approve Button */}
                {team.approval_status !== TeamApprovalStatus.APPROVED && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={handleApprove}
                                disabled={isApproving}
                            >
                                {isApproving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ShieldCheck className="h-4 w-4" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Approve Team</TooltipContent>
                    </Tooltip>
                )}

                {/* Edit Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => setEditDialogOpen(true)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Team / Members</TooltipContent>
                </Tooltip>

                {/* Delete Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete Team</TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {/* Dialogs */}
            <CreateEditTeamDialog
                isOpen={isEditDialogOpen}
                onOpenChange={setEditDialogOpen}
                contestId={contestId}
                team={team}
            />

            <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription>
                            This action is permanent and cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <Alert variant="destructive" className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Warning</AlertTitle>
                        <AlertDescription>
                            Are you sure you want to delete the team <strong>{team.name}</strong>?
                            All member associations will be removed.
                        </AlertDescription>
                    </Alert>

                    <DialogFooter className="mt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="min-w-[100px]"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Team"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

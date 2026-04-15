"use client";

/**
 * Publish contest confirmation dialog
 * Confirms before publishing a contest
 */

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

interface PublishContestDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    contestName: string;
    isLoading?: boolean;
}

export function PublishContestDialog({
    isOpen,
    onClose,
    onConfirm,
    contestName,
    isLoading = false,
}: PublishContestDialogProps) {
    const handleConfirm = async () => {
        await onConfirm();
        onClose();
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Publish Contest</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to publish <strong>&quot;{contestName}&quot;</strong>?
                        Once published, students will be able to register and participate in this
                        contest. This action cannot be easily undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? "Publishing..." : "Publish"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

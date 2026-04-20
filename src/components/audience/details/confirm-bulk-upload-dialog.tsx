"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmBulkUploadDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    parsedEmailsCount: number | undefined;
    selectedFileName: string | null;
    isPending: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmBulkUploadDialog({
    isOpen,
    onOpenChange,
    parsedEmailsCount,
    selectedFileName,
    isPending,
    onConfirm,
    onCancel,
}: ConfirmBulkUploadDialogProps) {
    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (isPending) return;
                if (!open) {
                    onCancel();
                    return;
                }
                onOpenChange(open);
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Bulk Addition</DialogTitle>
                    <DialogDescription>
                        We found {parsedEmailsCount ?? 0} valid email address(es) in the file
                        <span className="font-semibold text-foreground ml-1">
                            {selectedFileName}
                        </span>
                        . Would you like to bulk add these users to the audience?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onCancel} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} disabled={isPending || !parsedEmailsCount}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                            </>
                        ) : (
                            "Confirm Add"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

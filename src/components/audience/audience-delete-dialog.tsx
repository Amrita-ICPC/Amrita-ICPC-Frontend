"use client";

import { AlertTriangle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type AudienceDeleteDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    audienceName?: string | null;
    isPending: boolean;
    onConfirm: () => void;
};

export function AudienceDeleteDialog({
    open,
    onOpenChange,
    audienceName,
    isPending,
    onConfirm,
}: AudienceDeleteDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Delete audience</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone.
                        {audienceName ? ` Audience: ${audienceName}` : ""}
                    </DialogDescription>
                </DialogHeader>

                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Permanent delete</AlertTitle>
                    <AlertDescription>
                        Deleting an audience will remove it from the system and may affect contests
                        and access rules linked to it.
                    </AlertDescription>
                </Alert>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isPending}
                    >
                        {isPending ? "Deleting…" : "Delete audience"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

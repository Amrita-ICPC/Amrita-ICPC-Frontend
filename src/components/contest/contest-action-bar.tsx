"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ContestActionBarProps = {
    isSubmitting: boolean;
    isPending: boolean;
    isUploadingImage: boolean;
    onCancel: () => void;
    isUpdate?: boolean;
};

export function ContestActionBar({
    isSubmitting,
    isPending,
    isUploadingImage,
    onCancel,
    isUpdate = false,
}: ContestActionBarProps) {
    const isBusy = isSubmitting || isPending || isUploadingImage;
    const title = isUpdate ? "Update contest" : "Create contest";
    const description = isUpdate
        ? "Modify the details and save your changes."
        : "Fill the details and publish when ready.";
    const buttonText = isUpdate ? "Update contest" : "Create contest";
    const pendingText = isUpdate ? "Updating…" : "Creating…";

    return (
        <Card className="sticky top-0 z-20 border-border/60 bg-background/85 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <Button type="submit" disabled={isBusy} className="sm:min-w-[160px]">
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {pendingText}
                            </>
                        ) : (
                            buttonText
                        )}
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isBusy}>
                        Cancel
                    </Button>
                </div>
            </div>
        </Card>
    );
}

"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type AudiencePageHeaderProps = {
    onCreate: () => void;
};

export function AudiencePageHeader({ onCreate }: AudiencePageHeaderProps) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Audiences</h1>
                <p className="text-muted-foreground">
                    Create and manage audience groups for visibility and access.
                </p>
            </div>

            <div className="flex items-center gap-2">
                <Button type="button" onClick={onCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Audience
                </Button>
            </div>
        </div>
    );
}

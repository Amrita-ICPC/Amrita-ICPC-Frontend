"use client";

import { Button } from "@/components/ui/button";
import { Eye, Save } from "lucide-react";
import Link from "next/link";

interface QuestionCreateHeroProps {
    title?: string;
    description?: string;
    backUrl: string;
    onPreview: () => void;
    onSave?: () => void;
    isSaving?: boolean;
}

export function QuestionCreateHero({
    title = "Create Question",
    description = "Configure the metadata and requirements for your new programming challenge.",
    backUrl,
    onPreview,
    onSave,
    isSaving = false,
}: QuestionCreateHeroProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">{description}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    className="bg-background/50 border-border/60 hover:bg-muted/50 transition-colors"
                    asChild
                >
                    <Link href={backUrl}>Cancel</Link>
                </Button>

                <Button
                    variant="outline"
                    onClick={onPreview}
                    className="gap-2 h-10 border-primary/30 text-primary hover:bg-primary/10 hidden sm:flex"
                >
                    <Eye className="h-4 w-4" />
                    Preview
                </Button>

                <Button
                    className="shadow-lg shadow-primary/20 gap-2 h-10 px-6"
                    onClick={onSave}
                    disabled={isSaving}
                >
                    <Save className="h-4 w-4" />
                    Save Question
                </Button>
            </div>
        </div>
    );
}

"use client";

import { Button } from "@/components/ui/button";
import { Eye, Save } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface QuestionCreateHeroProps {
    title?: string;
    description?: string;
    backUrl: string;
    onPreview: () => void;
    isPreview?: boolean;
    onSave?: () => void;
    isSaving?: boolean;
}

export function QuestionCreateHero({
    title = "Create Question",
    description = "Configure the metadata and requirements for your new programming challenge.",
    backUrl,
    onPreview,
    isPreview = false,
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
                    className={cn(
                        "gap-2 h-10 hidden sm:flex transition-all duration-300 shadow-sm",
                        isPreview
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20"
                            : "border-primary/30 text-primary hover:bg-primary/10",
                    )}
                >
                    <Eye className={cn("h-4 w-4", isPreview && "animate-pulse")} />
                    {isPreview ? "Edit Mode" : "Preview"}
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

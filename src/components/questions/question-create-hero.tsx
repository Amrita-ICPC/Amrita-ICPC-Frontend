"use client";

import { Eye, Save } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuestionCreateHeroProps {
    description?: string;
    backUrl: string;
    onPreview: () => void;
    isPreview?: boolean;
    onSave?: () => void;
    isSaving?: boolean;
    isSaveDisabled?: boolean;
}

export function QuestionCreateHero({
    description = "Configure the metadata and requirements for your new programming challenge.",
    backUrl,
    onPreview,
    isPreview = false,
    onSave,
    isSaving = false,
    isSaveDisabled = false,
}: QuestionCreateHeroProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <Button
                    variant="outline"
                    size="sm"
                    className="border-border/60 bg-card hover:bg-muted/50 transition-colors h-9 text-xs px-4 rounded-lg font-semibold cursor-pointer"
                    asChild
                >
                    <Link href={backUrl}>Cancel</Link>
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onPreview}
                    className={cn(
                        "gap-1.5 h-9 text-xs px-4 rounded-lg font-semibold transition-all duration-300 shadow-sm cursor-pointer",
                        isPreview
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20"
                            : "border-border/60 hover:bg-muted/50 text-foreground",
                    )}
                >
                    <Eye className={cn("h-3.5 w-3.5", isPreview && "animate-pulse")} />
                    {isPreview ? "Edit" : "Preview"}
                </Button>

                <Button
                    size="sm"
                    className="shadow-sm gap-1.5 h-9 text-xs px-5 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer"
                    onClick={onSave}
                    disabled={isSaving || isSaveDisabled}
                >
                    <Save className="h-3.5 w-3.5" />
                    Save
                </Button>
            </div>
        </div>
    );
}

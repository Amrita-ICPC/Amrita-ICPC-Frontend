"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = "grid" | "table";

interface ViewToggleProps {
    view: ViewMode;
    onChange: (v: ViewMode) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
    return (
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
            <Button
                variant={view === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => onChange("grid")}
                title="Grid view"
            >
                <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
                variant={view === "table" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => onChange("table")}
                title="Table view"
            >
                <List className="h-4 w-4" />
            </Button>
        </div>
    );
}

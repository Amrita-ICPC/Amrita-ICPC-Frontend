import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    action?: ReactNode;
    className?: string;
    compact?: boolean;
}

export function EmptyState({
    title,
    description,
    icon: Icon = SearchX,
    action,
    className,
    compact = false,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "relative isolate flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border/70 bg-card/70 px-6 text-center shadow-sm",
                compact ? "min-h-40 py-8" : "min-h-[260px] py-12",
                className,
            )}
        >
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--primary)_12%,transparent),transparent_38%)]" />
            <div className="pointer-events-none absolute inset-x-10 top-0 -z-10 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />

            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary shadow-inner">
                <Icon className="size-6" />
            </div>
            <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
            {description ? (
                <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">
                    {description}
                </p>
            ) : null}
            {action ? <div className="mt-5">{action}</div> : null}
        </div>
    );
}

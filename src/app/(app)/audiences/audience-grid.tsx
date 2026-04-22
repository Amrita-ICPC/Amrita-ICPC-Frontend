"use client";

import type { AudienceResponse, AudienceType } from "@/api/generated/model";
import { Button } from "@/components/ui/button";
import { AudienceCard } from "@/components/audience/audience-card";
import { AudienceSkeleton } from "@/components/audience/audience-skeleton";

type AudienceGridProps = {
    audiences: AudienceResponse[];
    selectedType: AudienceType | null;
    isLoading: boolean;
    isError: boolean;
    onRetry: () => void;
};

export function AudienceGrid({
    audiences,
    selectedType,
    isLoading,
    isError,
    onRetry,
}: AudienceGridProps) {
    const visibleAudiences = selectedType
        ? audiences.filter((a) => String(a.audience_type) === selectedType)
        : audiences;

    if (isError) {
        return (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-border/50 bg-destructive/5 p-8 text-center text-destructive">
                <p className="mb-2 font-medium">Failed to load audiences</p>
                <p className="text-sm opacity-80">
                    Please try refreshing the page or check your connection.
                </p>
                <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <AudienceSkeleton key={i} />)
            ) : visibleAudiences.length > 0 ? (
                visibleAudiences.map((audience) => (
                    <AudienceCard key={audience.id} audience={audience} />
                ))
            ) : (
                <div className="col-span-full flex min-h-[200px] items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                    No audiences found. Try adjusting your filters.
                </div>
            )}
        </div>
    );
}

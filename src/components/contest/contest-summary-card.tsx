"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatLocalDateTime(dateTimeLocal?: string) {
    if (!dateTimeLocal) return "";
    const date = new Date(dateTimeLocal);
    if (Number.isNaN(date.getTime())) return dateTimeLocal;
    return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

type ContestSummaryCardProps = {
    name: string;
    isPublic: boolean;
    startTime?: string;
    endTime?: string;
    audienceCount: number;
};

export function ContestSummaryCard({
    name,
    isPublic,
    startTime,
    endTime,
    audienceCount,
}: ContestSummaryCardProps) {
    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle>Summary</CardTitle>
                <CardDescription>Quick review before publishing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="rounded-lg border bg-muted/10 p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-foreground">
                            {name.trim() ? name.trim() : "Untitled contest"}
                        </p>
                        <Badge variant="outline">{isPublic ? "Public" : "Private"}</Badge>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <p>
                            <span className="font-medium text-foreground/80">Starts:</span>{" "}
                            {formatLocalDateTime(startTime)}
                        </p>
                        <p>
                            <span className="font-medium text-foreground/80">Ends:</span>{" "}
                            {formatLocalDateTime(endTime)}
                        </p>
                        <p>
                            <span className="font-medium text-foreground/80">Audiences:</span>{" "}
                            {audienceCount}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

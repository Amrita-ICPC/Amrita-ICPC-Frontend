"use client";

import { Pencil, Trash2, UsersRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { AudienceResponse } from "@/api/generated/model";
import { AudienceDeleteDialog } from "@/components/audience/audience-delete-dialog";
import { AudienceEditDialog } from "@/components/audience/audience-edit-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useDeleteAudience } from "@/mutation/audience-mutation";
import { toast } from "@/lib/hooks/use-toast";
import { toApiError } from "@/lib/api/error";

function formatAudienceType(value: string) {
    return value.replace(/_/g, " ").toUpperCase();
}

function getAudienceTypeStyles(audienceType: string | null | undefined) {
    const key = String(audienceType ?? "");

    switch (key) {
        case "class":
            return {
                accent: "bg-chart-1",
                badge: "bg-chart-1/15 text-chart-1 border-chart-1/20",
            };
        case "department":
            return {
                accent: "bg-chart-2",
                badge: "bg-chart-2/15 text-chart-2 border-chart-2/20",
            };
        case "batch":
            return {
                accent: "bg-chart-3",
                badge: "bg-chart-3/15 text-chart-3 border-chart-3/20",
            };
        case "campus":
            return {
                accent: "bg-chart-4",
                badge: "bg-chart-4/15 text-chart-4 border-chart-4/20",
            };
        default:
            return {
                accent: "bg-muted",
                badge: "bg-secondary text-secondary-foreground border-border",
            };
    }
}

export function AudienceCard({ audience }: { audience: AudienceResponse }) {
    const styles = getAudienceTypeStyles(
        audience.audience_type ? String(audience.audience_type) : null,
    );

    const deleteMutation = useDeleteAudience();
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    async function onConfirmDelete() {
        try {
            await deleteMutation.mutateAsync(audience.id);
            toast(`Deleted audience: ${audience.name}`);
            setIsDeleteOpen(false);
        } catch (error) {
            const apiError = toApiError(error);
            toast(apiError.detail ?? apiError.message ?? "Failed to delete audience");
        }
    }

    return (
        <Card className="w-full max-w-[360px] group relative flex h-full flex-col gap-0 overflow-hidden py-0 transition-colors hover:bg-muted/20 focus-within:ring-2 focus-within:ring-ring/50">
            <div className={`absolute inset-x-0 top-0 h-1 ${styles.accent}`} />

            <AudienceDeleteDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                audienceName={audience.name}
                isPending={deleteMutation.isPending}
                onConfirm={onConfirmDelete}
            />

            <AudienceEditDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                audienceId={audience.id}
                audience={audience}
            />

            <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="line-clamp-1 text-base font-semibold tracking-tight">
                            {audience.name}
                        </h3>
                        {audience.description ? (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                {audience.description}
                            </p>
                        ) : (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                {"\u00A0"}
                            </p>
                        )}
                    </div>

                    <Badge
                        variant="outline"
                        className={`shrink-0 border text-[11px] ${styles.badge}`}
                    >
                        {audience.audience_type
                            ? formatAudienceType(String(audience.audience_type))
                            : "UNKNOWN"}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-4 pt-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2">
                        <span className="text-muted-foreground">Managers</span>
                        <span className="font-semibold tabular-nums">
                            {audience.manager_count ?? 0}
                        </span>
                    </div>
                    <div className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2">
                        <span className="text-muted-foreground">Instructors</span>
                        <span className="font-semibold tabular-nums">
                            {audience.instructor_count ?? 0}
                        </span>
                    </div>
                    <div className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2">
                        <span className="text-muted-foreground">Students</span>
                        <span className="font-semibold tabular-nums">
                            {audience.student_count ?? 0}
                        </span>
                    </div>
                    <div className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-semibold tabular-nums">
                            {audience.total_users ?? 0}
                        </span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="mt-auto p-4 pt-0">
                <div className="flex w-full items-center gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link href={`/audiences/${audience.id}`}>
                            <UsersRound className="mr-2 h-3.5 w-3.5" />
                            View Users
                        </Link>
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={() => setIsEditOpen(true)}
                        aria-label="Edit audience"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="shrink-0"
                        onClick={() => setIsDeleteOpen(true)}
                        disabled={deleteMutation.isPending}
                        aria-label="Delete audience"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

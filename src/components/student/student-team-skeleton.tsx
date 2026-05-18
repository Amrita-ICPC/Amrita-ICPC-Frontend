"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function StudentTeamCardSkeleton() {
    return (
        <Card className="overflow-hidden border border-border/40 bg-card">
            <CardContent className="p-5 flex flex-col space-y-5">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-24 rounded" />
                            <Skeleton className="h-4 w-12 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-16 rounded" />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-3 w-3/4 rounded" />
                </div>

                {/* Roster info */}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center -space-x-1.5">
                        <Skeleton className="h-7 w-7 rounded-full" />
                        <Skeleton className="h-7 w-7 rounded-full" />
                        <Skeleton className="h-7 w-7 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-20 rounded" />
                </div>

                {/* Divider */}
                <div className="border-t border-border/40" />

                {/* Bottom metadata */}
                <div className="flex items-center justify-between">
                    <Skeleton className="h-3.5 w-16 rounded" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <Skeleton className="h-9 flex-1 rounded-xl" />
                    <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                </div>
            </CardContent>
        </Card>
    );
}

export function StudentTeamRowSkeleton() {
    return (
        <tr className="border-b border-border/40">
            <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-28 rounded" />
                            <Skeleton className="h-3.5 w-10 rounded" />
                        </div>
                        <Skeleton className="h-2.5 w-16 rounded" />
                    </div>
                </div>
            </td>
            <td className="py-4 px-4 hidden md:table-cell">
                <Skeleton className="h-3.5 w-44 rounded" />
            </td>
            <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                    <div className="flex items-center -space-x-1">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-12 rounded" />
                </div>
            </td>

            <td className="py-4 px-4">
                <Skeleton className="h-4.5 w-12 rounded-full" />
            </td>
            <td className="py-4 px-4">
                <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-10 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                </div>
            </td>
        </tr>
    );
}

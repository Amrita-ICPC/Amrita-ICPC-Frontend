"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function StudentTeamCardSkeleton() {
    return (
        <div className="flex flex-col overflow-hidden rounded-[20px] border border-border bg-card shadow-sm dark:border-white/10 animate-pulse">
            {/* Banner */}
            <div className="relative flex min-h-[140px] flex-col border-b border-border bg-slate-100 px-6 py-5 dark:border-white/10 dark:bg-slate-800">
                <div className="flex items-center justify-between gap-3">
                    <div className="h-7 w-20 rounded-full bg-slate-200/70 dark:bg-slate-700/60" />
                    <div className="h-7 w-20 rounded-full bg-slate-200/70 dark:bg-slate-700/60" />
                </div>
                <div className="mt-auto flex items-center gap-3 pt-6">
                    <div className="h-11 w-11 rounded-xl bg-slate-200/70 dark:bg-slate-700/60" />
                    <div className="flex flex-col gap-2">
                        <div className="h-6 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                        <div className="h-3.5 w-20 rounded bg-slate-200/70 dark:bg-slate-700/60" />
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="flex min-h-[60px] flex-col justify-center gap-2 border-b border-border px-7 py-3 dark:border-white/10">
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-3/4 rounded" />
            </div>

            {/* Code + Members */}
            <div className="flex min-h-[60px] items-center border-b border-border px-7 dark:border-white/10">
                <div className="flex flex-1 items-center gap-2">
                    <Skeleton className="h-3.5 w-8 rounded" />
                    <Skeleton className="h-5 w-16 rounded" />
                </div>
                <div className="h-5 w-px bg-border dark:bg-white/10" />
                <div className="flex flex-1 items-center justify-end gap-2">
                    <div className="flex -space-x-1.5">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-4 rounded" />
                </div>
            </div>

            {/* Join Requests / Role */}
            <div className="flex min-h-[60px] items-center justify-between border-b border-border px-7 dark:border-white/10">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 px-7 py-4">
                <Skeleton className="h-9 flex-1 rounded-xl" />
                <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
            </div>
        </div>
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
                <Skeleton className="h-5 w-16 rounded" />
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

export function StudentContestSkeleton() {
    return (
        <div className="flex flex-col overflow-hidden rounded-[20px] border border-border bg-card shadow-sm dark:border-white/10 animate-pulse">
            {/* Banner */}
            <div className="relative flex min-h-[162px] flex-col border-b border-border bg-slate-100 px-7 py-6 dark:border-white/10 dark:bg-slate-800">
                <div className="flex items-center justify-between gap-3">
                    <div className="h-7 w-24 rounded-full bg-slate-200/70 dark:bg-slate-700/60" />
                    <div className="h-7 w-28 rounded-full bg-slate-200/70 dark:bg-slate-700/60" />
                </div>
                <div className="mt-auto flex flex-col gap-2 pt-6">
                    <div className="h-6 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-4 w-28 rounded bg-slate-200/70 dark:bg-slate-700/60" />
                </div>
            </div>

            {/* Description */}
            <div className="flex min-h-[60px] flex-col justify-center gap-2 border-b border-border px-7 py-3 dark:border-white/10">
                <div className="h-3.5 w-full rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3.5 w-3/4 rounded bg-slate-50 dark:bg-slate-800/60" />
            </div>

            {/* Stats Row */}
            <div className="flex min-h-[60px] items-center border-b border-border px-7 dark:border-white/10">
                <div className="flex flex-1 items-center gap-2.5 pr-3">
                    <div className="size-[18px] rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-3.5 w-16 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="h-5 w-px bg-border dark:bg-white/10" />
                <div className="flex flex-1 items-center justify-center gap-2.5 px-3">
                    <div className="size-[18px] rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-3.5 w-12 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="h-5 w-px bg-border dark:bg-white/10" />
                <div className="flex flex-1 items-center justify-end gap-2.5 pl-3">
                    <div className="size-[18px] rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-3.5 w-14 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
            </div>

            {/* Capacity */}
            <div className="flex min-h-[60px] flex-col justify-center border-b border-border px-7 py-3 dark:border-white/10">
                <div className="flex items-center justify-between">
                    <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-4 w-14 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800" />
            </div>

            {/* Footer */}
            <div className="flex flex-1 items-center justify-between px-7 py-4">
                <div className="h-3.5 w-24 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-9 w-20 rounded-lg bg-slate-200 dark:bg-slate-700" />
            </div>
        </div>
    );
}

export function StudentContestDetailSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
            {/* Left Column (Hero & Content Skeletons) */}
            <div className="lg:col-span-2 space-y-6">
                {/* Hero Card Skeleton */}
                <div className="overflow-hidden border border-slate-200/60 dark:border-white/10 rounded-2xl bg-white dark:bg-slate-900/50 shadow-sm">
                    {/* Banner Image Area */}
                    <div className="h-64 w-full bg-slate-100 dark:bg-slate-800" />

                    {/* Body Area */}
                    <div className="p-6 space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-1/3 rounded-lg bg-slate-100 dark:bg-slate-800" />
                                <div className="h-6 w-24 rounded-full bg-slate-100/50 dark:bg-slate-800/50" />
                            </div>
                            <div className="h-4 w-3/4 rounded bg-slate-50 dark:bg-slate-800/30" />
                        </div>

                        {/* Metadata Rows */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-16 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Timeline Card Skeleton */}
                <div className="border border-slate-200/60 dark:border-white/10 rounded-2xl bg-white dark:bg-slate-900/50 p-6 space-y-6 shadow-sm">
                    <div className="h-5 w-48 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative pt-2">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="flex md:flex-col items-center gap-3 md:text-center"
                            >
                                <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800" />
                                <div className="flex flex-col md:items-center gap-1.5 flex-1">
                                    <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800" />
                                    <div className="h-2 w-24 rounded bg-slate-50 dark:bg-slate-800/50" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rules Card Skeleton */}
                <div className="border border-slate-200/60 dark:border-white/10 rounded-2xl bg-white dark:bg-slate-900/50 p-6 space-y-6 shadow-sm">
                    <div className="h-5 w-32 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="space-y-3 pt-2">
                        <div className="h-4 w-full rounded bg-slate-50 dark:bg-slate-800/30" />
                        <div className="h-4 w-11/12 rounded bg-slate-50 dark:bg-slate-800/30" />
                        <div className="h-4 w-4/5 rounded bg-slate-50 dark:bg-slate-800/30" />
                        <div className="h-4 w-9/12 rounded bg-slate-50 dark:bg-slate-800/30" />
                    </div>
                </div>
            </div>

            {/* Right Column (Sidebar Skeletons) */}
            <div className="space-y-6">
                {/* Contest Control Skeleton */}
                <div className="border border-slate-200/60 dark:border-white/10 rounded-2xl bg-white dark:bg-slate-900/50 p-6 space-y-6 shadow-sm">
                    <div className="space-y-3">
                        <div className="h-4 w-28 rounded bg-slate-50 dark:bg-slate-800/50" />
                        <div className="h-10 w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <div className="h-10 w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
                </div>

                {/* Overall Registrations Skeleton */}
                <div className="border border-slate-200/60 dark:border-white/10 rounded-2xl bg-white dark:bg-slate-900/50 p-6 space-y-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="h-4 w-36 rounded bg-slate-100 dark:bg-slate-800" />
                        <div className="h-5 w-16 rounded-full bg-slate-100/50 dark:bg-slate-800/50" />
                    </div>
                    <div className="space-y-3">
                        <div className="h-6 w-24 rounded bg-slate-100 dark:bg-slate-800" />
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800" />
                    </div>
                </div>

                {/* Team Status Skeleton */}
                <div className="border border-slate-200/60 dark:border-white/10 rounded-2xl bg-white dark:bg-slate-900/50 p-6 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-800" />
                        <div className="h-5 w-16 rounded-full bg-slate-100/50 dark:bg-slate-800/50" />
                    </div>
                    <div className="space-y-3 pt-2">
                        <div className="h-3 w-16 rounded bg-slate-50 dark:bg-slate-800/50" />
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-2.5 border border-slate-100 dark:border-white/5 rounded-xl bg-slate-50/20 dark:bg-slate-900/10"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800" />
                                    <div className="h-3.5 w-24 rounded bg-slate-100 dark:bg-slate-800" />
                                </div>
                                <div className="h-4 w-12 rounded bg-slate-100 dark:bg-slate-800" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
